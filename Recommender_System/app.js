/* =====================================================================
   RecLab — real-time collaborative filtering on 4 vectors
   • Forms never reload the page.
   • Writes are per-cell (student × movie × dimension).
   • Remote changes patch only the affected DOM nodes (keyed by data-id).
   • Taste vector is weighted by how highly each film was rated overall.
   ===================================================================== */

const CONFIG = {
  room: new URLSearchParams(location.search).get("room") || sessionStorage.getItem("rl_room") || "",
  firebase: {
    apiKey: "AIzaSyAiE-bOa_K64t8YiQ5sJ8HQSN4QQo-nQA4",
    authDomain: "recommendation-lab-e4977.firebaseapp.com",
    databaseURL: "https://recommendation-lab-e4977-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "recommendation-lab-e4977",
  },
};

// ---------------- Catalogue ----------------
const DIMS = ["Action", "Comedy", "Drama", "Thriller"];
const SEED = [
  { id: "m1", title: "Interstellar", genre: "Drama", emoji: "🪐" },
  { id: "m2", title: "Blade Runner 2049", genre: "Thriller", emoji: "🌆" },
  { id: "m3", title: "The Dark Knight", genre: "Action", emoji: "🦇" },
  { id: "m4", title: "Inception", genre: "Thriller", emoji: "🌀" },
  { id: "m5", title: "The Grand Budapest Hotel", genre: "Comedy", emoji: "🏨" },
  { id: "m6", title: "Arrival", genre: "Drama", emoji: "🛸" },
  { id: "m7", title: "Parasite", genre: "Thriller", emoji: "🏠" },
  { id: "m8", title: "Mad Max: Fury Road", genre: "Action", emoji: "🏜️" },
  { id: "m9", title: "Superbad", genre: "Comedy", emoji: "😎" },
  { id: "m10", title: "Whiplash", genre: "Drama", emoji: "🥁" },
  { id: "m11", title: "The Hangover", genre: "Comedy", emoji: "🥴" },
  { id: "m12", title: "Dune", genre: "Action", emoji: "🐛" },
];
const EMOJIS = ["🎬","🍿","🚀","🪐","👽","🤖","🦇","🦸","🧙","🐉","🦖","🦁","🐼","🧟","👻","🔪","🕵️","🔫","💣","🚗","🏎️","✈️","🌊","🏜️","🏰","💘","😂","🤡","🎷","🥁","🎸","🌆","🏠","⚔️","🧛","🎃"];

const DEFAULT_ID = "m3"; // The Dark Knight: starter pick until the student's own ratings take over
// A film's genre label gives a starting estimate; classmates' ratings then refine it.
const PRIOR_HIGH = 4.5, PRIOR_LOW = 2, PRIOR_K = 1;

// ---------------- Identity (per tab) ----------------
const me = (() => {
  let id = sessionStorage.getItem("rl_student_id");
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("rl_student_id", id); }
  return { id, name: sessionStorage.getItem("rl_student_name") || "" };
})();

// ---------------- Local reactive store ----------------
// ratings: { [sid]: { name, vec: { [movieId]: { Action, Comedy, Drama, Thriller } } } }
// movies : { [id]: { id, title, genre, emoji, by, createdAt } }  (custom movies)
const listeners = new Set();
const rl_state = new Proxy(
  { ratings: {}, movies: {}, connected: false },
  { set(t, k, v) { t[k] = v; listeners.forEach((fn) => fn(k)); return true; } }
);
const subscribe = (fn) => listeners.add(fn);

