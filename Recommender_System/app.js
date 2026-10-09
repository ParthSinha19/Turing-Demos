const G = ["Action", "Comedy", "Sci-Fi", "Animation"];
const SEED = [["Spider-Man",5,3,4,1],["Avengers",5,3,5,1],["Toy Story",1,5,1,5],["Shrek",2,5,1,5],["Interstellar",4,1,5,1],["Paddington",1,5,1,4]];
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const key = t => t.trim().toLowerCase();

let S = JSON.parse(localStorage.getItem("rl_state") || "{}");
S.movies = S.movies || SEED.map(a => ({ title: a[0], v: a.slice(1) }));
S.ratings = S.ratings || {};
S.uid = S.uid || "u" + Math.random().toString(36).slice(2, 9);
S.name = S.name || ""; S.code = S.code || "";
const save = () => localStorage.setItem("rl_state", JSON.stringify(S));

let social = [], students = 0, msg = "", note = "", off = [];
let loaded = false, shownT = 0;

// ---------- the algorithm ----------
function taste() {
  let tot = 0, sum = G.map(() => 0);
  S.movies.forEach(m => { const r = S.ratings[key(m.title)]; if (r) { tot += r; m.v.forEach((x, i) => sum[i] += x * r); } });
  return tot ? sum.map(x => +(x / tot).toFixed(2)) : null;
}
const dist = (a, b) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
const simPct = d => Math.round(100 * (1 - d / (5 * Math.sqrt(G.length))));
function pool() {
  const seen = {}, all = [];
  S.movies.forEach(m => { seen[key(m.title)] = 1; all.push(m); });
  social.forEach(a => { if (!seen[key(a.title)]) { seen[key(a.title)] = 1; all.push({ title: a.title, v: a.v }); } });
  return all;
}
function ranked() {
  const t = taste();
  return pool().filter(m => !S.ratings[key(m.title)])
    .map(m => ({ m, d: t ? dist(t, m.v) : 0, sim: t ? simPct(dist(t, m.v)) : null }))
    .sort((a, b) => a.d - b.d);
}

// ---------- classroom ----------
function updateBar() {
  const bar = $("#newbar"); if (!bar) return;
  const n = social.filter(a => a.uid !== S.uid && a.t > shownT).length;
  if (n > 0) { bar.textContent = n + " new rating" + (n > 1 ? "s" : "") + " from the class. Tap to show"; bar.classList.remove("hide"); }
  else bar.classList.add("hide");
}
function listen() {
  off.forEach(f => f()); off = [];
  if (!db || !S.code) return;
  const base = "classrooms/" + S.code;
  const a = db.ref(base + "/activity").limitToLast(80);
  const fa = s => {
    social = Object.values(s.val() || {});
    if (!loaded) { loaded = true; render(); } // first load only
    else updateBar();                          // later updates: just show the button
  };
  a.on("value", fa, () => { msg = "Live classroom sharing is unavailable right now. Your recommendations still work."; render(); });
  const st = db.ref(base + "/students");
  const fs = s => { students = s.numChildren(); $("#info").textContent = "CLASSROOM " + S.code + " · STUDENTS " + students; };
  st.on("value", fs);
  off.push(() => a.off("value", fa), () => st.off("value", fs));
}
function join() {
  const c = $("#cc").value.trim(), n = $("#dn").value.trim().slice(0, 14);
  if (!c || !n) { msg = "Please enter a code and a nickname."; return draw(); }
  if (!db) { msg = "Live classroom sharing is temporarily unavailable."; return draw(); }
  db.ref("classrooms/" + c + "/status").once("value").then(s => {
    if (s.val() !== "active") { msg = "Classroom not found. Check the code."; return draw(); }
    S.code = c; S.name = n; save(); msg = ""; loaded = false;
    db.ref("classrooms/" + c + "/students/" + S.uid).set({ name: n });
    draw(); listen();
  }).catch(() => { msg = "Live classroom sharing is temporarily unavailable."; draw(); });
}
function leave() {
  if (db && S.code) db.ref("classrooms/" + S.code + "/students/" + S.uid).remove();
  S.code = ""; social = []; loaded = false; off.forEach(f => f()); off = []; save(); draw();
}

// ---------- actions ----------
function rate(k, n, title, v) {
  const before = ranked()[0];
  if (!S.movies.some(m => key(m.title) === k)) S.movies.push({ title, v });
  S.ratings[k] = n; save();
  if (db && S.code) db.ref("classrooms/" + S.code + "/activity").push({ uid: S.uid, name: S.name, title, v, stars: n, t: Date.now() });
  const after = ranked()[0];
  note = (before && after && before.m.title !== after.m.title)
    ? "Your #1 pick changed: " + before.m.title + " → " + after.m.title + ". Your recommendation changed because your data changed." : "";
  render();
}
function addMovie() {
  let t = $("#nt").value.trim();
  if (!t) { $("#ae").textContent = "Please give the movie a name."; return; }
  const base = t; let c = 2;
  while (pool().some(m => key(m.title) === key(t))) t = base + " " + c++;
  const v = G.map((g, i) => +$("#g" + i).value), r = +$("#nr").value;
  $("#ae").textContent = "";
  $("#nt").value = "";
  G.forEach((g, i) => { $("#g" + i).value = 3; $("#gv" + i).textContent = 3; });
  rate(key(t), r, t, v);
}
const stars = (cur, k, title, v) => `<div class="stars" role="group" aria-label="Rate ${esc(title)}">` +
  [1,2,3,4,5].map(n => `<button class="${n <= cur ? "on" : ""}" aria-label="${n} stars" onclick='rate(${JSON.stringify(k)},${n},${JSON.stringify(title)},${JSON.stringify(v)})'>★</button>`).join("") + `</div>`;
