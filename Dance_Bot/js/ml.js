/* The two "brains". Both learn from labelled dances (sequences of move ids) and can explain themselves.
   - tree : a decision tree that asks yes/no questions (counts, neighbouring pairs, first move, last move, length)
   - knn  : a look-alike finder (k nearest neighbours by cosine similarity on the same features)
   Pure functions, no DOM, so it can be unit tested in Node. */
(function () {
  'use strict';
  const DL = (window.DL = window.DL || {});

  /* ---------- decision tree ---------- */
  function val(f, seq) {
    if (f.t === 'c') return seq.filter(m => m === f.a).length;
    if (f.t === 'b') { let n = 0; for (let i = 0; i < seq.length - 1; i++) if (seq[i] === f.a && seq[i + 1] === f.b) n++; return n; }
    if (f.t === 'f') return seq[0] === f.a ? 1 : 0;
    if (f.t === 'l') return seq[seq.length - 1] === f.a ? 1 : 0;
    return seq.length;
  }
  function candidates(rows) {
    const m = new Set(), bg = new Set(), fs = new Set(), ls = new Set();
    rows.forEach(r => {
      const s = r.seq; s.forEach(x => m.add(x));
      for (let i = 0; i < s.length - 1; i++) bg.add(s[i] + '>' + s[i + 1]);
      fs.add(s[0]); ls.add(s[s.length - 1]);
    });
    const out = [];
    [...m].sort().forEach(a => out.push({ t: 'c', a }));
    [...bg].sort().forEach(k => { const [a, b] = k.split('>'); out.push({ t: 'b', a, b }); });
    [...fs].sort().forEach(a => out.push({ t: 'f', a }));
    [...ls].sort().forEach(a => out.push({ t: 'l', a }));
    out.push({ t: 'n' });
    return out;
  }
  const gini = (c, n) => { if (!n) return 0; let s = 1; for (const k in c) { const p = c[k] / n; s -= p * p; } return s; };
  const tally = rows => { const c = {}; rows.forEach(r => { c[r.cls] = (c[r.cls] || 0) + 1; }); return c; };
  function leaf(counts, n, order) {
    const es = Object.entries(counts).sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]));
    return { leaf: true, counts, n, cls: es[0][0], tie: es.length > 1 && es[1][1] === es[0][1] };
  }
  function grow(rows, cands, depth, order) {
    const counts = tally(rows), n = rows.length, g = gini(counts, n);
    if (g === 0 || depth >= 6) return leaf(counts, n, order);
    let best = null;
    for (const f of cands) {
      const vals = rows.map(r => val(f, r.seq));
      const u = [...new Set(vals)].sort((a, b) => a - b);
      for (let i = 0; i < u.length - 1; i++) {
        const thr = (u[i] + u[i + 1]) / 2, L = {}, R = {}; let nl = 0, nr = 0;
        rows.forEach((r, j) => { if (vals[j] > thr) { R[r.cls] = (R[r.cls] || 0) + 1; nr++; } else { L[r.cls] = (L[r.cls] || 0) + 1; nl++; } });
        const gain = g - (nl / n) * gini(L, nl) - (nr / n) * gini(R, nr);
        if (gain > 1e-9 && (!best || gain > best.gain + 1e-12)) best = { f, thr, gain };
      }
    }
    if (!best) return leaf(counts, n, order);
    const R = rows.filter(r => val(best.f, r.seq) > best.thr), L = rows.filter(r => val(best.f, r.seq) <= best.thr);
    return { f: best.f, thr: best.thr, yes: grow(R, cands, depth + 1, order), no: grow(L, cands, depth + 1, order), counts, n };
  }
  function predictTree(m, seq) {
    let node = m.tree; const path = [];
    while (!node.leaf) { const yes = val(node.f, seq) > node.thr; path.push({ f: node.f, thr: node.thr, yes }); node = yes ? node.yes : node.no; }
    return { cls: node.cls, tie: node.tie, n: node.n, counts: node.counts, conf: node.counts[node.cls] / node.n, path };
  }

  /* ---------- look-alike finder ---------- */
  function fmap(seq) {
    const f = {}, add = k => { f[k] = (f[k] || 0) + 1; };
    seq.forEach((m, i) => { add('c:' + m); if (i < seq.length - 1) add('b:' + m + '>' + seq[i + 1]); });
    if (seq.length) { add('f:' + seq[0]); add('l:' + seq[seq.length - 1]); }
    return f;
  }
  function cosine(a, b) {
    let d = 0, na = 0, nb = 0;
    for (const k in a) { na += a[k] * a[k]; if (b[k]) d += a[k] * b[k]; }
    for (const k in b) nb += b[k] * b[k];
    return na && nb ? d / Math.sqrt(na * nb) : 0;
  }
  function trainKnn(rows, order, opt) {
    const k = Math.max(1, Math.min((opt && opt.k) || 3, rows.length));
    return { type: 'knn', k, items: rows.map((r, i) => ({ id: i, seq: r.seq.slice(), cls: r.cls, fm: fmap(r.seq) })) };
  }
  function predictKnn(m, seq, order) {
    const fm = fmap(seq);
    const sc = m.items.map(it => ({ it, sim: cosine(fm, it.fm) })).sort((a, b) => b.sim - a.sim || a.it.id - b.it.id);
    const top = sc.slice(0, m.k), votes = {}, counts = {};
    top.forEach(t => { votes[t.it.cls] = (votes[t.it.cls] || 0) + t.sim + 1e-6; counts[t.it.cls] = (counts[t.it.cls] || 0) + 1; });
    const ord = order || Object.keys(votes);
    const es = Object.entries(votes).sort((a, b) => b[1] - a[1] || ord.indexOf(a[0]) - ord.indexOf(b[0]));
    const total = es.reduce((s, e) => s + e[1], 0);
    return {
      cls: es[0][0], tie: es.length > 1 && Math.abs(es[0][1] - es[1][1]) < 1e-9, n: top.length, counts,
      conf: es[0][1] / total, bestSim: top.length ? top[0].sim : 0,
      neighbours: top.map(t => ({ seq: t.it.seq, cls: t.it.cls, sim: t.sim }))
    };
  }

  /* ---------- shared API ---------- */
  function train(type, rows, order, opt) {
    if (type === 'knn') return trainKnn(rows, order, opt);
    return { type: 'tree', tree: grow(rows, candidates(rows), 0, order), order };
  }
  function predict(model, seq) {
    return model.type === 'knn' ? predictKnn(model, seq, model.order) : predictTree(model, seq);
  }
  function evaluate(model, rows) {
    if (!rows.length) return 0;
    return rows.filter(r => predict(model, r.seq).cls === r.cls).length / rows.length;
  }

  const kk = (thr) => Math.ceil(thr);
  function phrase(f, thr, nm) {
    const k = kk(thr);
    if (f.t === 'c') return thr < 1 ? `contain ${nm(f.a)}` : `contain ${nm(f.a)} at least ${k} times`;
    if (f.t === 'b') return thr < 1 ? `have ${nm(f.a)} straight before ${nm(f.b)}` : `have ${nm(f.a)} straight before ${nm(f.b)} at least ${k} times`;
    if (f.t === 'f') return `start with ${nm(f.a)}`;
    if (f.t === 'l') return `end with ${nm(f.a)}`;
    return `have ${k} or more moves`;
  }
  function phraseNeg(f, thr, nm) {
    const k = kk(thr);
    if (f.t === 'c') return thr < 1 ? `do not contain ${nm(f.a)}` : `contain ${nm(f.a)} fewer than ${k} times`;
    if (f.t === 'b') return thr < 1 ? `do not have ${nm(f.a)} straight before ${nm(f.b)}` : `have ${nm(f.a)} straight before ${nm(f.b)} fewer than ${k} times`;
    if (f.t === 'f') return `do not start with ${nm(f.a)}`;
    if (f.t === 'l') return `do not end with ${nm(f.a)}`;
    return `have fewer than ${k} moves`;
  }
  function features(seq, nm) {
    const out = [], c = {}, b = {};
    seq.forEach((m, i) => { c[m] = (c[m] || 0) + 1; if (i < seq.length - 1) { const k = m + '>' + seq[i + 1]; b[k] = (b[k] || 0) + 1; } });
    Object.entries(c).forEach(([m, n]) => out.push(`${nm(m)} x${n}`));
    Object.entries(b).forEach(([k, n]) => { const [x, y] = k.split('>'); out.push(`${nm(x)} then ${nm(y)}${n > 1 ? ' x' + n : ''}`); });
    if (seq.length) { out.push(`starts: ${nm(seq[0])}`); out.push(`ends: ${nm(seq[seq.length - 1])}`); }
    out.push(`length: ${seq.length}`);
    return out;
  }
  /* every route through the tree that ends in a leaf guessing `cls` */
  function leafPaths(node, cls, acc, out) {
    acc = acc || []; out = out || [];
    if (node.leaf) { if (node.cls === cls) out.push({ steps: acc.slice(), n: node.n, counts: node.counts }); return out; }
    acc.push({ f: node.f, thr: node.thr, yes: true }); leafPaths(node.yes, cls, acc, out); acc.pop();
    acc.push({ f: node.f, thr: node.thr, yes: false }); leafPaths(node.no, cls, acc, out); acc.pop();
    return out;
  }

  DL.ML = { train, predict, evaluate, phrase, phraseNeg, features, leafPaths };
})();
