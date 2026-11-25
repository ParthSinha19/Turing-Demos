import {useState,useEffect} from 'react';
import {Claim,Steps,Head,Pick} from './ui.jsx';
const PROFILE=[['Favourite animal','Dragon'],['Favourite colour','Green'],['Favourite number','7'],['Favourite game','Space Quest']];
const PW=[['Dragon123',1],['GreenDragon7',1],['7Green!Dragon',1],['k9#Tq-vW2$mZp8Lx',0]];
const DEF=[['Longer passwords',1],['Random combinations',1],['Attempt limits',1],['Waiting periods after repeated attempts',1],['Store passwords scrambled (hashed), never as plain text',1],['Keep every password in a plain text list',0],["Use your pet's name",0],['Share it with a friend',0]];
const CLUES=['Clue 1: It begins with a mythical creature.','Clue 2: A colour follows it.','Clue 3: It ends with a single lucky number.'];
const WORDS=['dragon','green','7'];
const Profile=()=><div className="panel"><h2>FICTIONAL USER</h2>{PROFILE.map(([k,v])=><p key={k} className="muted">{k}: <b>{v}</b></p>)}</div>;
function Lock({onPass}){
  const [log,setLog]=useState([{f:'lock',t:'State your business. I am LOCK. Guess the password. You have five attempts. I would not hold my breath.'}]);
  const [v,setV]=useState('');const [tries,setTries]=useState(0);const [wait,setWait]=useState(0);const [won,setWon]=useState(false);
  useEffect(()=>{if(wait<=0)return;const id=setTimeout(()=>setWait(w=>w-1),1000);return()=>clearTimeout(id)},[wait]);
  useEffect(()=>{if(wait===0&&tries>=5){setTries(0);setLog(l=>[...l,{f:'lock',t:'Waiting period over. Attempts restored. Notice how that slowed you down? That is the point.'}])}},[wait,tries]);
  const go=e=>{e.preventDefault();const g=v.trim();if(!g||wait>0||won)return;setV('');
    const n=g.toLowerCase().replace(/[^a-z0-9]/g,'');const t=tries+1;const m=WORDS.filter(w=>n.includes(w)).length;let r;
    if(n==='dragongreen7'){r='…Access granted. Hmph. Well done. Do not let it go to your head.';setWon(true)}
    else{r=m===0?'Incorrect password. Not even close.':m===3?'One clue matched, no, all three pieces are present. The order is wrong. Try another combination.':`Incorrect. ${m} clue${m>1?'s':''} matched. Try another combination.`;
      if(t>=5){r+=' ACCOUNT LOCKED. Waiting period: 8 seconds. This is called rate limiting.';setWait(8)}}
    setTries(t);setLog(l=>[...l,{f:'you',t:g},{f:'lock',t:r}])};
  return(<div className="split"><div className="chat" role="log" aria-live="polite"><div className="chat-top"><b>🔒 LOCK</b><span className="status">ATTEMPTS: {'■'.repeat(Math.max(0,5-tries))}{'□'.repeat(Math.min(5,tries))}</span></div>
    <div className="msgs">{log.map((m,i)=><div key={i} className={'msg '+(m.f==='lock'?'nova':'you')}><span className="who">{m.f==='lock'?'LOCK':'YOU'}</span>{m.t}</div>)}</div>
    <form className="send" onSubmit={go}><input value={v} onChange={e=>setV(e.target.value)} aria-label="Password guess" placeholder={wait>0?`LOCKED… ${wait}s`:'Enter a fictional password guess'} disabled={wait>0||won} maxLength={30} autoComplete="off"/><button className="btn" disabled={wait>0||won||!v.trim()}>TRY</button></form></div>
    <aside className="side"><div className="panel"><h2>LOCK'S CLUES</h2>{CLUES.map(c=><p key={c} className="hint">{c}</p>)}</div><Profile/>{won&&<button className="btn big" onClick={onPass}>NEXT →</button>}</aside></div>);
}
export default function Level4({onWin,onBack,done}){
  const [s,setS]=useState(done?3:0);
  return(<section className="level"><Head k="LAYER 04 · 8 MIN" t="CAN YOU GUESS THE CODE?" lead="A protected panel. A strict guard called LOCK. Everything here is a simulation, no real passwords." back={onBack} more="Digits only: a 4-digit code has 10,000 possibilities. Each extra random character multiplies that number. Rate limiting makes even a huge number of guesses take far too long. Real sites also store passwords scrambled (hashed), so a stolen list is hard to read."/>
  <Steps s={s} names={['WEAK PASSWORDS','TALK TO LOCK','DEFEND']}/>
  {s===0&&<div className="split"><div className="panel big"><h2>A · TICK THE EASY-TO-GUESS PASSWORDS</h2><Pick items={PW} good="Right! Personal facts and predictable patterns are easy to guess. Only the long random one is hard." bad="Not quite. Compare each password with the profile. Which ones use facts about this person?" onPass={()=>setS(1)}/></div><Profile/></div>}
  {s===1&&<Lock onPass={()=>setS(2)}/>}
  {s===2&&<div className="panel big"><h2>C · DEFEND THE ACCOUNT</h2><p className="muted">Tick every good defence.</p><Pick items={DEF} good="Yes! Long, random passwords plus attempt limits and waiting periods (rate limiting) stop repeated guessing." bad="Not quite. Which things make guessing harder or slower? Which things give the password away?" onPass={()=>setS(3)}/></div>}
  {s===3&&<Claim n="04" text="Predictable passwords are easy to guess. Real systems use long random passwords, scrambled (hashed) storage and rate limiting, so guessing again and again gets nowhere." onWin={onWin}/>}
  </section>);
}
