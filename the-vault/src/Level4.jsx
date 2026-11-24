import {useState} from 'react';
import {Claim,Steps,Head} from './ui.jsx';
const W=520,H=160,N=64,f=t=>Math.sin(t*Math.PI*3)*.7+Math.sin(t*Math.PI*6)*.2;
function Lab({onPass}){
  const [n,setN]=useState(8);const [shown,setShown]=useState(false);const [bits,setBits]=useState([0,0,0,0]);const T=10;
  const val=bits.reduce((a,b)=>a*2+b,0);
  const path=Array.from({length:N+1},(_,i)=>`${i?'L':'M'}${(i/N*W).toFixed(1)},${(H/2-f(i/N)*H/2).toFixed(1)}`).join('');
  const S=Array.from({length:n},(_,i)=>{const t=(i+.5)/n;return{x:i*W/n,w:W/n,v:Math.round((f(t)+1)/2*7)}});
  return(<div className="panel big"><h2>A · SIGNAL LAB</h2>
    <p className="muted"><b>Analogue</b> signals change smoothly. <b>Digital</b> systems keep only separate measurements (<b>sampling</b>) and store them as numbers.</p>
    <svg viewBox={`0 0 ${W} ${H}`} className="wave" role="img" aria-label="A smooth wave with stepped digital samples">
      {shown&&S.map((s,i)=><rect key={i+'-'+n} className="bar" style={{animationDelay:i*40+'ms'}} x={s.x+1} width={s.w-2} y={H-s.v/7*H} height={s.v/7*H}/>)}
      <path d={path} fill="none" stroke="#39FF78" strokeWidth="3"/></svg>
    <div className="row"><label className="muted">Samples: <b>{n}</b> <input type="range" min="4" max="16" step="4" value={n} onChange={e=>setN(+e.target.value)}/></label>
      <button className="btn" aria-pressed={shown} onClick={()=>setShown(s=>!s)}>{shown?'HIDE SAMPLES':'SAMPLE THE WAVE'}</button></div>
    {shown&&<p className="chips">Measurements: {S.map(s=>s.v).join(', ')}. {n<8?'Few samples miss detail.':'More samples follow the wave more closely.'}</p>}
    <h2 style={{marginTop:'1.5rem'}}>BINARY SWITCHES · MAKE THE NUMBER {T}</h2>
    <div className="row">{bits.map((b,i)=><button key={i} className={'opt sw'+(b?' sel':'')} aria-pressed={!!b} aria-label={`Switch worth ${8>>i}`} onClick={()=>setBits(x=>x.map((y,j)=>j===i?1-y:y))}><b>{b}</b><br/><small>{8>>i}</small></button>)}<p className="chips">= {val}</p></div>
    {val===T&&<p className="fb okk">✓ 8 + 2 = 10, so the switches read 1010. Computers store everything as 0s and 1s.</p>}
    <button className="btn big" disabled={!(shown&&val===T)} onClick={onPass}>NEXT →</button></div>);
}
function Next({onPass}){
  const [a,setA]=useState(null);const O=['Mat','Moon','Aeroplane','Sandwich'];
  return(<div className="panel big"><h2>B · WHAT COMES NEXT?</h2><p className="msg you">The cat sat on the …</p>
    <div className="row">{O.map(o=><button key={o} className={'opt'+(a===o?' sel':'')} disabled={a!==null} onClick={()=>setA(o)}>{o}</button>)}</div>
    {a&&<><p className={'fb '+(a==='Mat'?'okk':'bad')} role="status">{a==='Mat'?'✓ Yes! ':'✗ Possible, but unlikely. '}Language models learn patterns from huge amounts of text, then predict the most likely next piece, called a <b>token</b>.</p>
      <p className="muted">Real tokens can be parts of words:</p><div className="row">{['Un','believ','able',' cats'].map(t=><span key={t} className="tok">{t}</span>)}</div>
      <button className="btn big" onClick={onPass}>NEXT →</button></>}</div>);
}
function Machine({onPass}){
  const [txt,setTxt]=useState('the cat sat on the mat\nthe cat sat on the mat\nthe dog sat on the rug\nthe cat ate the fish');
  const [w,setW]=useState('the');const [ed,setEd]=useState(false);const c={},key=w.trim().toLowerCase();
  txt.toLowerCase().split('\n').forEach(l=>{const a=l.trim().split(/\s+/).filter(Boolean);a.forEach((x,i)=>{if(x===key&&a[i+1])c[a[i+1]]=(c[a[i+1]]||0)+1})});
  const rows=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5),tot=rows.reduce((a,r)=>a+r[1],0);
  return(<div className="split"><div className="panel big"><h2>C · PREDICTION MACHINE</h2><p className="muted">Edit the examples. The machine counts which word follows. Try adding "the cat sat on the mat" lines or new words!</p>
    <textarea className="ta" rows={6} value={txt} onChange={e=>{setTxt(e.target.value);setEd(true)}} aria-label="Example sentences"/></div>
    <div className="panel big"><h2>AFTER THE WORD…</h2><input className="ta one" value={w} onChange={e=>setW(e.target.value)} aria-label="Starting word"/>
      {rows.length?rows.map(([k,v])=><div key={k} className="pbar"><span>{k}</span><i style={{width:v/tot*100+'%'}}/><b>{Math.round(v/tot*100)}%</b></div>):<p className="muted">No examples found for that word.</p>}
      <p className="muted">A simplified model. Real AI is far more complex.</p>
      <button className="btn big" disabled={!ed} onClick={onPass}>NEXT →</button></div></div>);
}
export default function Level4({onWin,onBack,done}){
  const [s,setS]=useState(done?3:0);
  return(<section className="level"><Head k="LAYER 04 · 11 MIN" t="HOW DOES AI ACTUALLY WORK?" lead="The communication layer is malfunctioning. Time to look inside the signal." back={onBack} more="A higher sample rate follows the wave more closely. 4 bits can store 16 values (0 to 15) and 8 bits store 256. Real models turn words into tokens, then tokens into numbers."/>
  <Steps s={s} names={['SIGNAL LAB','NEXT WORD','PREDICTION']}/>
  {s===0&&<Lab onPass={()=>setS(1)}/>}{s===1&&<Next onPass={()=>setS(2)}/>}{s===2&&<Machine onPass={()=>setS(3)}/>}
  {s===3&&<Claim n="04" text="Computers turn the world into numbers (0s and 1s). Generative AI learns patterns in text and predicts the next token. It is a prediction machine, not a mind." onWin={onWin}/>}
  </section>);
}
