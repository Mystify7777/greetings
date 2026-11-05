const canvas=document.querySelector('#mazeCanvas'),ctx=canvas.getContext('2d');
const bossCanvas=document.querySelector('#bossCanvas'),bctx=bossCanvas.getContext('2d');
const startButton=document.querySelector('#startAdventure'),gameShell=document.querySelector('#gameShell'),gameStage=document.querySelector('#gameStage');
const missionState=document.querySelector('#missionState'),missionText=document.querySelector('#missionText'),stageHint=document.querySelector('#stageHint');
const hpStat=document.querySelector('#hpStat'),armourStat=document.querySelector('#armourStat'),braveryStat=document.querySelector('#braveryStat'),mobilityStat=document.querySelector('#mobilityStat'),memoryStat=document.querySelector('#memoryStat'),gameLog=document.querySelector('#gameLog');
const modal=document.querySelector('#rewardModal'),modalClose=document.querySelector('#modalClose'),rewardKicker=document.querySelector('#rewardKicker'),rewardTitle=document.querySelector('#rewardTitle'),rewardBody=document.querySelector('#rewardBody');
const bossShell=document.querySelector('#bossShell'),bossStage=document.querySelector('#bossStage'),bossBar=document.querySelector('#bossBar'),bossHpText=document.querySelector('#bossHpText'),bossMessage=document.querySelector('#bossMessage'),bossPlayerHp=document.querySelector('#bossPlayerHp');
const ending=document.querySelector('#ending'),runSummary=document.querySelector('#runSummary');

const TILE=40,W=19,H=14;
const MAP=[
"1111111111111111111",
"1000001000001000001",
"1011101011101011101",
"1000101000101000001",
"1110101110101110111",
"1000100000100000101",
"1011111011111010101",
"1000001000001010101",
"1111101011101010101",
"1000001010001000101",
"1011111010111110101",
"1000000010000000101",
"1001111110111110001",
"1111111111111111111"
];

const gates=[
  {x:15,y:5,need:2,label:'MEMORY GATE I'},
  {x:15,y:11,need:4,label:'MEMORY GATE II'},
  {x:9,y:11,need:6,label:'MEMORY GATE III'}
];

const relics=[
 {x:3,y:1,title:'First Memory',type:'PHOTO',icon:'✦',text:'The first little piece of the birthday archive. This slot is waiting for a real photo.',reward:'Recovered memory: +1 armour.'},
 {x:11,y:3,title:'A Hidden Note',type:'MESSAGE',icon:'✉',text:'Something small, personal and probably embarrassing in exactly the right way.',reward:'Recovered memory: +1 bravery.'},
 {x:5,y:5,title:'The Moving Memory',type:'VIDEO',icon:'▶',text:'A moving memory belongs here. Later this becomes a real video reveal.',reward:'Recovered memory: +1 mobility.'},
 {x:17,y:5,title:'Player Memory',type:'GAME',icon:'◆',text:'A memory from the years of games, chaos and questionable victory celebrations.',reward:'Recovered memory: +1 armour.'},
 {x:13,y:9,title:'The Ordinary Day',type:'MEMORY',icon:'◇',text:'The ordinary moments are usually the ones that become the good stories.',reward:'Recovered memory: +1 bravery.'},
 {x:17,y:11,title:'Birthday Letter',type:'LETTER',icon:'✎',text:'The proper birthday message goes here. For now, the chest is deliberately sealed around a placeholder.',reward:'Recovered memory: +1 armour and bravery.'},
 {x:9,y:12,title:'The Final Relic',type:'LEGEND',icon:'★',text:'The strongest memory is saved for last. Recovering it opens the final arena.',reward:'Final relic recovered: the Birthday Boss is awake.'}
];

const state={
 started:false,paused:false,keys:new Set(),player:{x:1.5*TILE,y:1.5*TILE,r:10},hp:3,armour:0,bravery:0,mobility:1,memory:0,deaths:0,lastTime:0,modalReturnFocus:gameStage,
 collected:new Set(),gateNotice:new Set(),bossUnlocked:false,bossDeaths:0
};