/** dims: { Action: 4, Comedy: null, ... } — null removes that dimension. */
function applyCell({ student_id, student_name, movie_id, dims }) {
  const next = { ...rl_state.ratings };
  const prev = next[student_id] || { name: student_name || "Student", vec: {} };
  const vec = { ...prev.vec };
  const mv = { ...(typeof vec[movie_id] === "object" ? vec[movie_id] : {}) };
  for (const [d, v] of Object.entries(dims)) { if (v == null) delete mv[d]; else mv[d] = Number(v); }
  if (Object.keys(mv).length) vec[movie_id] = mv; else delete vec[movie_id];
  next[student_id] = { name: student_name || prev.name, vec, changed: movie_id };
  rl_state.ratings = next;
}

// ---------------- Firebase adapter ----------------
async function connectFirebase() {
  const dead = { active: false, async write() {}, async addMovie() {}, async join() {} };
  if (!CONFIG.room) return dead;

  const v = "10.12.2";
  const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`);
  const db = await import(`https://www.gstatic.com/firebasejs/${v}/firebase-database.js`);
  const app = initializeApp(CONFIG.firebase);
  const rtdb = db.getDatabase(app);
  const base = `classrooms/${CONFIG.room}`;

  const statusSnap = await db.get(db.ref(rtdb, `${base}/status`));
  if (statusSnap.val() !== "active") return dead;

  // Students: one event touches ONE student, never a full wipe
  const ratingsRef = db.ref(rtdb, `${base}/ratings`);
  const onStudent = (snap) => {
    const s = snap.val() || {};
    rl_state.ratings = {
      ...rl_state.ratings,
      [snap.key]: { name: s.name || "Student", vec: s.vec || {}, changed: s.lastMovie || snap.key },
    };
  };
  db.onChildAdded(ratingsRef, onStudent);
  db.onChildChanged(ratingsRef, onStudent);
  db.onChildRemoved(ratingsRef, (snap) => {
    const next = { ...rl_state.ratings }; delete next[snap.key]; rl_state.ratings = next;
  });

  // Custom movies, shared by the whole class
  const moviesRef = db.ref(rtdb, `${base}/movies`);
  const onMovie = (snap) => { rl_state.movies = { ...rl_state.movies, [snap.key]: { id: snap.key, ...snap.val() } }; };
  db.onChildAdded(moviesRef, onMovie);
  db.onChildChanged(moviesRef, onMovie);
  db.onChildRemoved(moviesRef, (snap) => {
    const next = { ...rl_state.movies }; delete next[snap.key]; rl_state.movies = next;
  });

  db.onValue(db.ref(rtdb, ".info/connected"), (s) => { rl_state.connected = !!s.val(); });

  return {
    active: true,
    async join({ student_id, student_name }) {
      await db.update(db.ref(rtdb, `${base}/ratings/${student_id}`), { name: student_name });
    },
    async write({ student_id, student_name, movie_id, dims }) {
      const upd = { name: student_name, lastMovie: movie_id, updatedAt: db.serverTimestamp() };
      for (const [d, val] of Object.entries(dims)) upd[`vec/${movie_id}/${d}`] = val;
      await db.update(db.ref(rtdb, `${base}/ratings/${student_id}`), upd);
    },
    async addMovie({ title, genre, emoji, by }) {
      const r = db.push(moviesRef);
      await db.set(r, { title, genre, emoji, by, createdAt: db.serverTimestamp() });
      return r.key;
    },
  };
}

// ---------------- Vectors, similarity, confidence ----------------
const hasRated = (mv) => !!mv && typeof mv === "object" && DIMS.some((d) => mv[d] != null);
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;

/**
 * A student's taste vector, weighted by how highly they rated each film overall.
 *   liked  = mean of the film's four ratings (1..5)
 *   weight = (liked - 1) / 4  → 1★ overall counts for nothing, 5★ counts fully
 * Also returns the three parts of the student's side of confidence:
 *   liking      = how many films they rated highly (full at ~3 loved films)
 *   consistency = do their loved films agree on which genres they excel in?
 */
