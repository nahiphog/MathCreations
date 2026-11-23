(() => {
  'use strict';
  const {END, samples, time, csv} = ClockModel;
  const $ = id => document.getElementById(id);
  const canvas = $('graph'), ctx = canvas.getContext('2d');
  let selected = 0, lo = 0, hi = END, playing = false, lastFrame = 0, playTime = 0, animationFrame = 0;
  let width = 800, height = 400, hover = null, drag = null;
  const margin = {left:52, right:18, top:30, bottom:50};
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const x = t => margin.left + (t-lo)/(hi-lo)*(width-margin.left-margin.right);
  const y = a => height-margin.bottom-a/180*(height-margin.top-margin.bottom);
  const toTime = px => lo+(px-margin.left)/(width-margin.left-margin.right)*(hi-lo);
  const point = (a,r) => [130+r*Math.sin(a*Math.PI/180),130-r*Math.cos(a*Math.PI/180)];
  $('ticks').innerHTML = Array.from({length:60},(_,i)=>{const a=point(i*6,i%5?113:108),b=point(i*6,117);return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${i%5?'#bacad2':'#617582'}" stroke-width="${i%5?1:2}"/>`;}).join('');
  $('numbers').innerHTML = Array.from({length:12},(_,i)=>{const p=point((i+1)*30,94);return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="central" fill="#617582" font-size="14">${i+1}</text>`;}).join('');
  function select(t) {
    selected = clamp(Math.round(t),0,END);
    $('timeline').value = $('seconds').value = selected;
    $('time-display').textContent = time(selected);
    $('angle-display').textContent = samples[selected].toFixed(3)+'°';
    $('sample-label').textContent = `Sample ${(selected+1).toLocaleString('en-US')} of 43,201`;
    $('timeline').setAttribute('aria-valuetext',`${time(selected)}, ${samples[selected].toFixed(3)} degrees`);
    const h = selected/120%360, m = selected/10%360;
    $('hour').setAttribute('transform',`rotate(${h} 130 130)`);
    $('minute').setAttribute('transform',`rotate(${m} 130 130)`);
    let delta = (m-h+360)%360; if (delta>180) delta-=360;
    const a=point(h,49),b=point(h+delta,49);
    $('sector').setAttribute('d',Math.abs(delta)<1e-9?'':`M130 130 L${a} A49 49 0 0 ${delta>=0?1:0} ${b} Z`);
    $('clock').setAttribute('aria-label',`${time(selected)}. Smaller angle ${samples[selected].toFixed(3)} degrees.`);
    draw();
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    ctx.font='12px system-ui'; ctx.lineWidth=1;
    for(let a=0;a<=180;a+=30){ctx.strokeStyle='#e3eaee';ctx.beginPath();ctx.moveTo(margin.left,y(a));ctx.lineTo(width-margin.right,y(a));ctx.stroke();ctx.fillStyle='#617582';ctx.textAlign='right';ctx.fillText(a+'°',margin.left-10,y(a)+4);}
    const span=hi-lo, target=span/Math.max(2,Math.floor((width-70)/100));
    const step=[1,2,5,10,15,30,60,120,300,600,900,1800,3600,7200,14400].find(v=>v>=target)||14400;
    for(let t=Math.ceil(lo/step)*step;t<=hi;t+=step){ctx.strokeStyle='#edf1f4';ctx.beginPath();ctx.moveTo(x(t),margin.top);ctx.lineTo(x(t),height-margin.bottom);ctx.stroke();ctx.fillStyle='#617582';ctx.textAlign='center';let label=span<=300?time(t).split(' ')[0]:time(t).replace(':00 ',' ');ctx.fillText(label,x(t),height-margin.bottom+23);}
    ctx.textAlign='left';ctx.fillStyle='#617582';ctx.fillText('Minor angle (degrees)',margin.left,14);
    ctx.textAlign='center';ctx.fillText('Time of day', (margin.left+width-margin.right)/2,height-4);
    ctx.save();ctx.beginPath();ctx.rect(margin.left,margin.top,width-margin.left-margin.right,height-margin.top-margin.bottom);ctx.clip();
    ctx.strokeStyle='#007f75';ctx.lineWidth=2;ctx.beginPath();
    const start=Math.max(0,Math.floor(lo)),end=Math.min(END,Math.ceil(hi));
    for(let t=start;t<=end;t++){if(t===start)ctx.moveTo(x(t),y(samples[t]));else ctx.lineTo(x(t),y(samples[t]));}ctx.stroke();
    if(span<=180){ctx.fillStyle='#007f75';for(let t=start;t<=end;t++){ctx.beginPath();ctx.arc(x(t),y(samples[t]),2.7,0,2*Math.PI);ctx.fill();}}
    if(selected>=lo&&selected<=hi){ctx.strokeStyle='#d79b2e';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x(selected),margin.top);ctx.lineTo(x(selected),height-margin.bottom);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#d79b2e';ctx.beginPath();ctx.arc(x(selected),y(samples[selected]),5,0,2*Math.PI);ctx.fill();}
    if(hover!==null){ctx.fillStyle='#213849';ctx.beginPath();ctx.arc(x(hover),y(samples[hover]),4,0,2*Math.PI);ctx.fill();}ctx.restore();
    $('zoom-in').disabled=span<=10; $('zoom-out').disabled=span>=END;
    $('pan-left').disabled=lo<=0; $('pan-right').disabled=hi>=END;
  }
  function view(start,span){span=clamp(span,10,END);lo=clamp(start,0,END-span);hi=lo+span;hideTooltip();draw();}
  function zoom(factor,anchor=clamp(selected,lo,hi)){const old=hi-lo,span=clamp(old*factor,10,END);view(anchor-(anchor-lo)/old*span,span);}
  function stop(){playing=false;cancelAnimationFrame(animationFrame);$('play').textContent='Play';}
  function manual(t){stop();select(t);}
  $('timeline').addEventListener('input',e=>manual(Number(e.target.value)));
  $('seconds').addEventListener('change',e=>manual(Number(e.target.value)||0));
  document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>manual(Number(b.dataset.time))));
  $('play').addEventListener('click',()=>{if(playing){stop();return;}if(selected===END)select(0);playing=true;playTime=selected;lastFrame=performance.now();$('play').textContent='Pause';animationFrame=requestAnimationFrame(animate);});
  function animate(now){if(!playing)return;playTime=Math.min(END,playTime+(now-lastFrame)/1000*Number($('speed').value));lastFrame=now;const t=Math.floor(playTime);if(t!==selected)select(t);if(playTime>=END)stop();else animationFrame=requestAnimationFrame(animate);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  $('zoom-in').onclick=()=>zoom(.5);$('zoom-out').onclick=()=>zoom(2);$('reset').onclick=()=>view(0,END);
  $('pan-left').onclick=()=>view(lo-(hi-lo)*.3,hi-lo);$('pan-right').onclick=()=>view(lo+(hi-lo)*.3,hi-lo);
  function hideTooltip(){hover=null;$('tooltip').hidden=true;}
  function localX(e){return e.clientX-canvas.getBoundingClientRect().left;}
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(clamp(e.deltaY,-200,200)*.004),clamp(toTime(localX(e)),lo,hi));},{passive:false});
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:localX(e),lo,span:hi-lo,moved:false};canvas.setPointerCapture(e.pointerId);hideTooltip();});
  canvas.addEventListener('pointermove',e=>{
    const px=localX(e);
    if(drag){if(Math.abs(px-drag.x)>4)drag.moved=true;if(drag.moved)view(drag.lo-(px-drag.x)/(width-margin.left-margin.right)*drag.span,drag.span);return;}
    if(px<margin.left||px>width-margin.right){hideTooltip();draw();return;}
    hover=clamp(Math.round(toTime(px)),0,END);const tip=$('tooltip');tip.hidden=false;tip.textContent=`${time(hover)} · ${samples[hover].toFixed(3)}°`;tip.style.left=clamp(px+12,0,Math.max(0,width-tip.offsetWidth))+'px';tip.style.top=clamp(y(samples[hover])-45,0,height-45)+'px';draw();
  });
  canvas.addEventListener('pointerup',e=>{if(!drag)return;if(!drag.moved)manual(toTime(localX(e)));drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
  canvas.addEventListener('pointercancel',()=>{drag=null;hideTooltip();draw();});
  canvas.addEventListener('pointerleave',()=>{hideTooltip();draw();});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','+','-','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='+')zoom(.5);else if(e.key==='-')zoom(2);else{manual(e.key==='Home'?0:e.key==='End'?END:selected+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?60:1));if(selected<lo||selected>hi)view(selected-(hi-lo)/2,hi-lo);}}});
  $('download').onclick=()=>{const url=URL.createObjectURL(new Blob([csv()],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='clock-minor-angles-12-hours.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  new ResizeObserver(()=>{const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}).observe(canvas);
  select(0);
})();