const mobDefs=[
 {x:1.5,y:3.5,speed:1.55,mode:'vertical',path:[[1,3],[1,4],[1,5],[1,6],[1,7]]},
 {x:8.5,y:3.5,speed:1.35,mode:'horizontal',path:[[7,3],[8,3],[9,3],[10,3]]},
 {x:5.5,y:8.5,speed:1.7,mode:'horizontal',path:[[5,8],[6,8],[7,8],[8,8]]},
 {x:13.5,y:8.5,speed:1.5,mode:'loop',path:[[13,8],[13,9],[13,10],[14,10],[15,10],[14,10],[13,10],[13,9]]},
 {x:11.5,y:11.5,speed:1.45,mode:'hunter',path:[[10,11],[11,11],[12,11],[13,11],[14,11]]}
];
const mobColors=['#52b7ff','#ffad4d','#b77cff','#5fe39a','#ff647c'];
const mobs=mobDefs.map((m,i)=>({...m,index:i,color:mobColors[i],px:m.x*TILE,py:m.y*TILE,target:0,dir:1,alert:0,pulse:0}));

const rewards=Object.fromEntries(relics.map((r,i)=>[i,r]));

function updateStats(){
 hpStat.textContent='♥'.repeat(Math.max(0,state.hp))+'♡'.repeat(3-Math.max(0,state.hp));
 armourStat.textContent=String(state.armour);
 braveryStat.textContent=String(state.bravery);
 mobilityStat.textContent=state.mobility.toFixed(1)+'×';
 memoryStat.textContent=state.memory+' / 7';
}
function setLog(msg){gameLog.textContent=msg}
function isGateOpen(g){return state.memory>=g.need}
function gateAt(x,y){return gates.find(g=>g.x===x&&g.y===y)}
function isBlockedTile(tx,ty){
 if(tx<0||ty<0||tx>=W||ty>=H||MAP[ty][tx]==='1')return true;
 const g=gateAt(tx,ty);
 return !!g&&!isGateOpen(g);
}
function circleHitsWall(x,y,r){
 const left=Math.floor((x-r)/TILE),right=Math.floor((x+r)/TILE),top=Math.floor((y-r)/TILE),bottom=Math.floor((y+r)/TILE);
 for(let ty=top;ty<=bottom;ty++)for(let tx=left;tx<=right;tx++){
   if(!isBlockedTile(tx,ty))continue;
   const rx=tx*TILE,ry=ty*TILE,nx=Math.max(rx,Math.min(x,rx+TILE)),ny=Math.max(ry,Math.min(y,ry+TILE));
   if((x-nx)**2+(y-ny)**2<r*r)return true;
 }
 return false;
}
function moveEntity(e,dx,dy){
 const nx=e.x+dx,ny=e.y+dy;
 if(!circleHitsWall(nx,e.y,e.r)){e.x=nx}
 if(!circleHitsWall(e.x,ny,e.r)){e.y=ny}
}
function resetPlayer(reason){
 if(state.armour>0){
   state.armour--;state.player.x=1.5*TILE;state.player.y=1.5*TILE;updateStats();
   setLog('ARMOUR ABSORBED THE HIT. The maze still has more to teach you.');
   return;
 }
 state.deaths++;state.bravery++;state.mobility=Math.min(2.5,state.mobility+.1);
 state.hp=3;state.player.x=1.5*TILE;state.player.y=1.5*TILE;
 updateStats();setLog(reason+' You learned something. Next attempt starts faster.');
 missionText.textContent=state.deaths%2?'The maze won that round. It does not keep the win.':'Caught. Good. Now you know where the danger is.';
}
function collectRelic(index){
 if(state.collected.has(index))return;
 state.collected.add(index);state.memory++;state.bravery++;
 if(index===0||index===3||index===5)state.armour++;
 if(index===2)state.mobility=Math.min(2.5,state.mobility+.15);
 updateStats();openReward(index);
 if(state.memory===7){missionState.textContent='CLEARED';missionText.textContent='Every memory recovered. The final arena is waiting.';setLog('ALL SEVEN MEMORIES RECOVERED. THE BIRTHDAY BOSS IS AWAKE.');}
 else setLog('Memory '+state.memory+' recovered. New route unlocked.');
}
function openReward(index){
 state.paused=true;gameStage.inert=true;modal.classList.add('open');modal.setAttribute('aria-hidden','false');state.modalReturnFocus=gameStage;
 const r=rewards[index];rewardKicker.textContent='MEMORY '+String(index+1).padStart(2,'0')+' // '+r.type;rewardTitle.textContent=r.icon+' '+r.title;
 rewardBody.innerHTML='<div class="reward-media"><div><strong>'+r.type+' SLOT</strong><br>Replace this panel with the real birthday photo, video or message.</div></div><p>'+r.text+'</p><div class="reward-reward">'+r.reward+'</div>';
 setTimeout(()=>modalClose.focus(),0);
}
function closeReward(){
 modal.classList.remove('open');modal.setAttribute('aria-hidden','true');gameStage.inert=false;state.paused=false;setTimeout(()=>gameStage.focus(),0);
 if(state.memory===7&&!state.bossUnlocked)unlockBoss();
}
function unlockBoss(){
 state.bossUnlocked=true;bossShell.hidden=false;bossShell.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});bossStage.focus();initBoss();missionState.textContent='BOSS';setLog('FINAL RELIC RECOVERED. ENTER THE BIRTHDAY ARENA.');
}
function trapModalFocus(e){
 if(!modal.classList.contains('open'))return;
 if(e.key==='Escape'){e.preventDefault();closeReward();return}
 if(e.key!=='Tab')return;
 const focusables=[...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')];
 if(!focusables.length)return;
 const first=focusables[0],last=focusables[focusables.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
}
document.addEventListener('keydown',trapModalFocus);
modalClose.addEventListener('click',closeReward);
modal.querySelector('[data-close-modal]').addEventListener('click',closeReward);

function handleKeyDown(e){
 const k=e.key.toLowerCase();
 if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)||e.code==='Space'){e.preventDefault();state.keys.add(k);if(k===' '||e.code==='Space')bossState.attackQueued=true}
}
function handleKeyUp(e){state.keys.delete(e.key.toLowerCase())}
gameStage.addEventListener('keydown',handleKeyDown);bossStage.addEventListener('keydown',handleKeyDown);
gameStage.addEventListener('keyup',handleKeyUp);bossStage.addEventListener('keyup',handleKeyUp);
gameStage.addEventListener('click',()=>gameStage.focus());bossStage.addEventListener('click',()=>bossStage.focus());