function myTaste(sid) {
  const vec = rl_state.ratings[sid]?.vec || {};
  const rows = [];
  for (const [mid, mv] of Object.entries(vec)) {
    if (!hasRated(mv)) continue;
    const vals = DIMS.map((d) => (mv[d] != null ? Number(mv[d]) : null));
    const liked = avg(vals.filter((x) => x != null));
    const raw = (liked - 1) / 4;
    rows.push({ mid, vals, liked, raw, w: Math.max(0.05, raw) });
  }
  const v = DIMS.map((_, i) => {
    let s = 0, w = 0;
    rows.forEach((r) => { if (r.vals[i] != null) { s += r.w * r.vals[i]; w += r.w; } });
    return w ? s / w : null;
  });
  const sds = [];
  DIMS.forEach((_, i) => {
    const pts = rows.filter((r) => r.vals[i] != null);
    if (pts.length < 2) return;
    const w = pts.reduce((a, r) => a + r.w, 0);
    sds.push(Math.sqrt(pts.reduce((a, r) => a + r.w * (r.vals[i] - v[i]) ** 2, 0) / w));
  });
  const consistency = sds.length ? Math.max(0, 1 - avg(sds) / 3) : 0.6;
  const liking = Math.min(1, rows.reduce((a, r) => a + r.raw, 0) / 3);
  const loved = rows.filter((r) => r.liked >= 3.5).sort((a, b) => b.liked - a.liked).slice(0, 2)
    .map((r) => ({
      mid: r.mid, liked: r.liked,
      dim: DIMS[r.vals.indexOf(Math.max(...r.vals.filter((x) => x != null)))],
    }));
  return { v, movies: rows.length, liking, consistency, loved };
}

/**
 * A movie's class profile: its genre label gives a starting estimate (prior),
 * and every classmate's rating pulls it towards what the class really thinks.
 * `raw` holds the real ratings only (for display).
 */
function movieProfile(m) {
  const per = DIMS.map(() => []);
  let raters = 0;
  for (const s of Object.values(rl_state.ratings)) {
    const mv = s.vec?.[m.id];
    if (!hasRated(mv)) continue;
    raters++;
    DIMS.forEach((d, i) => { if (mv[d] != null) per[i].push(Number(mv[d])); });
  }
  const raw = per.map((a) => (a.length ? avg(a) : null));
  const mean = DIMS.map((d, i) => {
    const prior = d === m.genre ? PRIOR_HIGH : PRIOR_LOW;
    return (prior * PRIOR_K + per[i].reduce((x, y) => x + y, 0)) / (PRIOR_K + per[i].length);
  });
  const sd = per.map((a, i) => (a.length > 1 ? Math.sqrt(avg(a.map((x) => (x - raw[i]) ** 2))) : 0));
  return { mean, raw, raters, spread: avg(sd) };
}

/** 0..1 closeness over dimensions both vectors have (ratings run 1..5, so max gap is 4). */
function similarity(a, b) {
  let sq = 0, k = 0;
  for (let i = 0; i < DIMS.length; i++) {
    if (a[i] == null || b[i] == null) continue;
    sq += (a[i] - b[i]) ** 2; k++;
  }
  return k ? 1 - Math.sqrt(sq) / (4 * Math.sqrt(k)) : null;
}

const overall = (arr) => { const x = arr.filter((m) => m != null); return x.length ? avg(x) : 0; };
const crowdOf = (p) => 0.5 + 0.5 * Math.min(1, p.raters / 3) * Math.max(0, 1 - p.spread / 2);

