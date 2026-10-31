/* =======================================================================
   CONFIG — filenames of the bundled datasets (same folder as index.html).
   GitHub Pages is case-sensitive: make these match your repo exactly.
   ======================================================================= */
const REPO_FILES = {
  hand: 'hand.zip',
  fist: 'Fist.zip',
  csv:  'train_2.csv'
};

/* ---------------- Navigation ---------------- */
function goPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelector('.tab[data-page="'+name+'"]').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>goPage(t.dataset.page)));

/* ---------------- Shared helper: fetch a bundled file ---------------- */
async function fetchRepoFile(url, asType){
  if(location.protocol === 'file:'){
    throw new Error('This page is open as a local file, so the browser blocks loading bundled datasets. Host it (e.g. GitHub Pages) or run a local server such as "python -m http.server".');
  }
  let res;
  try{ res = await fetch(url, {cache:'no-cache'}); }
  catch(e){ throw new Error("Couldn't reach "+url+" (network problem?)."); }
  if(!res.ok){
    throw new Error("Couldn't find "+url+" (HTTP "+res.status+"). Check the filename and capital letters in REPO_FILES at the top of app.js.");
  }
  return asType==='text' ? res.text() : res.blob();
}

function shuffleCopy(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

/* ---------------- Valid ranges + funny popups for Model 2 ---------------- */
const AGE_MIN = 0,   AGE_MAX = 120;   // change these to taste
const HOURS_MIN = 0, HOURS_MAX = 24;

const FUNNY = {
  negAge: [
    "👶 Negative age? Congratulations, you haven't been born yet!",
    "⏪ Age -2... are you a time traveller? Please use a positive number.",
    "🍼 Even AI can't predict game purchases for people who don't exist yet."
  ],
  bigAge: [
    "🧓 That age is older than the pyramids. Try something realistic!",
    "🦖 Dinosaurs don't buy video games. Pick a human age."
  ],
  negHours: [
    "🎮 Negative gaming hours? That's un-gaming. Not a thing.",
    "🔄 You can't game for less than zero hours. Even the AI is confused."
  ],
  bigHours: [
    "😴 More than 24 hours? There aren't that many hours in a day. Go to sleep!",
    "🕰 Even pro gamers need to blink. Keep it to 24 hours or less.",
    "🚀 Gaming over 24 hours? Unless you've found a way to slow down time, no."
  ]
};
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function showToast(msg){
  let t = document.getElementById('toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove('show'), 4000);
}

// Returns true if OK. Otherwise shows a funny popup and returns false.
function checkAgeHours(age, hours){
  if(isNaN(age) || isNaN(hours)){ showToast("🤔 Please fill in both Age and Hours with numbers!"); return false; }
  if(age   < AGE_MIN)   { showToast(pick(FUNNY.negAge));   return false; }
  if(age   > AGE_MAX)   { showToast(pick(FUNNY.bigAge));   return false; }
  if(hours < HOURS_MIN) { showToast(pick(FUNNY.negHours)); return false; }
  if(hours > HOURS_MAX) { showToast(pick(FUNNY.bigHours)); return false; }
  return true;
}

/* =======================================================================
   MODEL 1 — HAND vs FIST image classifier (grayscale pixel KNN)
   ======================================================================= */
const IMG_SIZE = 28; // feature grid size
let m1Data = [];   // {canvas, label, vector}
let m1Trained = false;

function rand(a,b){ return a + Math.random()*(b-a); }

// Draw a synthetic HAND or FIST onto a canvas, with controllable background brightness
function drawShape(type, bgMin, bgMax){
  const c = document.createElement('canvas'); c.width=120; c.height=120;
  const ctx = c.getContext('2d');
  const bg = rand(bgMin, bgMax);
  ctx.fillStyle = `rgb(${bg},${bg},${bg})`;
  ctx.fillRect(0,0,120,120);
  for(let i=0;i<30;i++){
    ctx.fillStyle = `rgba(${bg+rand(-15,15)},${bg+rand(-15,15)},${bg+rand(-15,15)},0.4)`;
    ctx.fillRect(rand(0,120), rand(0,120), rand(2,6), rand(2,6));
  }
  const cx = 60+rand(-6,6), cy = 66+rand(-6,6);
  const skin = `rgb(${rand(190,235)},${rand(150,190)},${rand(120,160)})`;
  ctx.fillStyle = skin; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth=2;
  if(type==='fist'){
    const r = rand(24,30);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r*0.85, rand(-0.1,0.1), 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,0.15)';
    for(let i=-1;i<=1;i++){
      ctx.beginPath(); ctx.moveTo(cx+i*10, cy-r*0.6); ctx.lineTo(cx+i*10, cy+r*0.6); ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.ellipse(cx, cy+18, 24, 26, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    const angles = [-70,-35,-8,20,48].map(a=>a*Math.PI/180);
    const lens = [30,40,44,40,32];
    angles.forEach((a,i)=>{
      const fx = cx + Math.sin(a)*8;
      const fy = cy - 4;
      const tx = fx + Math.sin(a)*lens[i];
      const ty = fy - Math.cos(a)*lens[i];
      ctx.lineWidth = 12;
      ctx.lineCap='round';
      ctx.strokeStyle = skin;
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(tx,ty); ctx.stroke();
      ctx.lineWidth=1.5; ctx.strokeStyle='rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(tx,ty); ctx.stroke();
    });
  }
  return c;
}

function canvasToVector(sourceCanvas){
  const norm = normalizeToSilhouette(sourceCanvas, IMG_SIZE);
  const ctx = norm.getContext('2d');
  const d = ctx.getImageData(0,0,IMG_SIZE,IMG_SIZE).data;
  const vec = new Float32Array(IMG_SIZE*IMG_SIZE);
  for(let i=0;i<vec.length;i++){ vec[i] = d[i*4]/255; }
  return vec;
}

// Raw (non-normalised) grayscale resize — used ONLY for the "Break the AI" bias demo,
// since normalisation would strip out the very background bias we're illustrating.
function canvasToVectorRaw(canvas){
  const tmp = document.createElement('canvas'); tmp.width=IMG_SIZE; tmp.height=IMG_SIZE;
  const tctx = tmp.getContext('2d');
  tctx.drawImage(canvas,0,0,IMG_SIZE,IMG_SIZE);
  const d = tctx.getImageData(0,0,IMG_SIZE,IMG_SIZE).data;
  const vec = new Float32Array(IMG_SIZE*IMG_SIZE);
  for(let i=0;i<vec.length;i++){ vec[i] = (d[i*4]+d[i*4+1]+d[i*4+2])/3/255; }
  return vec;
}
let m1VectorMode = 'normalized'; // 'normalized' (default) or 'raw' (bias demo only)
function computeM1Vector(canvas){ return m1VectorMode==='raw' ? canvasToVectorRaw(canvas) : canvasToVector(canvas); }

// Turns ANY source image into a centred, scaled, plain foreground-vs-background silhouette.
function normalizeToSilhouette(sourceCanvas, outSize){
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const sctx = sourceCanvas.getContext('2d');
  const data = sctx.getImageData(0,0,w,h).data;
  const gray = new Float32Array(w*h);
  for(let i=0;i<w*h;i++){ gray[i] = (data[i*4]+data[i*4+1]+data[i*4+2])/3; }

  const border = Math.max(2, Math.round(Math.min(w,h)*0.06));
  let bgSum=0, bgCount=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(x<border||x>=w-border||y<border||y>=h-border){ bgSum+=gray[y*w+x]; bgCount++; }
  }
  const bg = bgSum/bgCount;

  const THRESH = 32;
  const mask = new Uint8Array(w*h);
  let minX=w,maxX=0,minY=h,maxY=0,fgCount=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const idx=y*w+x;
    const isFg = Math.abs(gray[idx]-bg) > THRESH;
    mask[idx]=isFg?1:0;
    if(isFg){ fgCount++; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
  }
  let bx0=0,by0=0,bx1=w,by1=h;
  if(fgCount > w*h*0.01){
    const padX = Math.round((maxX-minX)*0.12)+2, padY = Math.round((maxY-minY)*0.12)+2;
    bx0=Math.max(0,minX-padX); by0=Math.max(0,minY-padY);
    bx1=Math.min(w,maxX+padX); by1=Math.min(h,maxY+padY);
  }
  const bw=Math.max(1,bx1-bx0), bh=Math.max(1,by1-by0);

  const maskCanvas = document.createElement('canvas'); maskCanvas.width=bw; maskCanvas.height=bh;
  const mctx = maskCanvas.getContext('2d');
  const mimg = mctx.createImageData(bw,bh);
  for(let y=0;y<bh;y++) for(let x=0;x<bw;x++){
    const v = mask[(by0+y)*w+(bx0+x)] ? 255 : 0;
    const di=(y*bw+x)*4;
    mimg.data[di]=v; mimg.data[di+1]=v; mimg.data[di+2]=v; mimg.data[di+3]=255;
  }
  mctx.putImageData(mimg,0,0);

  const out = document.createElement('canvas'); out.width=outSize; out.height=outSize;
  const octx = out.getContext('2d');
  octx.fillStyle='black'; octx.fillRect(0,0,outSize,outSize);
  const scale = Math.min(outSize/bw, outSize/bh);
  const dw = bw*scale, dh = bh*scale;
  octx.drawImage(maskCanvas, (outSize-dw)/2, (outSize-dh)/2, dw, dh);
  return out;
}

function addSynthetic(type){
  const canvas = drawShape(type, 30, 240);
  addM1Example(canvas, type);
}

function addM1Example(canvas, label){
  const vector = computeM1Vector(canvas);
  m1Data.push({canvas, label, vector});
  renderM1Gallery();
  m1Trained = false;
  updateM1Status();
}

function renderM1Gallery(){
  const g = document.getElementById('m1-gallery');
  g.innerHTML='';
  m1Data.forEach((ex,i)=>{
    const div = document.createElement('div');
    div.className = 'thumb '+ex.label;
    const img = document.createElement('canvas'); img.width=80; img.height=80;
    img.getContext('2d').drawImage(ex.canvas,0,0,80,80);
    const tag = document.createElement('div'); tag.className='tag'; tag.textContent=ex.label.toUpperCase();
    const del = document.createElement('button'); del.className='del'; del.textContent='×';
    del.onclick=(e)=>{e.stopPropagation(); m1Data.splice(i,1); renderM1Gallery(); m1Trained=false; updateM1Status();};
    div.append(img,tag,del);
    g.appendChild(div);
  });
  updateM1Status();
}

function updateM1Status(){
  document.getElementById('m1-count').textContent = m1Data.length+' training examples';
  document.getElementById('m1-status').textContent = 'Model: '+(m1Trained?'trained ✓':'not trained');
  document.getElementById('m1-status').classList.toggle('on', m1Trained);
  document.getElementById('m1-predictbtn').disabled = !m1Trained;
}

function clearM1(){
  m1VectorMode = 'normalized';
  m1Data=[]; m1Trained=false; renderM1Gallery();
  document.getElementById('m1-result').style.display='none';
  document.getElementById('m1-neighbors-wrap').style.display='none';
  document.getElementById('m1-bias-explain').innerHTML='';
  document.getElementById('m1-testcanvas').style.display='none';
}

function loadBuiltInDataset(biased){
  m1VectorMode = biased ? 'raw' : 'normalized';
  m1Data=[];
  const n=18;
  for(let i=0;i<n;i++){
    if(biased){
      addM1Example(drawShape('hand', 200, 255), 'hand');
      addM1Example(drawShape('fist', 0, 60), 'fist');
    } else {
      addM1Example(drawShape('hand', 30, 240), 'hand');
      addM1Example(drawShape('fist', 30, 240), 'fist');
    }
  }
  document.getElementById('m1-bias-explain').innerHTML = biased ?
    `<div class="explain bad"><span class="concept">Bias</span> Every HAND example has a light background and every FIST has a dark one. The model may now learn "light = hand, dark = fist" instead of the actual shape.</div>` : '';
  m1Trained=false; updateM1Status();
}

function trainModel1(){
  if(m1Data.length<4){ document.getElementById('m1-trainmsg').textContent='Add at least a few HAND and FIST examples first.'; return; }
  const prog = document.getElementById('m1-progress');
  let pct=0;
  prog.innerHTML='<div id="m1-progress-inner" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .15s;"></div>';
  const inner = document.getElementById('m1-progress-inner');
  document.getElementById('m1-trainmsg').innerHTML='<span class="spinner"></span>Storing feature vectors for K-Nearest-Neighbours…';
  const t = setInterval(()=>{
    pct += 20;
    inner.style.width = Math.min(pct,100)+'%';
    if(pct>=100){
      clearInterval(t);
      m1Trained = true;
      updateM1Status();
      document.getElementById('m1-trainmsg').textContent = 'Trained on '+m1Data.length+' examples. Ready to predict!';
    }
  }, 120);
}

function euclid(a,b){ let s=0; for(let i=0;i<a.length;i++){ const d=a[i]-b[i]; s+=d*d; } return Math.sqrt(s); }

function knnPredict(vector, k=3){
  const dists = m1Data.map(ex=>({label:ex.label, canvas:ex.canvas, d:euclid(vector, ex.vector)}));
  dists.sort((a,b)=>a.d-b.d);
  const top = dists.slice(0,k);
  const votes = {hand:0, fist:0};
  top.forEach(t=>votes[t.label]++);
  const label = votes.hand>=votes.fist ? 'hand':'fist';
  const confidence = votes[label]/k;
  return {label, confidence, neighbors: top};
}

let m1TestVector = null;
function loadTestImage(evt){
  const file = evt.target.files[0]; if(!file) return;
  const img = new Image();
  img.onload = ()=>{
    const canvas = document.getElementById('m1-testcanvas');
    canvas.style.display='block';
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0,120,120);
    m1TestVector = computeM1Vector(canvas);
  };
  img.src = URL.createObjectURL(file);
}
function generateTestImage(type){
  const canvas = document.getElementById('m1-testcanvas');
  canvas.style.display='block';
  const src = drawShape(type, 30, 240);
  canvas.getContext('2d').drawImage(src,0,0,120,120);
  m1TestVector = computeM1Vector(canvas);
}
function uploadTrainingImage(evt){
  const file = evt.target.files[0]; if(!file) return;
  const label = prompt("Label this image: type HAND or FIST")||'';
  const L = label.trim().toLowerCase();
  if(L!=='hand' && L!=='fist'){ alert('Please type HAND or FIST'); return; }
  const img = new Image();
  img.onload = ()=>{
    const canvas = document.createElement('canvas'); canvas.width=120; canvas.height=120;
    canvas.getContext('2d').drawImage(img,0,0,120,120);
    addM1Example(canvas, L);
  };
  img.src = URL.createObjectURL(file);
}

function predictModel1(){
  if(!m1TestVector){ alert('Upload or generate a test image first.'); return; }
  const res = knnPredict(m1TestVector, 3);
  const box = document.getElementById('m1-result'); box.style.display='flex';
  const lab = document.getElementById('m1-predlabel');
  lab.textContent = res.label.toUpperCase();
  lab.className = 'predict-result '+res.label;
  const bar = document.getElementById('m1-confbar');
  bar.className = res.label==='hand'?'conf-hand':'conf-fist';
  bar.style.width = Math.round(res.confidence*100)+'%';

  const testCanvas = document.getElementById('m1-testcanvas');
  const normPreview = document.getElementById('m1-normalized-preview');
  const normCanvas = m1VectorMode==='raw'
    ? (()=>{ const c=document.createElement('canvas'); c.width=56;c.height=56; c.getContext('2d').drawImage(testCanvas,0,0,56,56); return c; })()
    : normalizeToSilhouette(testCanvas, 56);
  normPreview.getContext('2d').drawImage(normCanvas,0,0);

  const nwrap = document.getElementById('m1-neighbors-wrap'); nwrap.style.display='block';
  const nbox = document.getElementById('m1-neighbors'); nbox.innerHTML='';
  res.neighbors.forEach(n=>{
    const div = document.createElement('div'); div.className='thumb '+n.label;
    const c = document.createElement('canvas'); c.width=64; c.height=64;
    c.getContext('2d').drawImage(n.canvas,0,0,64,64);
    const tag = document.createElement('div'); tag.className='tag'; tag.textContent=n.label.toUpperCase();
    div.append(c,tag); nbox.appendChild(div);
  });
}

function runBiasTest(){
  if(!m1Trained){ alert('Load the biased dataset and train the model first.'); return; }
  const handOnDark = drawShape('hand', 0, 60);
  const fistOnLight = drawShape('fist', 200, 255);
  const r1 = knnPredict(computeM1Vector(handOnDark),3);
  const r2 = knnPredict(computeM1Vector(fistOnLight),3);
  const wrong1 = r1.label!=='hand', wrong2 = r2.label!=='fist';
  let html = '<div class="explain '+((wrong1||wrong2)?'bad':'')+'">';
  html += `A real HAND shape on a <b>dark</b> background was predicted as <b>${r1.label.toUpperCase()}</b>. `;
  html += `A real FIST shape on a <b>light</b> background was predicted as <b>${r2.label.toUpperCase()}</b>.<br><br>`;
  if(wrong1||wrong2){
    html += '<b>The model may have learned something about the background rather than the hand itself.</b> That\'s <span class="concept">bias</span> in action.';
  } else {
    html += 'This time it got both right — try training on a smaller/more biased set, or run it again, to increase the chance of seeing the bias.';
  }
  html += '</div>';
  document.getElementById('m1-bias-explain').innerHTML = html;
}

/* ---------------- Live camera capture (Model 1) ---------------- */
let cameraStream = null;
let cameraTarget = null;

async function openCamera(target){
  cameraTarget = target;
  const overlay = document.getElementById('camera-overlay');
  const video = document.getElementById('camera-video');
  const msg = document.getElementById('camera-msg');
  const capBtn = document.getElementById('camera-capture-btn');
  document.getElementById('camera-title').textContent = target==='train' ? '📷 Add a training example' : '📷 Capture a test image';
  overlay.style.display='flex';
  msg.textContent = 'Requesting camera permission…';
  capBtn.disabled = true;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    msg.textContent = "This browser/page doesn't support camera access. Try uploading a photo instead.";
    return;
  }
  try{
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}, audio:false});
    video.srcObject = cameraStream;
    msg.textContent = 'Line up your hand and capture.';
    capBtn.disabled = false;
  }catch(e){
    msg.textContent = 'Camera permission was denied or no camera is available. Try uploading a photo instead.';
  }
}
function closeCamera(){
  if(cameraStream){ cameraStream.getTracks().forEach(t=>t.stop()); cameraStream=null; }
  document.getElementById('camera-overlay').style.display='none';
}
function captureCameraFrame(){
  const video = document.getElementById('camera-video');
  const canvas = document.createElement('canvas'); canvas.width=120; canvas.height=120;
  const ctx = canvas.getContext('2d');
  const scale = Math.max(120/video.videoWidth, 120/video.videoHeight);
  const w = video.videoWidth*scale, h = video.videoHeight*scale;
  ctx.translate(120,0); ctx.scale(-1,1);
  ctx.drawImage(video, (120-w)/2, (120-h)/2, w, h);
  if(cameraTarget==='train'){
    const label = (prompt('Label this capture: type HAND or FIST')||'').trim().toLowerCase();
    if(label==='hand' || label==='fist'){ addM1Example(canvas, label); }
    else if(label!==''){ alert('Please type HAND or FIST.'); }
  } else {
    const testCanvas = document.getElementById('m1-testcanvas');
    testCanvas.style.display='block';
    testCanvas.getContext('2d').drawImage(canvas,0,0,120,120);
    m1TestVector = computeM1Vector(testCanvas);
  }
  closeCamera();
}

