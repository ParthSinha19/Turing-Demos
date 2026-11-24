import {useState} from 'react';
import {miss} from './engine.js';
export function Head({k,t,lead,back,more}){const [o,setO]=useState(false);return(<><button className="link" onClick={back}>← SYSTEM MAP</button><header className="lhead"><p className="kicker">{k}</p><h1>{t}</h1><p className="lead">{lead}</p>{more&&<><button className="btn ghost" aria-expanded={o} onClick={()=>setO(x=>!x)}>DISCOVER MORE</button>{o&&<p className="fb okk">{more}</p>}</>}</header></>)}
export const Steps=({s,names})=>(<ol className="steps">{names.map((n,i)=><li key={n} className={i<s?'on':i===s?'cur':''}>{i<s?'✓ ':''}{n}</li>)}</ol>);
export const Claim=({n,text,onWin})=>(<div className="reveal" role="status"><h2>LAYER {n} CLEARED</h2><p>{text}</p><button className="btn big" onClick={onWin}>CLAIM ACCESS KEY {n}</button></div>);
// Pick all that apply. items: [label, isCorrect]
export function Pick({items,good,bad,onPass}){
  const [sel,setSel]=useState([]);const [res,setRes]=useState(null);
  const tog=i=>{setRes(null);setSel(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])};
  const check=()=>{const ok=items.every(([,b],i)=>sel.includes(i)===!!b);if(!ok)miss();setRes(ok)};
  return(<div><div className="opts" role="group">{items.map(([l],i)=><button key={l} aria-pressed={sel.includes(i)} className={'opt'+(sel.includes(i)?' sel':'')} onClick={()=>tog(i)}>{sel.includes(i)?'☑ ':'☐ '}{l}</button>)}</div>
    <div className="row"><button className="btn" onClick={check} disabled={!sel.length}>CHECK</button>{res&&<button className="btn big" onClick={onPass}>NEXT →</button>}</div>
    {res!==null&&<p className={'fb '+(res?'okk':'bad')} role="status">{res?'✓ ':'✗ '}{res?good:bad}</p>}</div>);
}