document.querySelectorAll('[data-dir]').forEach(btn=>{
 const dir=btn.dataset.dir;
 const map={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'};
 const press=()=>state.keys.add(map[dir]),release=()=>state.keys.delete(map[dir]);
 btn.addEventListener('pointerdown',e=>{e.preventDefault();press()});btn.addEventListener('pointerup',release);btn.addEventListener('pointerleave',release);
});

startButton.addEventListener('click',()=>{
 gameShell.hidden=false;state.started=true;missionState.textContent='ACTIVE';stageHint.textContent='FOCUS ACTIVE · WASD / ARROWS TO MOVE';
 gameShell.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});
 setTimeout(()=>gameStage.focus(),matchMedia('(prefers-reduced-motion:reduce)').matches?0:180);
 setLog('Adventure started. The first memory is close. The maze is not.');
});

function updatePlayer(dt){
 let dx=0,dy=0;
 if(state.keys.has('arrowleft')||state.keys.has('a'))dx--;
 if(state.keys.has('arrowright')||state.keys.has('d'))dx++;
 if(state.keys.has('arrowup')||state.keys.has('w'))dy--;
 if(state.keys.has('arrowdown')||state.keys.has('s'))dy++;
 if(dx||dy){const len=Math.hypot(dx,dy);const speed=115*state.mobility;moveEntity(state.player,dx/len*speed*dt,dy/len*speed*dt)}
 const tx=Math.floor(state.player.x/TILE),ty=Math.floor(state.player.y/TILE);
 relics.forEach((r,i)=>{if(!state.collected.has(i)&&Math.hypot(state.player.x-(r.x+.5)*TILE,state.player.y-(r.y+.5)*TILE)<15)collectRelic(i)});
 mobs.forEach(m=>{if(Math.hypot(state.player.x-m.px,state.player.y-m.py)<20)resetPlayer('GUARDIAN CONTACT.')});
}
function pathPoint(m){const p=m.path[m.target];return {x:(p[0]+.5)*TILE,y:(p[1]+.5)*TILE}}
function updateMobs(dt){
 mobs.forEach(m=>{
   m.pulse+=dt;
   const p=pathPoint(m),dx=p.x-m.px,dy=p.y-m.py,d=Math.hypot(dx,dy);
   const chase=m.mode==='hunter'&&Math.hypot(state.player.x-m.px,state.player.y-m.py)<145;
   if(chase){m.alert=Math.min(1,m.alert+dt*3);const ang=Math.atan2(state.player.y-m.py,state.player.x-m.px);m.px+=Math.cos(ang)*m.speed*92*dt;m.py+=Math.sin(ang)*m.speed*92*dt}
   else{m.alert=Math.max(0,m.alert-dt*2);if(d<2){m.target=(m.target+m.dir+m.path.length)%m.path.length}const pp=pathPoint(m),a=Math.atan2(pp.y-m.py,pp.x-m.px);m.px+=Math.cos(a)*m.speed*92*dt;m.py+=Math.sin(a)*m.speed*92*dt}
   if(m.mode==='loop'&&m.target===0)m.dir=1;
   if(m.mode==='horizontal'&&m.target===m.path.length-1)m.dir=-1;
   if(m.mode==='horizontal'&&m.target===0)m.dir=1;
   if(m.mode==='vertical'&&m.target===m.path.length-1)m.dir=-1;
   if(m.mode==='vertical'&&m.target===0)m.dir=1;
 });
}
function drawMaze(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#060a13';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const wall=MAP[y][x]==='1';ctx.fillStyle=wall?'#17233b':'#070d18';ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
   ctx.strokeStyle=wall?'#263856':'#101a2c';ctx.strokeRect(x*TILE+.5,y*TILE+.5,TILE-1,TILE-1);
   const g=gateAt(x,y);if(g&&!isGateOpen(g)){ctx.fillStyle='#2a1730';ctx.fillRect(x*TILE+4,y*TILE+4,TILE-8,TILE-8);ctx.strokeStyle='#ff78ad';ctx.lineWidth=2;ctx.strokeRect(x*TILE+6,y*TILE+6,TILE-12,TILE-12);ctx.lineWidth=1;ctx.fillStyle='#ff78ad';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(g.need+'',x*TILE+20,y*TILE+24)}
 }
 relics.forEach((r,i)=>{if(state.collected.has(i))return;const cx=(r.x+.5)*TILE,cy=(r.y+.5)*TILE,pulse=Math.sin(performance.now()/280+i)*2;ctx.beginPath();ctx.arc(cx,cy,10+pulse,0,Math.PI*2);ctx.fillStyle='#ffd866';ctx.fill();ctx.fillStyle='#3b2b0b';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(String(i+1),cx,cy+3)});
 mobs.forEach(m=>{const bob=Math.sin(m.pulse*5+m.index)*2,cx=m.px,cy=m.py+bob;ctx.beginPath();ctx.arc(cx,cy,14+(m.alert*2),0,Math.PI*2);ctx.fillStyle=m.alert>.2?m.color:m.color;ctx.globalAlpha=m.alert>.2?1:.82;ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#310d1e';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText('!',cx,cy+5);if(m.alert>.2){ctx.strokeStyle=m.color+'88';ctx.beginPath();ctx.arc(cx,cy,21+Math.sin(m.pulse*8)*3,0,Math.PI*2);ctx.stroke()}});
 const p=state.player;ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.fillStyle='#70e6d6';ctx.fill();ctx.fillStyle='#06211e';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('R',p.x,p.y+4);
}
function frame(t){
 const dt=Math.min(.035,(t-state.lastTime)/1000||0);state.lastTime=t;
 if(state.started&&!state.paused&&bossShell.hidden&&ending.hidden){updatePlayer(dt);updateMobs(dt);drawMaze()}
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

const bossState={active:false,player:{x:100,y:210,r:11,hp:5},boss:{x:620,y:210,r:25,hp:20,maxHp:20,phase:1,shotTimer:0,moveTimer:0,dir:1},shots:[],playerShots:[],attackQueued:false,last:0};
function initBoss(){bossState.active=true;bossState.player={x:100,y:210,r:11,hp:5};bossState.boss={x:620,y:210,r:25,hp:20,maxHp:20,phase:1,shotTimer:0,moveTimer:0,dir:1};bossState.shots=[];bossState.playerShots=[];bossState.last=performance.now();bossMessage.textContent='The boss is waiting. Find the rhythm.';bossPlayerHp.textContent='♥♥♥♥♥';}
function bossMove(dt){
 let dx=0,dy=0;if(state.keys.has('arrowleft')||state.keys.has('a'))dx--;if(state.keys.has('arrowright')||state.keys.has('d'))dx++;if(state.keys.has('arrowup')||state.keys.has('w'))dy--;if(state.keys.has('arrowdown')||state.keys.has('s'))dy++;
 if(dx||dy){const l=Math.hypot(dx,dy);bossState.player.x=Math.max(15,Math.min(745,bossState.player.x+dx/l*170*state.mobility*dt));bossState.player.y=Math.max(15,Math.min(405,bossState.player.y+dy/l*170*state.mobility*dt))}
 if(bossState.attackQueued){bossState.attackQueued=false;if(bossState.playerShots.length<4){const a=Math.atan2(bossState.boss.y-bossState.player.y,bossState.boss.x-bossState.player.x);bossState.playerShots.push({x:bossState.player.x+15*Math.cos(a),y:bossState.player.y+15*Math.sin(a),vx:Math.cos(a)*420,vy:Math.sin(a)*420})}}
}
function updateBoss(dt){
 if(!bossState.active)return;
 bossMove(dt);const b=bossState.boss;
 b.phase=b.hp<=6?3:b.hp<=13?2:1;b.moveTimer+=dt;b.shotTimer+=dt;
 const targetY=210+Math.sin(b.moveTimer*(b.phase===3?3.4:2.2))*110;
 b.y+=(targetY-b.y)*dt*2.2;
 if(b.shotTimer>(b.phase===3?.48:b.phase===2?.68:.95)){b.shotTimer=0;const a=Math.atan2(bossState.player.y-b.y,bossState.player.x-b.x),speed=b.phase===3?270:b.phase===2?225:205;bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed});if(b.phase>=2){const spread=b.phase===3?.16:.1;[-spread,spread].forEach(offset=>bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(a+offset)*speed,vy:Math.sin(a+offset)*speed}))}}
 bossState.shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
 bossState.playerShots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
 bossState.shots=bossState.shots.filter(s=>s.x>-20&&s.x<780&&s.y>-20&&s.y<440);
 bossState.playerShots=bossState.playerShots.filter(s=>s.x<780);
 bossState.shots.forEach(s=>{if(Math.hypot(s.x-bossState.player.x,s.y-bossState.player.y)<bossState.player.r+5){s.x=-99;bossState.player.hp--;bossPlayerHp.textContent='♥'.repeat(bossState.player.hp)+'♡'.repeat(5-bossState.player.hp);bossMessage.textContent='HIT. Read the pattern, then move.';if(bossState.player.hp<=0)bossDefeat()}});
 bossState.playerShots.forEach(s=>{if(Math.hypot(s.x-b.x,s.y-b.y)<b.r+5){s.x=9999;b.hp--;bossMessage.textContent=b.phase===1?'Good hit. The pattern is opening.':b.phase===2?'The boss is changing phases. Keep moving.':'Final phase. Do not stop.';updateBossHud();if(b.hp<=0)winBoss()}});
 drawBoss();
}
function drawBoss(){
 bctx.clearRect(0,0,bossCanvas.width,bossCanvas.height);
 bctx.fillStyle='#070b14';bctx.fillRect(0,0,bossCanvas.width,bossCanvas.height);
 for(let i=0;i<12;i++){bctx.strokeStyle=i%2?'#101a2b':'#0d1625';bctx.beginPath();bctx.moveTo(i*70,0);bctx.lineTo(i*70,bossCanvas.height);bctx.stroke()}
 for(let i=0;i<7;i++){bctx.strokeStyle='#101a2b';bctx.beginPath();bctx.moveTo(0,i*70);bctx.lineTo(bossCanvas.width,i*70);bctx.stroke()}
 const b=bossState.boss,p=bossState.player;
 bctx.strokeStyle=b.phase===3?'#ff647c':'#ff78ad';bctx.lineWidth=2;bctx.beginPath();bctx.arc(b.x,b.y,38+Math.sin(performance.now()/120)*4,0,Math.PI*2);bctx.stroke();
 bctx.fillStyle=b.phase===3?'#ff647c':b.phase===2?'#ffad4d':'#ff78ad';bctx.beginPath();bctx.arc(b.x,b.y,b.r,0,Math.PI*2);bctx.fill();
 bctx.fillStyle='#330b1e';bctx.font='bold 18px monospace';bctx.textAlign='center';bctx.fillText('B',b.x,b.y+6);
 bctx.fillStyle='#70e6d6';bctx.beginPath();bctx.arc(p.x,p.y,p.r,0,Math.PI*2);bctx.fill();bctx.fillStyle='#06211e';bctx.font='bold 11px monospace';bctx.fillText('R',p.x,p.y+4);
 bctx.fillStyle='#ff647c';bossState.shots.forEach(s=>{bctx.beginPath();bctx.arc(s.x,s.y,5,0,Math.PI*2);bctx.fill()});
 bctx.fillStyle='#ffd866';bossState.playerShots.forEach(s=>{bctx.beginPath();bctx.arc(s.x,s.y,4,0,Math.PI*2);bctx.fill()});
 bctx.fillStyle='#71809e';bctx.font='10px monospace';bctx.textAlign='left';bctx.fillText('PHASE '+b.phase,14,20);
}
function updateBossHud(){bossBar.style.width=Math.max(0,bossState.boss.hp/bossState.boss.maxHp*100)+'%';bossHpText.textContent=Math.max(0,bossState.boss.hp)+' / '+bossState.boss.maxHp}
function bossDefeat(){bossState.active=false;state.bossDeaths++;state.bravery++;state.mobility=Math.min(2.5,state.mobility+.15);updateStats();bossMessage.textContent=['DOWN, NOT OUT. You learned the attack timing.','THE BOSS WON THAT ROUND. Now you know what to dodge.','DEFEATED. Good. Knowledge acquired.','ONE MORE ROUND. The opening is there.'][state.bossDeaths%4];setTimeout(()=>initBoss(),500)}
function winBoss(){bossState.active=false;bossMessage.textContent='BOSS DEFEATED. QUEST COMPLETE.';ending.hidden=false;runSummary.textContent='MEMORIES 7/7 · BRAVERY '+state.bravery+' · MOBILITY '+state.mobility.toFixed(1)+'× · MAZE DEATHS '+state.deaths+' · BOSS ATTEMPTS '+(state.bossDeaths+1);ending.scrollIntoView({behavior:'smooth',block:'center'});}
function bossFrame(t){const dt=Math.min(.035,(t-bossState.last)/1000||0);bossState.last=t;if(state.started&&!state.paused&&bossState.active)updateBoss(dt);requestAnimationFrame(bossFrame)}
requestAnimationFrame(bossFrame);

document.addEventListener('visibilitychange',()=>{if(document.hidden){state.keys.clear();state.paused=true}else if(modal.getAttribute('aria-hidden')==='true'){state.paused=false}});

updateStats();