/* ---------------- Model 1 ZIP import (manual upload + bundled library) ---------------- */
const MAX_PER_CLASS_FROM_ZIP = 40; // default for manual ZIP upload

function labelFromPath(path){
  const segs = path.toLowerCase().split('/');
  for(const s of segs){ if(s.includes('hand')) return 'hand'; }
  for(const s of segs){ if(s.includes('fist') || s.includes('punch')) return 'fist'; }
  return null;
}

function loadImageToCanvas(blob){
  return new Promise((resolve,reject)=>{
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = ()=>{
      const canvas = document.createElement('canvas'); canvas.width=120; canvas.height=120;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(120/img.width, 120/img.height);
      const w = img.width*scale, h = img.height*scale;
      ctx.drawImage(img, (120-w)/2, (120-h)/2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

/*
  Core ZIP reader used by BOTH manual upload and the bundled library.
  - zipBlob:     the ZIP (File or Blob)
  - forcedLabel: 'hand' | 'fist' to label EVERYTHING in the ZIP, or null to read labels from folder names
  - maxPerClass: cap per label (images are picked at random)
  - ui:          {wrap, bar, msg} elements for progress
  Returns {added, counts, skippedLabel, skippedCap, skippedBad}
*/
async function importZipBlob(zipBlob, forcedLabel, maxPerClass, ui){
  if(typeof JSZip === 'undefined'){
    throw new Error("Couldn't load the ZIP reader (no internet access?). Try uploading images one at a time instead.");
  }
  const zip = await JSZip.loadAsync(zipBlob);
  let entries = Object.values(zip.files).filter(f=>!f.dir && /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name) && !f.name.includes('__MACOSX'));
  if(entries.length===0) throw new Error('No image files found inside that ZIP.');
  entries = shuffleCopy(entries); // random sample, so we don't just get the first N alphabetically

  const counts = {hand:0, fist:0};
  let processed=0, added=0, skippedLabel=0, skippedCap=0, skippedBad=0;

  for(const entry of entries){
    processed++;
    ui.bar.style.width = Math.round(processed/entries.length*100)+'%';
    ui.msg.textContent = `Processing ${processed}/${entries.length} images…`;
    const label = forcedLabel || labelFromPath(entry.name);
    if(!label){ skippedLabel++; continue; }
    if(counts[label] >= maxPerClass){ skippedCap++; continue; }
    try{
      const blob = await entry.async('blob');
      const canvas = await loadImageToCanvas(blob);
      addM1Example(canvas, label);
      counts[label]++; added++;
    }catch(e){ skippedBad++; }
    if(processed % 4 === 0) await new Promise(r=>setTimeout(r,0));
  }
  return {added, counts, skippedLabel, skippedCap, skippedBad};
}

function summariseZipResult(r, maxPerClass){
  let m = `Added ${r.added} images (${r.counts.hand} hand, ${r.counts.fist} fist).`;
  if(r.skippedLabel) m += ` ${r.skippedLabel} skipped — couldn't tell the label from their folder/filename.`;
  if(r.skippedCap) m += ` ${r.skippedCap} skipped — over the ${maxPerClass}-per-class cap (keeps things fast).`;
  if(r.skippedBad) m += ` ${r.skippedBad} skipped — couldn't be read as images.`;
  return m;
}

// Manual upload
async function uploadZipDataset(evt){
  m1VectorMode = 'normalized';
  const file = evt.target.files[0]; if(!file) return;
  const ui = {
    wrap: document.getElementById('m1-zip-progresswrap'),
    bar:  document.getElementById('m1-zip-progress'),
    msg:  document.getElementById('m1-zip-msg')
  };
  ui.wrap.style.display='block'; ui.bar.style.width='0%';
  ui.msg.innerHTML = '<span class="spinner"></span>Reading ZIP file…';
  try{
    const r = await importZipBlob(file, null, MAX_PER_CLASS_FROM_ZIP, ui);
    ui.wrap.style.display='none';
    ui.msg.textContent = summariseZipResult(r, MAX_PER_CLASS_FROM_ZIP);
  }catch(e){
    ui.wrap.style.display='none';
    ui.msg.textContent = e.message || "Couldn't read that ZIP file — make sure it's a standard .zip archive.";
  }
  evt.target.value = '';
}

// Bundled library: which = 'hand' | 'fist' | 'both'
async function loadRepoZip(which){
  m1VectorMode = 'normalized';
  const ui = {
    wrap: document.getElementById('m1-repo-progresswrap'),
    bar:  document.getElementById('m1-repo-progress'),
    msg:  document.getElementById('m1-repo-msg')
  };
  const maxPer = Math.max(5, Math.min(200, +document.getElementById('m1-maxper').value || 40));
  const jobs = which==='both' ? ['hand','fist'] : [which];

  if(which==='both'){
    m1Data = []; m1Trained = false; renderM1Gallery();
    document.getElementById('m1-bias-explain').innerHTML='';
  }

  ui.wrap.style.display='block'; ui.bar.style.width='0%';
  const summaries = [];
  try{
    for(const label of jobs){
      ui.msg.innerHTML = `<span class="spinner"></span>Downloading ${REPO_FILES[label]}…`;
      const blob = await fetchRepoFile(REPO_FILES[label], 'blob');
      ui.bar.style.width='0%';
      const r = await importZipBlob(blob, label, maxPer, ui);
      summaries.push(`${REPO_FILES[label]}: added ${r.added}${r.skippedBad?` (${r.skippedBad} unreadable)`:''}`);
    }
    ui.wrap.style.display='none';
    ui.msg.textContent = '✓ ' + summaries.join(' · ') + `. Now press TRAIN MODEL.`;
  }catch(e){
    ui.wrap.style.display='none';
    ui.msg.textContent = '⚠ ' + (e.message || "Couldn't load the dataset.");
  }
}

/* ---------------- Model 1 dataset persistence ---------------- */
const M1_KEY = 'ailab_m1_dataset_v1';

function saveM1Dataset(){
  try{
    const packed = m1Data.map(ex=>({label:ex.label, dataURL:ex.canvas.toDataURL('image/png')}));
    localStorage.setItem(M1_KEY, JSON.stringify(packed));
    document.getElementById('m1-savemsg').textContent = 'Saved '+packed.length+' examples to this browser.';
    document.getElementById('m1-loadsaved-btn').disabled = false;
  }catch(e){
    document.getElementById('m1-savemsg').textContent = "Couldn't save (storage unavailable or too large for this browser).";
  }
}
function loadM1DataFromPacked(packed, done){
  m1Data = [];
  let remaining = packed.length;
  if(remaining===0){ renderM1Gallery(); m1Trained=false; updateM1Status(); if(done) done(); return; }
  packed.forEach(item=>{
    const img = new Image();
    img.onload = ()=>{
      const canvas = document.createElement('canvas'); canvas.width=120; canvas.height=120;
      canvas.getContext('2d').drawImage(img,0,0,120,120);
      m1Data.push({canvas, label:item.label, vector:computeM1Vector(canvas)});
      remaining--;
      if(remaining===0){ renderM1Gallery(); m1Trained=false; updateM1Status(); if(done) done(); }
    };
    img.src = item.dataURL;
  });
}
function loadM1Dataset(){
  m1VectorMode = 'normalized';
  try{
    const raw = localStorage.getItem(M1_KEY);
    if(!raw){ document.getElementById('m1-savemsg').textContent='No saved dataset found in this browser.'; return; }
    const packed = JSON.parse(raw);
    loadM1DataFromPacked(packed, ()=>{
      document.getElementById('m1-savemsg').textContent = 'Loaded '+packed.length+' saved examples.';
    });
  }catch(e){
    document.getElementById('m1-savemsg').textContent = "Couldn't load saved dataset.";
  }
}
function exportM1Dataset(){
  const packed = m1Data.map(ex=>({label:ex.label, dataURL:ex.canvas.toDataURL('image/png')}));
  const blob = new Blob([JSON.stringify(packed)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'hand_fist_dataset.json';
  document.body.appendChild(a); a.click(); a.remove();
}
function importM1Dataset(evt){
  m1VectorMode = 'normalized';
  const file = evt.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const packed = JSON.parse(reader.result);
      loadM1DataFromPacked(packed, ()=>{
        document.getElementById('m1-savemsg').textContent = 'Imported '+packed.length+' examples from file.';
      });
    }catch(e){
      document.getElementById('m1-savemsg').textContent = 'That file could not be read as a dataset.';
    }
  };
  reader.readAsText(file);
}
function checkM1SavedAvailable(){
  try{
    if(localStorage.getItem(M1_KEY)){ document.getElementById('m1-loadsaved-btn').disabled = false; }
  }catch(e){}
}

/* =======================================================================
   MODEL 2 — Decision Tree for video game buyer prediction
   ======================================================================= */
const ORIGINAL_M2 = [
  {age:14,hours:8,console:'Yes',bought:'Yes'},
  {age:15,hours:10,console:'Yes',bought:'Yes'},
  {age:16,hours:7,console:'Yes',bought:'Yes'},
  {age:15,hours:2,console:'No',bought:'No'},
  {age:14,hours:3,console:'No',bought:'No'},
  {age:17,hours:1,console:'No',bought:'No'},
  {age:16,hours:9,console:'Yes',bought:'Yes'},
  {age:15,hours:1,console:'No',bought:'No'},
];
function biasedM2(){
  return [
    {age:14,hours:1,console:'Yes',bought:'Yes'},
    {age:15,hours:12,console:'Yes',bought:'Yes'},
    {age:16,hours:2,console:'Yes',bought:'Yes'},
    {age:17,hours:9,console:'Yes',bought:'Yes'},
    {age:15,hours:11,console:'No',bought:'No'},
    {age:14,hours:9,console:'No',bought:'No'},
    {age:16,hours:1,console:'No',bought:'No'},
    {age:15,hours:0,console:'No',bought:'No'},
  ];
}
let m2Data = ORIGINAL_M2.map(r=>({...r}));
let m2Tree = null;

function renderM2Table(){
  const tbody = document.getElementById('m2-tbody');
  tbody.innerHTML='';
  m2Data.forEach((r,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.age}</td><td>${r.hours}</td><td>${r.console}</td>
      <td style="color:${r.bought==='Yes'?'var(--good)':'var(--bad)'};font-weight:800;">${r.bought}</td>
      <td><button class="btn small secondary" onclick="removeM2Row(${i})">×</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('m2-count').textContent = m2Data.length+' training examples';
}
function clearM2TrainedState(){
  m2Tree = null;
  const badges = document.getElementById('m2-accuracy-badges'); if(badges) badges.innerHTML='';
  const treeEl = document.getElementById('m2-tree'); if(treeEl) treeEl.innerHTML = '<p class="small-muted">Train the model to see its tree.</p>';
  const mf = document.getElementById('m2-mainfeature'); if(mf) mf.textContent='';
  updateM2Status();
}
function addM2Row(){
  const age = parseFloat(document.getElementById('m2-newage').value);
  const hours = parseFloat(document.getElementById('m2-newhours').value);
  if(!checkAgeHours(age, hours)) return;
  m2Data.push({
    age, hours,
    console:document.getElementById('m2-newconsole').value,
    bought:document.getElementById('m2-newbought').value
  });
  renderM2Table(); clearM2TrainedState();
}
function removeM2Row(i){ m2Data.splice(i,1); renderM2Table(); clearM2TrainedState(); }
function resetM2Data(biased){
  m2Data = (biased?biasedM2():ORIGINAL_M2).map(r=>({...r}));
  renderM2Table(); clearM2TrainedState();
  document.getElementById('m2-bias-explain').innerHTML = biased ?
    `<div class="explain bad"><span class="concept">Bias</span> Console ownership now lines up almost perfectly with buying — while gaming hours barely matter. Train it and see which feature the tree picks first.</div>` : '';
}
function updateM2Status(){
  document.getElementById('m2-status').textContent = 'Model: '+(m2Tree?'trained ✓':'not trained');
  document.getElementById('m2-status').classList.toggle('on', !!m2Tree);
  document.getElementById('m2-predictbtn').disabled = !m2Tree;
}

// --- simple decision tree (Gini impurity) ---
function gini(rows){
  if(rows.length===0) return 0;
  const yes = rows.filter(r=>r.bought==='Yes').length;
  const p = yes/rows.length;
  return 1 - p*p - (1-p)*(1-p);
}
function splitCandidates(rows){
  const cands = [];
  ['age','hours'].forEach(feat=>{
    const vals = [...new Set(rows.map(r=>r[feat]))].sort((a,b)=>a-b);
    for(let i=0;i<vals.length-1;i++){
      const thresh = (vals[i]+vals[i+1])/2;
      cands.push({feat, type:'numeric', thresh});
    }
  });
  cands.push({feat:'console', type:'categorical', value:'Yes'});
  return cands;
}
function applySplit(rows, cand){
  if(cand.type==='numeric'){
    return [rows.filter(r=>r[cand.feat]<=cand.thresh), rows.filter(r=>r[cand.feat]>cand.thresh)];
  } else {
    return [rows.filter(r=>r[cand.feat]===cand.value), rows.filter(r=>r[cand.feat]!==cand.value)];
  }
}
function buildTree(rows, depth, maxDepth, minLeaf){
  const allYes = rows.every(r=>r.bought==='Yes');
  const allNo = rows.every(r=>r.bought==='No');
  if(allYes) return {leaf:true, label:'Yes', n:rows.length};
  if(allNo) return {leaf:true, label:'No', n:rows.length};
  if(depth>=maxDepth || rows.length<2){
    const yes = rows.filter(r=>r.bought==='Yes').length;
    return {leaf:true, label: yes>=rows.length/2 ? 'Yes':'No', n:rows.length};
  }
  let best=null, bestScore=Infinity;
  splitCandidates(rows).forEach(cand=>{
    const [l,r] = applySplit(rows,cand);
    if(l.length<minLeaf || r.length<minLeaf) return;
    const score = (l.length*gini(l) + r.length*gini(r))/rows.length;
    if(score<bestScore){ bestScore=score; best={cand,l,r}; }
  });
  if(!best){
    const yes = rows.filter(r=>r.bought==='Yes').length;
    return {leaf:true, label: yes>=rows.length/2 ? 'Yes':'No', n:rows.length};
  }
  return {
    leaf:false,
    feat: best.cand.feat,
    type: best.cand.type,
    thresh: best.cand.thresh,
    value: best.cand.value,
    left: buildTree(best.l, depth+1, maxDepth, minLeaf),
    right: buildTree(best.r, depth+1, maxDepth, minLeaf)
  };
}
function treeAccuracy(tree, rows){
  if(rows.length===0) return null;
  let correct=0;
  rows.forEach(r=>{ if(traverseTree(tree,r)===r.bought) correct++; });
  return correct/rows.length;
}
function trainModel2(){
  const prog = document.getElementById('m2-progress');
  prog.innerHTML='<div id="m2-progress-inner" style="height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .15s;"></div>';
  const inner = document.getElementById('m2-progress-inner');
  document.getElementById('m2-trainmsg').innerHTML='<span class="spinner"></span>Splitting data to build the tree…';
  document.getElementById('m2-accuracy-badges').innerHTML='';
  const maxDepth = Math.max(1, Math.min(6, +document.getElementById('m2-depth').value || 3));
  const minLeaf = Math.max(1, Math.round(m2Data.length*0.02));
  let pct=0;
  const t=setInterval(()=>{
    pct+=25; inner.style.width=Math.min(pct,100)+'%';
    if(pct>=100){
      clearInterval(t);

      const badges = document.getElementById('m2-accuracy-badges');
      if(m2Data.length>=10){
        const shuffled = shuffleCopy(m2Data);
        const splitAt = Math.floor(shuffled.length*0.8);
        const trainRows = shuffled.slice(0,splitAt);
        const testRows = shuffled.slice(splitAt);
        const evalTree = buildTree(trainRows, 0, maxDepth, Math.max(1,Math.round(trainRows.length*0.02)));
        const trainAcc = treeAccuracy(evalTree, trainRows);
        const testAcc = treeAccuracy(evalTree, testRows);
        badges.innerHTML = `<span class="badge on">Training accuracy: ${Math.round(trainAcc*100)}%</span>
          <span class="badge ${testAcc<trainAcc-0.15?'':'on'}">Test accuracy (unseen data): ${Math.round(testAcc*100)}%</span>`;
      } else {
        const trainAcc = treeAccuracy(buildTree(m2Data,0,maxDepth,minLeaf), m2Data);
        badges.innerHTML = `<span class="badge on">Training accuracy: ${Math.round(trainAcc*100)}%</span>
          <span class="badge">Add more rows (10+) to see test accuracy on unseen data</span>`;
      }

      m2Tree = buildTree(m2Data, 0, maxDepth, minLeaf);
      updateM2Status();
      document.getElementById('m2-trainmsg').textContent = 'Trained on '+m2Data.length+' examples (max depth '+maxDepth+'). Tree ready below.';
      renderTree();
      const root = m2Tree;
      const mainFeat = root.leaf ? 'a single class (no split needed)' : (root.feat==='console'?'Owns a console':root.feat==='age'?'Age':'Gaming hours');
      document.getElementById('m2-mainfeature').textContent = 'First (most important) question the tree asks: '+mainFeat;
    }
  },130);
}
function nodeLabel(node){
  if(node.leaf) return null;
  if(node.feat==='console') return 'Owns Console?';
  if(node.feat==='age') return 'Age ≤ '+node.thresh+'?';
  return 'Hours ≤ '+node.thresh+'?';
}
function renderTree(){
  const container = document.getElementById('m2-tree');
  container.innerHTML='';
  function build(node){
    const wrap = document.createElement('div'); wrap.style.display='flex'; wrap.style.flexDirection='column'; wrap.style.alignItems='center';
    if(node.leaf){
      const box = document.createElement('div');
      box.className = 'tnode leaf '+(node.label==='Yes'?'buy':'nobuy');
      box.textContent = node.label==='Yes' ? '✅ BUY' : '❌ DON\'T BUY';
      wrap.appendChild(box);
      return wrap;
    }
    const box = document.createElement('div'); box.className='tnode'; box.textContent = nodeLabel(node);
    wrap.appendChild(box);
    const level = document.createElement('div'); level.className='tlevel';
    const leftB = document.createElement('div'); leftB.className='tbranch';
    const leftLbl = document.createElement('div'); leftLbl.className='lbl'; leftLbl.textContent = 'YES';
    leftB.appendChild(leftLbl); leftB.appendChild(build(node.left));
    const rightB = document.createElement('div'); rightB.className='tbranch';
    const rightLbl = document.createElement('div'); rightLbl.className='lbl'; rightLbl.textContent = 'NO';
    rightB.appendChild(rightLbl); rightB.appendChild(build(node.right));
    level.appendChild(leftB); level.appendChild(rightB);
    wrap.appendChild(level);
    return wrap;
  }
  container.appendChild(build(m2Tree));
}
function traverseTree(node, person){
  if(node.leaf) return node.label;
  let goLeft;
  if(node.type==='categorical') goLeft = person[node.feat]===node.value;
  else goLeft = person[node.feat] <= node.thresh;
  return traverseTree(goLeft?node.left:node.right, person);
}
function predictModel2(){
  if(!m2Tree) return;
  const age = parseFloat(document.getElementById('m2-page').value);
  const hours = parseFloat(document.getElementById('m2-phours').value);
  if(!checkAgeHours(age, hours)) return;
  const person = {
    age, hours,
    console:document.getElementById('m2-pconsole').value
  };
  const result = traverseTree(m2Tree, person);
  const box = document.getElementById('m2-result'); box.style.display='flex';
  const lab = document.getElementById('m2-predlabel');
  lab.textContent = result==='Yes' ? 'BUY ✅' : "DON'T BUY ❌";
  lab.className = 'predict-result '+(result==='Yes'?'buy':'nobuy');
}

/* ---------------- Model 2 dataset persistence ---------------- */
const M2_KEY = 'ailab_m2_dataset_v1';

function saveM2Dataset(){
  try{
    localStorage.setItem(M2_KEY, JSON.stringify(m2Data));
    document.getElementById('m2-savemsg').textContent = 'Saved '+m2Data.length+' rows to this browser.';
    document.getElementById('m2-loadsaved-btn').disabled = false;
  }catch(e){
    document.getElementById('m2-savemsg').textContent = "Couldn't save (storage unavailable in this browser).";
  }
}
function loadM2Dataset(){
  try{
    const raw = localStorage.getItem(M2_KEY);
    if(!raw){ document.getElementById('m2-savemsg').textContent='No saved dataset found in this browser.'; return; }
    m2Data = JSON.parse(raw);
    renderM2Table(); clearM2TrainedState();
    document.getElementById('m2-savemsg').textContent = 'Loaded '+m2Data.length+' saved rows.';
  }catch(e){
    document.getElementById('m2-savemsg').textContent = "Couldn't load saved dataset.";
  }
}
function exportM2Dataset(){
  const blob = new Blob([JSON.stringify(m2Data)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'game_buyer_dataset.json';
  document.body.appendChild(a); a.click(); a.remove();
}
function exportM2Csv(){
  const lines = ['Age,Hours,Console,Bought'];
  m2Data.forEach(r=>lines.push(`${r.age},${r.hours},${r.console},${r.bought}`));
  const blob = new Blob([lines.join('\n')], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'game_buyer_dataset.csv';
  document.body.appendChild(a); a.click(); a.remove();
}
function importM2Dataset(evt){
  const file = evt.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      m2Data = JSON.parse(reader.result);
      renderM2Table(); clearM2TrainedState();
      document.getElementById('m2-savemsg').textContent = 'Imported '+m2Data.length+' rows from file.';
    }catch(e){
      document.getElementById('m2-savemsg').textContent = 'That file could not be read as a dataset.';
    }
  };
  reader.readAsText(file);
}

/* ---------------- Model 2 CSV import (manual upload + bundled library) ---------------- */
const MAX_M2_ROWS = 400;

function parseCsvLine(line){
  const out=[]; let cur=''; let inQuotes=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){ inQuotes=!inQuotes; continue; }
    if(c===','&&!inQuotes){ out.push(cur); cur=''; continue; }
    cur+=c;
  }
  out.push(cur);
  return out.map(s=>s.trim());
}
function normBoolish(v){
  const s = (''+v).trim().toLowerCase();
  if(['yes','y','true','1'].includes(s)) return 'Yes';
  if(['no','n','false','0'].includes(s)) return 'No';
  return null;
}

// Shared parser: takes CSV text, updates the table, returns a status message
function importM2CsvText(text){
  const rawLines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
  if(rawLines.length<2) return 'That CSV has no data rows.';
  const headers = parseCsvLine(rawLines[0]).map(h=>h.toLowerCase());
  const findCol = (keywords)=> headers.findIndex(h=>keywords.some(k=>h.includes(k)));
  const ageCol = findCol(['age']);
  const hoursCol = findCol(['hour']);
  const consoleCol = findCol(['console','owns']);
  const boughtCol = findCol(['bought','buy','purchase']);
  if(ageCol<0 || hoursCol<0 || consoleCol<0 || boughtCol<0){
    return "Couldn't find all four columns (Age, Hours, Console, Bought) in the header row. Headers found: " + headers.join(', ');
  }
  let rows=[], skipped=0; outOfRange = 0;
  for(let i=1;i<rawLines.length;i++){
    const cells = parseCsvLine(rawLines[i]);
    const age = parseFloat(cells[ageCol]);
    const hours = parseFloat(cells[hoursCol]);
    const console_ = normBoolish(cells[consoleCol]);
    const bought = normBoolish(cells[boughtCol]);
    if(age<AGE_MIN || age>AGE_MAX || hours<HOURS_MIN || hours>HOURS_MAX){ outOfRange++; continue; }
    rows.push({age, hours, console:console_, bought});
  }
  let capNote = '';
  if(rows.length > MAX_M2_ROWS){
    rows = shuffleCopy(rows).slice(0, MAX_M2_ROWS);
    capNote = ` (capped to a random ${MAX_M2_ROWS} rows to keep things fast)`;
  }
  if(rows.length===0) return 'No valid rows could be read from that CSV.';
  m2Data = rows;
  renderM2Table(); clearM2TrainedState();
    if(outOfRange) showToast(`🚨 ${outOfRange} row(s) had impossible ages or gaming hours (like a -2-year-old gamer or a 30-hour day), so I ignored them!`);
  return `Imported ${rows.length} rows from CSV${capNote}.` +
    (skipped?` ${skipped} rows skipped (missing/invalid values).`:'') +
    (outOfRange?` ${outOfRange} rows skipped (age outside ${AGE_MIN}-${AGE_MAX} or hours outside ${HOURS_MIN}-${HOURS_MAX}).`:'');
}

function uploadM2Csv(evt){
  const file = evt.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      document.getElementById('m2-savemsg').textContent = importM2CsvText(reader.result);
    }catch(e){
      document.getElementById('m2-savemsg').textContent = "Couldn't read that CSV file.";
    }
  };
  reader.readAsText(file);
  evt.target.value = '';
}

async function loadRepoCsv(){
  const msg = document.getElementById('m2-repo-msg');
  msg.innerHTML = '<span class="spinner"></span>Downloading '+REPO_FILES.csv+'…';
  try{
    const text = await fetchRepoFile(REPO_FILES.csv, 'text');
    msg.textContent = '✓ ' + importM2CsvText(text) + ' Now press TRAIN MODEL.';
  }catch(e){
    msg.textContent = '⚠ ' + (e.message || "Couldn't load the CSV.");
  }
}

function checkM2SavedAvailable(){
  try{
    if(localStorage.getItem(M2_KEY)){ document.getElementById('m2-loadsaved-btn').disabled = false; }
  }catch(e){}
}

/* ---------------- init ---------------- */
loadBuiltInDataset(false);
renderM2Table();
updateM2Status();
checkM1SavedAvailable();
checkM2SavedAvailable();