function why(v) {
  const t = taste(); if (!t) return "";
  return `<h4>WHY WAS THIS RECOMMENDED?</h4>` + G.map((g, i) => `<div>${g}: you ${t[i]} · movie ${v[i]}
  <div class="bar"><i style="width:${t[i] * 20}%;background:#7c5cff"></i><i style="top:0;width:${v[i] * 20}%;background:#ff3d5a;opacity:.6"></i></div></div>`).join("")
  + `<p>Distance: <b>${dist(t, v).toFixed(2)}</b></p><p class="mu">Smaller distance means greater similarity. Purple = you, red = movie.</p>`;
}
function card(m, extra, sim, id) {
  const k = key(m.title);
  return `<div class="card"><h3>${esc(m.title)}</h3>
  ${sim != null ? `<div class="big">${sim}% SIMILAR</div>` : ""}${extra || ""}
  ${stars(S.ratings[k] || 0, k, m.title, m.v)}
  ${sim != null ? `<button class="btn g" onclick="document.getElementById('${id}').classList.toggle('hide')">WHY?</button><div id="${id}" class="hide">${why(m.v)}</div>` : ""}</div>`;
}

// ---------- screens ----------
function draw() { // builds the page shell ONCE; the form is never rebuilt
  if (!S.code) {
    $("#info").textContent = "";
    $("#m").innerHTML = `<h1>RECOMMENDATION LAB</h1><p class="mu">Can you build an algorithm that knows what you like?</p>
    <div class="card"><label>CLASSROOM CODE<br><input id="cc" inputmode="numeric" maxlength="6"></label><br><br>
    <label>NICKNAME<br><input id="dn" maxlength="14"></label>
    <p class="mu">Use a nickname or first name. Don't enter personal information.</p>
    <button class="btn" onclick="join()">JOIN LAB</button><p class="err">${msg}</p></div>`;
    return;
  }
  $("#m").innerHTML = `<div id="dyn"></div>
  <button id="newbar" class="btn hide" onclick="render()"></button>
  <h2>ADD A MOVIE</h2>
  <div class="card"><input id="nt" placeholder="Movie name" maxlength="40" aria-label="Movie name">
  ${G.map((g, i) => `<p>${g}: <b id="gv${i}">3</b><input type="range" min="0" max="5" value="3" id="g${i}" aria-label="${g}" oninput="document.getElementById('gv${i}').textContent=this.value"></p>`).join("")}
  <p>Your rating: <b id="nrv">4</b><input type="range" min="1" max="5" value="4" id="nr" aria-label="Your rating" oninput="document.getElementById('nrv').textContent=this.value"></p>
  <button class="btn" onclick="addMovie()">ADD &amp; RATE</button><p class="err" id="ae"></p></div>
  <p class="mu">This is a simple content-based recommender. Real systems like Netflix, Spotify, YouTube and Amazon are much more complicated.</p>`;
  render();
}
function render() { // only redraws the feed area, never the form
  const dyn = $("#dyn"); if (!dyn) return;
  shownT = social.reduce((m, a) => Math.max(m, a.t || 0), 0);
  updateBar();
  const t = taste(), r = ranked(), top = r[0];
  const mine = S.movies.filter(m => S.ratings[key(m.title)]);
  const seen = {}, feed = social.filter(a => a.uid !== S.uid).sort((a, b) => b.t - a.t)
    .filter(a => { const k = a.uid + key(a.title); return seen[k] ? false : seen[k] = 1; }).slice(0, 10);
  dyn.innerHTML = `
  ${note ? `<p class="note pop">${esc(note)}</p>` : ""}
  <div class="hero"><p class="mu">YOUR TASTE VECTOR [${G.join(", ")}]</p>
  <div class="vec">${t ? "[" + t.join(", ") + "]" : "Rate a movie to start"}</div>
  <p>${t ? "Your ratings have become numbers, and the algorithm uses them to rank everything you haven't rated." : "Rate movies below (1 to 5 stars). Your feed will change as you do."}</p>
  ${top && t ? `<p class="mu">TOP PICK FOR YOU</p><h1>${esc(top.m.title)}</h1><div class="big">${top.sim}% SIMILAR</div>` : ""}</div>
  <p class="err">${msg}</p>
  <h2>${t ? "RECOMMENDED FOR YOU" : "START HERE"}</h2>
  <div class="row">${r.slice(0, 8).map((x, i) => card(x.m, "", x.sim, "w" + i)).join("") || '<p class="mu">You\'ve rated everything. Add a movie!</p>'}</div>
  <h2>FROM THE CLASS</h2>
  <div class="row">${feed.map((a, i) => {
    const k = key(a.title), mm = { title: a.title, v: a.v }, s = t ? simPct(dist(t, a.v)) : null;
    const line = `<p><b>${esc(a.name)}</b> rated this ${"★".repeat(a.stars)}${a.stars >= 4 && !S.ratings[k] ? " — you might like it!" : ""}</p>`;
    return card(mm, line, s, "c" + i);
  }).join("") || '<p class="mu">Nothing yet. When classmates rate movies, they appear here.</p>'}</div>
  <h2>YOUR RATINGS</h2>
  <div class="row">${mine.map(m => card(m, "", null, "")).join("") || '<p class="mu">No ratings yet.</p>'}</div>`;
}
draw(); if (S.code) listen();