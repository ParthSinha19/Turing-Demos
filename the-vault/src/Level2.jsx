import {useState} from 'react';
import {Claim,Steps,Head} from './ui.jsx';
import {miss} from './engine.js';
import './graph.css';
const N=[['KEYBOARD','⌨️',60,60,'You press my keys to type letters into the computer.'],
['BROWSER','🌐',190,60,'The app you open to visit websites.'],
['FIREWALL','🛡️',320,60,'A guard that blocks unwanted visitors.'],
['SERVER','🖥️',320,160,'A powerful computer that stores websites and information.'],
['DATA','💾',190,160,'Facts and information that a computer stores.'],
['PASSWORD','🔑',60,160,'A secret word that proves it is really you.']];
const E=[[0,1],[1,2],[2,3],[3,4],[4,5],[1,5]];
const ADJ=N.map((_,i)=>E.filter(e=>e.includes(i)).map(e=>e[0]===i?e[1]:e[0]));
const ALL=[0,1,2,3,4,5],ORDER=[5,4,1,3,2,0];
function Gr({known,ask,onPick,hot=()=>false,showDeg}){
  return(<svg viewBox="0 0 460 230" className="graph" role="group" aria-label="Map of connected computer parts">
    {E.map(([a,b])=><line key={a+'-'+b} className={hot(a,b)?'on':''} x1={N[a][2]} y1={N[a][3]} x2={N[b][2]} y2={N[b][3]}/>)}
    {N.map(([l,em,x,y],i)=>{const k=known.includes(i);return(<g key={l} className={'gc'+(k?' on':'')+(ask===i?' ask':'')} transform={`translate(${x},${y})`} role="button" tabIndex={0} aria-label={k?l:'Unknown part'}
      onClick={()=>onPick&&onPick(i)} onKeyDown={e=>{if(onPick&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onPick(i)}}}>
      <circle r="28"/><text className="em" y="9">{k?em:'❓'}</text><text className="lb" y="46">{k?l:'?'}</text>
      {showDeg&&<><circle className="dg" cx="22" cy="-22" r="10"/><text className="deg" x="22" y="-18">{ADJ[i].length}</text></>}</g>)})}</svg>);
}
function NameIt({onPass}){
  const [k,setK]=useState(0);const [known,setKnown]=useState([]);const [msg,setMsg]=useState('');
  const fin=k>=6,cur=ORDER[k];
  const opts=fin?[]:[cur,ORDER[(k+2)%6],ORDER[(k+4)%6]].sort((a,b)=>N[a][0].localeCompare(N[b][0]));
  const ans=i=>{if(i===cur){setKnown(x=>[...x,cur]);setMsg('');setK(k+1)}else{miss();setMsg('Not quite. Read the clue again, then look at the picture.')}};
  return(<div className="panel big"><h2>A · WHAT IS IT?</h2><p className="muted">NOVA's backend is a map of connected things. Work out what each glowing circle is.</p>
    <Gr known={known} ask={fin?-1:cur}/>
    {!fin?<><p className="msg you"><span className="who">CLUE {k+1} / 6</span>{N[cur][4]}</p>
      <div className="row">{opts.map(i=><button key={i} className="btn ghost" onClick={()=>ans(i)}>{N[i][0]}</button>)}</div>
      {msg&&<p className="fb bad" role="status">✗ {msg}</p>}</>
    :<><p className="fb okk" role="status">✓ You named every part! This map is called a <b>graph</b>. Each thing is a <b>node</b> and each line is an <b>edge</b> (a connection).</p><button className="btn big" onClick={onPass}>NEXT →</button></>}</div>);
}
function PathGame({onPass}){
  const [path,setPath]=useState([0]);const [msg,setMsg]=useState('');
  const last=path[path.length-1],done=last===4;
  const hot=(a,b)=>path.some((p,j)=>j&&((path[j-1]===a&&p===b)||(path[j-1]===b&&p===a)));
  const click=i=>{if(done||path.includes(i))return;
    if(ADJ[last].includes(i)){setPath(p=>[...p,i]);setMsg('')}else{miss();setMsg(`${N[last][0]} is not joined to ${N[i][0]} by a line. Pick a node that touches ${N[last][0]}.`)}};
  return(<div className="panel big"><h2>B · FIND A PATH</h2><p className="muted">You type a password on the KEYBOARD. How does it reach the DATA? Tap one node at a time, following the lines.</p>
    <Gr known={ALL} onPick={click} hot={hot}/>
    <p className="ord">Your path: {path.map(i=><span key={i}>{N[i][1]} {N[i][0]}</span>)}</p>
    {msg&&<p className="fb bad" role="status">✗ {msg}</p>}
    <div className="row">{!done&&path.length>1&&<button className="btn ghost" onClick={()=>{setPath([0]);setMsg('')}}>START AGAIN</button>}</div>
    {done&&<><p className="fb okk" role="status">✓ You found a <b>path</b>: a chain of nodes joined by edges. There is more than one right answer. Can you find the other one?</p><button className="btn big" onClick={onPass}>NEXT →</button></>}</div>);
}
function Hub({onPass}){
  const [a,setA]=useState(null);
  const pick=i=>{if(a===1)return;setA(i);if(i!==1)miss()};
  return(<div className="panel big"><h2>C · GUARD THE HUB</h2><p className="muted">A hacker is trying to get in! You can put one extra guard on ONE node. Pick the node with the most connections.</p>
    <Gr known={ALL} onPick={pick} showDeg={a!==null}/>
    {a!==null&&a!==1&&<p className="fb bad" role="status">✗ {N[a][0]} has {ADJ[a].length} connection{ADJ[a].length===1?'':'s'}. Count the lines on the other nodes (the numbers can help). Which has the most?</p>}
    {a===1&&<><p className="fb okk" role="status">✓ BROWSER has 3 connections, the most. A node with lots of connections is called a <b>hub</b>. If a hacker gets into a hub they can reach lots of other parts, so we guard it extra well.</p><button className="btn big" onClick={onPass}>FINISH</button></>}</div>);
}
export default function Level2({onWin,onBack,done}){
  const [s,setS]=useState(done?3:0);
  return(<section className="level"><Head k="LAYER 02 · 8 MIN" t="MAP THE SYSTEM" lead="NOVA's backend is a map of connected things. Learn to read it, then guard it." back={onBack}
    more="A graph is made of nodes (things) joined by edges (connections). Computers, the internet and social networks are all graphs. How many connections a node has is called its degree, and a node with many is a hub. Hackers love hubs, so engineers protect them first."/>
  <Steps s={s} names={['NAME IT','FIND A PATH','GUARD THE HUB']}/>
  {s===0&&<NameIt onPass={()=>setS(1)}/>}{s===1&&<PathGame onPass={()=>setS(2)}/>}{s===2&&<Hub onPass={()=>setS(3)}/>}
  {s===3&&<Claim n="02" text="You named the parts of a computer system, followed a path through a graph, and found the hub that needs the strongest guard." onWin={onWin}/>}
  </section>);
}