function recommend(sid, movies, prof) {
  const t = myTaste(sid);
  if (!t.movies) return [];
  const mine = rl_state.ratings[sid]?.vec || {};
  return movies
    .filter((m) => !hasRated(mine[m.id]))
    .map((m) => {
      const p = prof[m.id];
      const sim = similarity(t.v, p.mean);
      if (sim == null) return null;
      const crowd = crowdOf(p);
      // confidence = your liking × your consistency × how reliable the film's profile is
      const conf = Math.round(100 * t.liking * t.consistency * crowd);
      return {
        movie: m, sim: Math.round(sim * 100), conf, raters: p.raters,
        parts: { liking: Math.round(t.liking * 100), consistency: Math.round(t.consistency * 100), crowd: Math.round(crowd * 100) },
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.sim - a.sim || b.conf - a.conf);
}

function allMovies() {
  const custom = Object.values(rl_state.movies).sort((a, b) => (b.createdAt || Infinity) - (a.createdAt || Infinity));
  return [...custom, ...SEED];
}

// ---------------- Rendering (keyed, patch-in-place) ----------------
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const initials = (n) => (n || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const hueOf = (id) => [...String(id)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const posterBg = (h) => `background: radial-gradient(circle at 30% 20%, hsl(${h} 80% 55% / .55), hsl(${(h + 40) % 360} 70% 20% / .9))`;
const firstGlyph = (s) => {
  s = (s || "").trim(); if (!s) return "";
  if (window.Intl?.Segmenter) return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)][0]?.segment || "";
  return Array.from(s)[0];
};
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
let lastPick = null;

function reconcile(rail, items, keyOf, create, update) {
  const existing = new Map([...rail.children].filter((n) => n.dataset.id).map((n) => [n.dataset.id, n]));
  rail.querySelector(".empty")?.remove();
  let prev = null;
  for (const item of items) {
    const key = keyOf(item);
    let node = existing.get(key);
    if (!node) { node = create(item); node.dataset.id = key; }
    else existing.delete(key);
    update(node, item);
    const anchor = prev ? prev.nextSibling : rail.firstChild;
    if (node !== anchor) rail.insertBefore(node, anchor);
    prev = node;
  }
  existing.forEach((n) => n.remove());
  if (!items.length) rail.innerHTML = `<p class="empty">Nothing here yet — rate a few films to get started.</p>`;
}

function movieCard(m) {
  const el = document.createElement("article");
  el.className = "card glass";
  el.innerHTML = `
    <div class="poster" style="${posterBg(hueOf(m.id))}">${esc(m.emoji || "🎬")}</div>
    <span class="score"></span>
    <div class="card-body">
      <h3>${esc(m.title)}</h3>
      <div class="chips"><span class="chip hot">${esc(m.genre || "Movie")}</span></div>
      <div class="conf hide"><span></span><i><b></b></i></div>
      ${DIMS.map((d) => `
        <div class="dimrow" data-dim="${d}"><em>${d}</em>
          <div class="stars" role="radiogroup" aria-label="${esc(m.title)} ${d}">
            ${[5, 4, 3, 2, 1].map((n) => `<button type="button" data-movie="${esc(m.id)}" data-dim="${d}" data-val="${n}" aria-label="${n} stars for ${d}">★</button>`).join("")}
          </div>
        </div>`).join("")}
    </div>`;
  return el;
}
function paintStars(card, movieId) {
  const mv = rl_state.ratings[me.id]?.vec?.[movieId];
  card.querySelectorAll(".dimrow").forEach((row) => {
    const val = (typeof mv === "object" && mv?.[row.dataset.dim]) || 0;
    row.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("on", Number(b.dataset.val) <= val);
      b.setAttribute("aria-pressed", Number(b.dataset.val) === val);
    });
  });
}
function setConf(card, c) {
  const el = card.querySelector(".conf");
  if (c == null) return el.classList.add("hide");
  el.classList.remove("hide");
  el.querySelector("span").textContent = `Confidence ${c}%`;
  el.querySelector("b").style.width = c + "%";
}

