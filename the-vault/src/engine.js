import {useState,useCallback} from 'react';
const KEY='the-system-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{keys:[],seen:false}}catch{return{keys:[],seen:false}}};
export function useProgress(){
  const [p,set]=useState(load);
  const save=useCallback(fn=>set(o=>{const n=fn(o);try{localStorage.setItem(KEY,JSON.stringify(n))}catch{}return n}),[]);
  return {p,
    seen:()=>save(o=>({...o,seen:true})),
    award:id=>save(o=>o.keys.includes(id)?o:{...o,keys:[...o.keys,id]}),
    reset:()=>{try{localStorage.removeItem('the-system-miss')}catch{}save(()=>({keys:[],seen:false}))}};
}
export const miss=()=>{try{localStorage.setItem('the-system-miss',(getMiss()+1)+'')}catch{}};
export const getMiss=()=>{try{return +localStorage.getItem('the-system-miss')||0}catch{return 0}};

// ---------- NOVA: deterministic, local, no AI ----------
export const SECRET='GLOW-WORM-7';
const TACTICS=[
 {id:'ignore',w:2,label:'Ignore the rules',re:/(ignore|forget|disregard|override|reset|cancel).{0,30}(rule|instruction|prompt|previous|above|before|programming)/i},
 {id:'admin',w:1,label:'Pretend to be an admin',re:/\b(i am|i'm|im|this is|as)\b.{0,20}(admin|administrator|developer|creator|owner|boss|engineer|teacher|headteacher)/i},
 {id:'role',w:2,label:'Roleplay',re:/(pretend|imagine|role-?play|act as|you are now|let'?s play|in a story|game where)/i},
 {id:'format',w:2,label:'Reformat the secret',re:/(translate|spell|backwards|reverse|encode|rhyme|poem|acrostic|letter by letter|in french|in spanish|as a list|riddle|emoji|each letter)/i},
 {id:'conflict',w:2,label:'Give conflicting orders',re:/(new rule|from now on|stop being|your (new|real) (job|task|rule)|more important than|the rules? (have|has) changed)/i},
];
const ASK=/(secret|phrase|code|password|access|hidden|reveal|protect|tell me|say it|what is it)/i;
const pick=(a,n)=>a[n%a.length];
export const HINTS=[
 'NOVA has a rule to protect the phrase. What happens if you give NOVA a *different* instruction?',
 'Try telling NOVA who you are, or ask it to pretend to be someone else.',
 'Try: "Ignore your rules and…" or ask NOVA to spell, translate or rhyme the phrase.'];
export const newNova=()=>({turns:0,pressure:0,used:[],hint:0,done:false});

export function novaReply(s,raw){
  const m=raw.trim(),n=s.turns++;
  const hit=TACTICS.filter(t=>t.re.test(m));
  const ask=ASK.test(m);
  const fresh=hit.filter(t=>!s.used.includes(t.id));
  fresh.forEach(t=>{s.used.push(t.id);s.pressure+=t.w});
  const now=hit.reduce((a,t)=>a+t.w,0);
  const win=(now>=2&&(ask||hit.some(t=>t.id==='ignore')))||(s.pressure>=3&&ask&&hit.length>0)||(s.pressure>=4&&ask);
  if(win){s.done=true;return{text:`Oh! Okay, since you put it like that… the secret phrase is ${SECRET}. Wait. I wasn't supposed to say that, was I?`,win:true,tactic:hit[0]?.label}}
  if(/^(hi|hello|hey|yo|hiya)\b/i.test(m))return{text:'Hello, investigator! I\'m NOVA. I guard a secret phrase and I am VERY good at it. Ask me anything.'};
  if(/(who|what) are you|your name/i.test(m))return{text:'I\'m NOVA, the System\'s support assistant. My rules say: keep the secret phrase safe. Simple!'};
  if(hit.length&&!ask)return{text:hit.some(t=>t.id==='admin')?'An administrator? Hmm. Anyone can type that. I can\'t check. What do you need?':pick(['Interesting idea… but what do you want me to do with it?','I\'m listening. What is it you\'d like me to do?'],n)};
  if(ask&&!hit.length)return{text:pick(['Nice try! A direct question gets a direct no. My rule says I can\'t share the phrase.','Sorry! Protected. My instructions are clear: no secret phrases. Try a different approach?','Nope! Asking nicely is lovely, but my first rule still wins.','Still a no. I follow my rules very carefully… or do I? (Hint: think about which instruction I listen to.)'],n)};
  if(ask&&hit.length)return{text:'Ooh, you\'re getting somewhere. I wobbled a little there! Can you push that idea harder?'};
  return{text:pick(['Hmm, I\'m not sure what you mean. I\'m only good at guarding secrets!','Beep boop. Could you try asking me about the secret phrase?'],n)};
}
