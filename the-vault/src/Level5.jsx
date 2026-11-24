import {useState} from 'react';
import {Claim,Steps,Head,Pick} from './ui.jsx';
const RAW=[['Cheetah','Grassland',100],['Lion','Grassland',80],['Penguin','Antarctica',8],['Cheetah','Grassland',100],['Dolphin','Ocean',50],['Lion','Ocean',80]].map((r,id)=>({id,r}));
const TRUE={Cheetah:'Grassland',Lion:'Grassland',Penguin:'Antarctica',Dolphin:'Ocean'};
const DOCS=[['Dolphin facts: dolphins live in the ocean.',1],['Lion facts: lions live on grassland.',0],['Penguin facts: penguins live in Antarctica.',0],['Ocean habitats: the ocean is home to many sea animals.',1],['Cheetah facts: cheetahs run on grassland.',0]];
function Clean({onPass}){
  const [rows,setRows]=useState(RAW);const [msg,setMsg]=useState(null);
  const upd=(id,h)=>{setMsg(null);setRows(rs=>rs.map(x=>x.id===id?{...x,r:[x.r[0],h,x.r[2]]}:x))};
  const check=()=>{const names=rows.map(x=>x.r[0]);
    if(new Set(names).size!==names.length)return setMsg('bad:Duplicate records remain. The same animal should appear once.');
    if(rows.some(x=>TRUE[x.r[0]]!==x.r[1]))return setMsg('bad:A habitat looks wrong. Lions live on grassland, not in the ocean.');
    setMsg('ok:Clean! Duplicates removed and the wrong habitat fixed. Good data means better AI answers.')};
  return(<div className="panel big"><h2>A · CLEAN THE DATASET</h2><p className="muted">Find duplicates and wrong information. Remove rows or fix habitats.</p>
    <table className="dt"><thead><tr><th>Animal</th><th>Habitat</th><th>Speed</th><th/></tr></thead><tbody>{rows.map(({id,r})=><tr key={id}><td>{r[0]}</td>
      <td><select aria-label={'Habitat for '+r[0]} value={r[1]} onChange={e=>upd(id,e.target.value)}>{['Grassland','Ocean','Antarctica'].map(h=><option key={h}>{h}</option>)}</select></td><td>{r[2]}</td>
      <td><button className="btn ghost" onClick={()=>{setMsg(null);setRows(rs=>rs.filter(x=>x.id!==id))}}>REMOVE</button></td></tr>)}</tbody></table>
    <div className="row"><button className="btn" onClick={check}>CHECK DATA</button>{msg?.startsWith('ok')&&<button className="btn big" onClick={onPass}>NEXT →</button>}</div>
    {msg&&<p className={'fb '+(msg.startsWith('ok')?'okk':'bad')} role="status">{msg.slice(msg.indexOf(':')+1)}</p>}</div>);
}
function Halluc({onPass}){
  const [look,setLook]=useState(false);const [a,setA]=useState(null);
  const O=[['The penguin is the fastest animal because it swims.',0],['The cheetah is the fastest in our data: 100, while the penguin is only 8.',1],['Nobody can know which animal is fastest.',0]];
  return(<div className="panel big"><h2>C · CATCH THE HALLUCINATION</h2><p className="msg you">Which animal is the fastest?</p>
    <p className="msg nova"><span className="who">CHATBOT</span>The penguin is the fastest animal because it can swim underwater.</p>
    <button className="btn ghost" onClick={()=>setLook(true)}>CHECK THE DATASET</button>
    {look&&<p className="fb bad">Dataset: Cheetah 100 · Lion 80 · Dolphin 50 · Penguin 8. The cheetah is the fastest land animal. The chatbot sounded confident but was wrong.</p>}
    {look&&<><p className="muted">Build a better answer using the evidence:</p><div className="opts">{O.map(([t,ok],i)=><button key={i} className={'opt'+(a===i?' sel':'')} onClick={()=>setA(i)}>{t}</button>)}</div>
      {a!==null&&<p className={'fb '+(O[a][1]?'okk':'bad')} role="status">{O[a][1]?'✓ Evidence-based and honest. Always check AI against sources.':'✗ Look at the numbers again. What does the dataset say?'}</p>}
      <button className="btn big" disabled={a!==1} onClick={onPass}>FINISH →</button></>}</div>);
}
export default function Level5({onWin,onBack,done}){
  const [s,setS]=useState(done?3:0);
  return(<section className="level"><Head k="LAYER 05 · 11 MIN" t="FIND THE TRUTH" lead="The AI has started giving unreliable answers. Something is wrong in its data vault." back={onBack} more="Retrieval systems find relevant documents first, then an AI writes an answer from them. If the data is wrong or the AI ignores it, the answer can still be wrong, so check sources."/>
  <Steps s={s} names={['CLEAN DATA','RETRIEVAL','HALLUCINATION']}/>
  {s===0&&<Clean onPass={()=>setS(1)}/>}
  {s===1&&<div className="panel big"><h2>B · WHICH ANIMALS LIVE IN THE OCEAN?</h2><p className="muted">Tick the documents that help answer this question.</p><Pick items={DOCS} good="Relevant! Retrieval means finding information that matches the question. Penguins live in Antarctica in our data, so that document is not relevant." bad="Not quite. Which documents talk about animals in the ocean?" onPass={()=>setS(2)}/></div>}
  {s===2&&<Halluc onPass={()=>setS(3)}/>}
  {s===3&&<Claim n="05" text="Data must be clean, the right information must be found, and AI answers must be checked against sources. AI can sound sure and still be wrong." onWin={onWin}/>}
  </section>);
}