function renderTopPick({ pick, starter, t, movies, hasUnrated }) {
  $("#tpVec").textContent = t.movies
    ? "Your vector (weighted by what you loved): " + DIMS.map((d, i) => `${d} ${t.v[i] == null ? "–" : t.v[i].toFixed(1)}`).join(" · ")
    : "Your vector: —";

  if (!pick) {
    $("#tpEyebrow").textContent = "Your top pick";
    $("#tpEmoji").textContent = "🏆";
    $("#tpTitle").textContent = hasUnrated ? "—" : "You've rated everything!";
    ["#tpMatch", "#tpConf", "#tpL", "#tpC", "#tpR"].forEach((s) => ($(s).textContent = "—"));
    $("#tpWhy").textContent = "Add a new movie to keep going.";
    return;
  }

  const mv = pick.movie;
  $("#tpEmoji").textContent = mv.emoji || "🎬";
  $("#tpTitle").textContent = mv.title;

  if (pick.movie.id !== lastPick) { // swap animation whenever the pick changes
    lastPick = pick.movie.id;
    const el = $("#topPick");
    el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap");
  }

  if (starter) {
    $("#tpEyebrow").textContent = "Starter pick · rate films to personalise";
    ["#tpMatch", "#tpConf", "#tpL", "#tpC", "#tpR"].forEach((s) => ($(s).textContent = "—"));
    $("#tpWhy").textContent = "Everyone starts here. Rate films you love on the four vectors and this pick will change to match you.";
    return;
  }

  $("#tpEyebrow").textContent = "Your top pick";
  $("#tpMatch").textContent = pick.sim + "%";
  $("#tpConf").textContent = pick.conf + "%";
  $("#tpL").textContent = pick.parts.liking + "%";
  $("#tpC").textContent = pick.parts.consistency + "%";
  $("#tpR").textContent = pick.parts.crowd + "%";
  const loved = t.loved.map((l) => {
    const m = movies.find((x) => x.id === l.mid);
    return m ? `${m.title} (${l.liked.toFixed(1)}★, strongest in ${l.dim})` : null;
  }).filter(Boolean);
  $("#tpWhy").textContent =
    (loved.length ? `You loved ${loved.join(" and ")}. ` : "Your vector is still forming — rate films you love 4–5★. ") +
    (pick.raters ? `${plural(pick.raters, "classmate")} rated this film.` : "No classmate has rated this film yet, so its genre label sets the starting estimate.");
}

