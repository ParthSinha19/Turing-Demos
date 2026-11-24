import {useEffect,useRef} from 'react';
// Cheap canvas digital rain: ~20fps, pauses when hidden, static under reduced motion
export default function Rain({intensity=1}){
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current,x=c.getContext('2d');let id,w,h,cols,drops;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size=16,chars='01アイウエオカキクケコ<>/{}=+*';
    const fit=()=>{w=c.width=innerWidth;h=c.height=innerHeight;cols=Math.ceil(w/size);drops=Array.from({length:cols},()=>Math.random()*h/size)};
    fit();addEventListener('resize',fit);
    const draw=()=>{x.fillStyle='rgba(5,11,7,.14)';x.fillRect(0,0,w,h);x.font=size+'px monospace';
      for(let i=0;i<cols;i++){x.fillStyle=Math.random()<.04?'#E5F5E9':'#159447';
        x.fillText(chars[Math.random()*chars.length|0],i*size,drops[i]*size);
        if(drops[i]*size>h&&Math.random()>.975)drops[i]=0;drops[i]+=.5+intensity*.15}};
    if(reduce){for(let i=0;i<40;i++)draw();return()=>removeEventListener('resize',fit)}
    let last=0;const loop=t=>{id=requestAnimationFrame(loop);if(t-last<50||document.hidden)return;last=t;draw()};
    id=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(id);removeEventListener('resize',fit)};
  },[intensity]);
  return <canvas ref={ref} className="rain" aria-hidden="true"/>;
}
