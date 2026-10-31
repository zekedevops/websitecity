(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, TILE = 32;
  const sites = window.CLIENT_SITES || [];
  const player = { x: 476, y: 453, dir: 'down', frame: 0 };
  const keys = new Set();
  let near = null, lastTime = 0, audioCtx = null, soundOn = false;
  const dialog = document.querySelector('#storeDialog');
  const helpDialog = document.querySelector('#helpDialog');
  const prompt = document.querySelector('#interaction');
  const interactionText = document.querySelector('#interactionText');
  const locationLabel = document.querySelector('#locationLabel');
  const palette = { grass:'#557b58', grass2:'#4b704f', grass3:'#62845e', curb:'#d1c791', road:'#4b5351', road2:'#515a57', sidewalk:'#b4aa82', shade:'#334d42', brick:'#ac7452', teal:'#43806f', cream:'#ddc99c', red:'#aa5548', blue:'#577d99', wood:'#75543d' };
  const buildings = sites.slice(0, 5).map((site, i) => ({ site, x: 42 + i * 181, y: 156, w: 158, h: 178, color: [palette.brick,palette.teal,palette.cream,palette.red,palette.blue][i%5], awning: ['#e8c783','#d8efb6','#8eaed0','#efd3b0','#d6b2cd'][i%5] }));
  const trees = [{x:34,y:366},{x:201,y:377},{x:752,y:380},{x:918,y:367},{x:94,y:510},{x:858,y:522}];
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function text(t,x,y,size=10,color='#f1e8c7',font='bold'){ctx.fillStyle=color;ctx.font=`${font} ${size}px "DM Mono", monospace`;ctx.textAlign='center';ctx.fillText(t,x,y)}
  function hash(n){const s=String(n);let v=7;for(let i=0;i<s.length;i++)v=(v*31+s.charCodeAt(i))>>>0;return v}
  function drawGround(){
    rect(0,0,W,H,palette.grass);
    for(let y=0;y<H;y+=TILE){for(let x=0;x<W;x+=TILE){const h=hash((x/TILE)+','+(y/TILE)); if(h%5===0)rect(x+(h%17),y+((h>>3)%19),3,2,palette.grass3);if(h%7===0)rect(x+((h>>2)%25),y+((h>>4)%23),2,2,palette.grass2)}}
    rect(0,340,W,32,palette.curb);rect(0,372,W,87,palette.sidewalk);rect(0,459,W,H-459,palette.road);rect(0,461,W,H-461,palette.road2);
    for(let x=16;x<W;x+=42){rect(x,341,24,4,'#eadfb6');rect(x,366,24,4,'#8a805f')}
    for(let x=24;x<W;x+=94)rect(x,508,46,3,'#d3bc77');
    for(let i=0;i<9;i++){let x=10+i*113;rect(x,432,42,4,'#948c70')}
    text('GENTLE MEDIA CLIENT BLOCK',W/2,584,9,'#bec99e','500');
  }
  function drawStore(b,i){
    const {x,y,w,h,color,awning,site}=b;
    rect(x+7,y+8,w,h,'#344744');rect(x,y,w,h,color);
    rect(x-5,y-8,w+10,13,'#e8d7a9');rect(x+3,y+4,w-6,7,'#fff0c7');
    rect(x+13,y+18,w-26,47,'#d3d1aa');rect(x+17,y+22,w-34,39,'#729588');
    rect(x+20,y+25,5,33,'#9ec5ad');rect(x+26,y+25,w-50,33,'#82a896');
    rect(x+16,y+72,w-32,12,awning);for(let a=0;a<w-32;a+=14)rect(x+16+a,y+72,7,12,'#f5e8c5');
    rect(x+13,y+88,w-26,7,'#f2d29a');
    // Display window and door
    rect(x+13,y+102,46,52,'#2a4948');rect(x+17,y+106,38,44,'#9cc1a8');rect(x+22,y+132,28,3,'#e5d5a4');
    rect(x+w-49,y+100,34,72,'#473b31');rect(x+w-45,y+104,26,64,'#9ab7a0');rect(x+w-23,y+135,3,4,'#f0d087');
    rect(x+7,y+h,w-14,5,'#766b52');
    const label=site.name.toUpperCase();
    ctx.fillStyle='#18332e';ctx.font='bold 8px "DM Mono", monospace';ctx.textAlign='center';
    const maxW=w-38;let shown=label;while(ctx.measureText(shown).width>maxW&&shown.length>7)shown=shown.slice(0,-2)+'…';ctx.fillText(shown,x+w/2,y+57);
    // flower pots
    rect(x+3,y+h-14,12,9,'#9a5941');rect(x+w-15,y+h-14,12,9,'#9a5941');rect(x+8,y+h-21,3,8,'#adc878');rect(x+w-10,y+h-22,3,9,'#d3c879');
    // tiny marquee number
    rect(x+w-18,y+8,12,12,'#304a40');text(String(i+1).padStart(2,'0'),x+w-12,y+17,7,'#c9ef9b','500');
  }
  function drawTree(t){rect(t.x-12,t.y+9,25,7,'#75543d');rect(t.x-24,t.y-17,49,31,'#315b43');rect(t.x-18,t.y-28,36,28,'#3c684a');rect(t.x-9,t.y-36,21,17,'#4a7651');rect(t.x-14,t.y-5,4,4,'#6d9358');rect(t.x+6,t.y-19,5,4,'#6d9358')}
  function drawPlayer(){
    const x=Math.round(player.x), y=Math.round(player.y); const step=keys.size&&performance.now()%380<190?2:0;
    rect(x-7,y+12,17,5,'#344943');
    rect(x-5,y-11,11,12,'#d69a73');rect(x-6,y-14,13,6,'#513e35');rect(x-4,y-1,10,12,'#d5e29d');rect(x-7,y+10+step,5,9-step,'#314f55');rect(x+1,y+10-step,5,9+step,'#314f55');
    rect(x-3,y-6,2,2,'#283b36');rect(x+3,y-6,2,2,'#283b36');
  }
  function draw(){drawGround();buildings.forEach(drawStore);trees.forEach(drawTree);drawPlayer();}
  function nearest(){let choice=null,dist=Infinity;for(const b of buildings){const cx=b.x+b.w/2,cy=b.y+b.h+62;const d=Math.hypot(player.x-cx,player.y-cy);if(d<dist){dist=d;choice=b}}return dist<92?choice:null}
  function setNearby(){near=nearest();prompt.hidden=!near;if(near){interactionText.textContent=`Explore ${near.site.name}`;locationLabel.textContent=`NEAR ${near.site.name.toUpperCase()}`}else locationLabel.textContent='Find a storefront to begin.'}
  function openStore(site){if(!site)return;document.querySelector('#storeTitle').textContent=site.name;document.querySelector('#storeDescription').textContent=site.description||site.category||'Explore this Gentle Media client website.';const frame=document.querySelector('#siteFrame');const fallback=document.querySelector('#frameFallback');frame.src=site.url;frame.style.display='block';fallback.hidden=true;document.querySelector('#visitLink').href=site.url;document.querySelector('#storeDialog').showModal();beep(520,.07)}
  function beep(freq,duration){if(!soundOn)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.025,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(_){}}
  function interact(){if(near&&!dialog.open)openStore(near.site)}
  function keyDown(e){const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);if(k==='e'||k==='enter')interact();if(k==='?')helpDialog.showModal()}
  function keyUp(e){keys.delete(e.key.toLowerCase())}
  function update(dt){const speed=145*dt;let dx=0,dy=0;if(keys.has('arrowup')||keys.has('w'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;if(keys.has('arrowleft')||keys.has('a'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(dx&&dy){dx*=.707;dy*=.707}if(dx||dy){player.x=Math.max(16,Math.min(W-16,player.x+dx*speed));player.y=Math.max(386,Math.min(570,player.y+dy*speed));player.frame+=dt;if(dx)player.dir=dx<0?'left':'right';else player.dir=dy<0?'up':'down'}setNearby()}
  function loop(ts){const dt=Math.min((ts-lastTime)/1000||0,.04);lastTime=ts;if(!dialog.open){update(dt);draw()}requestAnimationFrame(loop)}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',()=>keys.clear());
  document.querySelector('#closeDialog').onclick=()=>dialog.close();document.querySelector('#closeHelp').onclick=()=>helpDialog.close();document.querySelector('#helpButton').onclick=()=>helpDialog.showModal();document.querySelector('#doneHelp').onclick=()=>helpDialog.close();
  document.querySelector('#soundButton').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'SOUND ON':'SOUND OFF';e.currentTarget.setAttribute('aria-pressed',String(soundOn));beep(440,.08)};
  dialog.addEventListener('close',()=>{document.querySelector('#siteFrame').src='about:blank'});
  // Browsers do not reliably expose a cross-origin frame's load failure. Offer a helpful fallback after a short wait when the embedded page stays blank.
  document.querySelector('#siteFrame').addEventListener('load',()=>{const f=document.querySelector('#siteFrame');if(f.src!=='about:blank')setTimeout(()=>{if(dialog.open)document.querySelector('#frameFallback').hidden=false},4500)});
  document.querySelectorAll('[data-move]').forEach(btn=>{const dir=btn.dataset.move;const map={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'};btn.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(map[dir]);btn.setPointerCapture(e.pointerId)});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>btn.addEventListener(ev,()=>keys.delete(map[dir])))});
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&near)interact()});
  setNearby();draw();requestAnimationFrame(loop);
})();