function render() {
  const all = rl_state.ratings;
  const movies = allMovies();
  const prof = Object.fromEntries(movies.map((m) => [m.id, movieProfile(m)]));
  const mine = all[me.id]?.vec || {};
  const t = myTaste(me.id);
  const unrated = movies.filter((m) => !hasRated(mine[m.id]));

  // Telemetry
  $("#peerCount").textContent = Object.keys(all).length;
  $("#ratingCount").textContent = Object.values(all).reduce((n, s) => n + Object.values(s.vec || {}).filter(hasRated).length, 0);

  // Top pick: personalised if we can, otherwise The Dark Knight
  const recs = recommend(me.id, movies, prof);
  let pick = recs[0] || null, starter = false;
  if (!pick) {
    const m = unrated.find((x) => x.id === DEFAULT_ID) || unrated[0];
    if (m) { pick = { movie: m }; starter = true; }
  }
  renderTopPick({ pick, starter, t, movies, hasUnrated: unrated.length > 0 });

  // Recommended rail: ranked by your vector, or Dark Knight first until you rate something
  const items = recs.length
    ? recs.map((r) => ({ movie: r.movie, label: `${r.sim}% match`, conf: r.conf }))
    : unrated.slice()
        .sort((a, b) => (b.id === DEFAULT_ID) - (a.id === DEFAULT_ID) || overall(prof[b.id].raw) - overall(prof[a.id].raw))
        .map((m) => ({
          movie: m,
          label: m.id === DEFAULT_ID ? "Starter pick" : prof[m.id].raters ? `★ ${overall(prof[m.id].raw).toFixed(1)}` : "new",
          conf: null,
        }));
  reconcile($("#railTrending"), items, (r) => "t-" + r.movie.id, (r) => movieCard(r.movie), (n, r) => {
    n.querySelector(".score").textContent = r.label; setConf(n, r.conf); paintStars(n, r.movie.id);
  });

  // Class favourites (real ratings only)
  const fav = movies.filter((m) => prof[m.id].raters)
    .map((m) => ({ m, a: overall(prof[m.id].raw), n: prof[m.id].raters })).sort((x, y) => y.a - x.a);
  reconcile($("#railTop"), fav, (x) => "f-" + x.m.id, (x) => movieCard(x.m), (n, x) => {
    n.querySelector(".score").textContent = `★ ${x.a.toFixed(1)} · ${x.n}`; setConf(n, null); paintStars(n, x.m.id);
  });

  // Catalogue (newest custom movies first)
  reconcile($("#railCatalogue"), movies, (m) => "c-" + m.id, movieCard, (n, m) => {
    const p = prof[m.id];
    n.querySelector(".score").textContent = p.raters ? `★ ${overall(p.raw).toFixed(1)} · ${p.raters}` : "new";
    setConf(n, null); paintStars(n, m.id);
  });

  // Student vectors (you first, then by similarity to you)
  const peers = Object.entries(all).map(([id, s]) => {
    const tv = myTaste(id);
    return { id, name: s.name, changed: s.changed, tv, sim: id === me.id ? 1 : similarity(t.v, tv.v) };
  }).sort((a, b) => (b.id === me.id) - (a.id === me.id) || (b.sim ?? -1) - (a.sim ?? -1));
  reconcile($("#railVectors"), peers, (p) => "v-" + p.id, () => {
    const el = document.createElement("article"); el.className = "card glass vec";
    el.innerHTML = `<div class="vec-head"><span class="avatar"></span><b class="nm"></b></div><div class="vec-grid"></div><div class="sim"></div>`;
    return el;
  }, (n, p) => {
    n.classList.toggle("me", p.id === me.id);
    n.querySelector(".avatar").textContent = initials(p.name);
    n.querySelector(".nm").textContent = p.id === me.id ? `${p.name} (you)` : p.name;
    n.querySelector(".vec-grid").innerHTML = DIMS.map((d, i) =>
      `<span class="vbadge ${p.tv.v[i] != null ? "set" : ""}"><em>${d.slice(0, 3)}</em>${p.tv.v[i] == null ? "–" : p.tv.v[i].toFixed(1)}</span>`).join("");
    n.querySelector(".sim").innerHTML = p.id === me.id
      ? `Your vector · ${plural(p.tv.movies, "film")} rated`
      : p.sim == null ? `${plural(p.tv.movies, "film")} rated · no overlap yet`
      : `Similarity to you: <b>${Math.round(p.sim * 100)}%</b> · ${plural(p.tv.movies, "film")}`;
    if (p.changed) { n.classList.remove("flash"); void n.offsetWidth; n.classList.add("flash"); }
  });
  Object.values(all).forEach((s) => delete s.changed); // one-shot highlight
}

function renderStatus() {
  const s = $("#connStatus");
  s.className = "status " + (rl_state.connected ? "live" : "offline");
  s.querySelector("span").textContent = rl_state.connected ? "Live" : "Reconnecting…";
}

let toastT;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------------- Add-movie form helpers ----------------
function markPick() {
  const v = firstGlyph($("#mvEmoji").value);
  document.querySelectorAll("#emojiPicker button").forEach((b) => b.classList.toggle("sel", b.dataset.e === v));
}
function buildPicker() {
  const box = $("#emojiPicker");
  box.innerHTML = EMOJIS.map((e) => `<button type="button" data-e="${e}">${e}</button>`).join("");
  box.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return;
    $("#mvEmoji").value = b.dataset.e; markPick();
  });
  $("#mvEmoji").addEventListener("input", markPick);
  $("#mvEmoji").value = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  markPick();
  document.querySelectorAll(".rs").forEach((r) =>
    r.addEventListener("input", () => { $("#" + r.id + "v").textContent = r.value; }));
  $("#rateNow").addEventListener("change", (e) => $("#rateBox").classList.toggle("hide", !e.target.checked));
}

// ---------------- Boot ----------------
(async function init() {
  $("#roomId").textContent = CONFIG.room || "—";
  $("#studentName").value = me.name;
  $("#classCode").value = CONFIG.room;
  $("#meAvatar").textContent = initials(me.name);
  buildPicker();

  let api = null;

  // Handlers first, so the forms work even if the database is slow or failing
  $("#profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    me.name = $("#studentName").value.trim().slice(0, 24);
    const code = $("#classCode").value.trim();
    if (!me.name || !code) return;
    sessionStorage.setItem("rl_student_name", me.name);
    $("#meAvatar").textContent = initials(me.name);
    if (code !== CONFIG.room) {
      sessionStorage.setItem("rl_room", code);
      location.href = "index.html?room=" + encodeURIComponent(code);
      return;
    }
    if (api?.active) {
      api.join({ student_id: me.id, student_name: me.name }).catch(console.error);
      toast(`Welcome, ${me.name}! Start rating.`);
    } else toast("Classroom not found or ended. Check the code.");
  });

  $("#addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!me.name) { $("#studentName").focus(); return toast("Enter your name first."); }
    if (!api?.active) return toast("Join an active classroom first.");
    const title = $("#mvTitle").value.trim().slice(0, 40);
    if (!title) return toast("Give the movie a name.");
    if (allMovies().some((m) => m.title.toLowerCase() === title.toLowerCase()))
      return toast("That movie is already in the catalogue.");
    const genre = $("#mvGenre").value;
    const emoji = firstGlyph($("#mvEmoji").value) || "🎬";
    const dims = $("#rateNow").checked
      ? Object.fromEntries(DIMS.map((d, i) => [d, Number($("#rs" + i).value)])) : null;
    try {
      const id = await api.addMovie({ title, genre, emoji, by: me.name });
      if (dims) {
        const cell = { student_id: me.id, student_name: me.name, movie_id: id, dims };
        applyCell(cell);
        await api.write(cell);
      }
      $("#mvTitle").value = "";
      $("#mvEmoji").value = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; markPick();
      toast(`${emoji} ${title} added${dims ? " and rated" : ""}.`);
    } catch (err) {
      console.error(err);
      toast("Couldn't add the movie — check your Firebase rules.");
    }
  });

  // Star clicks (event delegation) — optimistic + async persist; same star again clears it
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".stars button");
    if (!btn) return;
    e.preventDefault();
    if (!me.name) { $("#studentName").focus(); return toast("Enter your name first."); }
    if (!api?.active) return toast("Join an active classroom first.");

    const { movie, dim } = btn.dataset;
    const val = Number(btn.dataset.val);
    const cur = rl_state.ratings[me.id]?.vec?.[movie]?.[dim] ?? null;
    const rating = cur === val ? null : val;
    const cell = { student_id: me.id, student_name: me.name, movie_id: movie, dims: { [dim]: rating } };

    applyCell(cell);
    try { await api.write(cell); }
    catch (err) {
      console.error(err);
      applyCell({ ...cell, dims: { [dim]: cur } }); // roll back only this cell
      toast("Save failed — your rating was reverted.");
    }
  });

  let raf;
  subscribe((key) => {
    if (key === "connected") return renderStatus();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(render);
  });
  render(); renderStatus();

  try {
    api = await connectFirebase();
    if (CONFIG.room && !api.active) toast("Classroom not found or ended. Check the code.");
    else if (api.active && me.name) api.join({ student_id: me.id, student_name: me.name }).catch(console.error);
  } catch (err) {
    console.error(err);
    toast("Couldn't connect to the database — check config and rules.");
  }
})();