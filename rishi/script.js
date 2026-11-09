const canvas=document.querySelector('#mazeCanvas'),ctx=canvas.getContext('2d');
const bossCanvas=document.querySelector('#bossCanvas'),bctx=bossCanvas.getContext('2d');
const startButton=document.querySelector('#startAdventure'),gameShell=document.querySelector('#gameShell'),gameStage=document.querySelector('#gameStage');
const missionState=document.querySelector('#missionState'),missionText=document.querySelector('#missionText'),stageHint=document.querySelector('#stageHint');
const storyBeat=document.querySelector('#storyBeat'),storyBeatMarker=document.querySelector('#storyBeatMarker'),storyBeatKicker=document.querySelector('#storyBeatKicker'),storyBeatTitle=document.querySelector('#storyBeatTitle'),storyBeatText=document.querySelector('#storyBeatText');
const hpStat=document.querySelector('#hpStat'),armourStat=document.querySelector('#armourStat'),braveryStat=document.querySelector('#braveryStat'),mobilityStat=document.querySelector('#mobilityStat'),memoryStat=document.querySelector('#memoryStat'),gameLog=document.querySelector('#gameLog');
const modal=document.querySelector('#rewardModal'),modalClose=document.querySelector('#modalClose'),rewardKicker=document.querySelector('#rewardKicker'),rewardTitle=document.querySelector('#rewardTitle'),rewardBody=document.querySelector('#rewardBody');
const relicPrompt=document.querySelector('#relicPrompt'),relicPromptType=document.querySelector('#relicPromptType'),relicPromptTitle=document.querySelector('#relicPromptTitle'),claimMemory=document.querySelector('#claimMemory');
const chapter4Intro=document.querySelector('#chapter4Intro'),bossShell=document.querySelector('#bossShell'),bossStage=document.querySelector('#bossStage'),bossBar=document.querySelector('#bossBar'),bossHpText=document.querySelector('#bossHpText'),bossMessage=document.querySelector('#bossMessage'),bossPlayerHp=document.querySelector('#bossPlayerHp');
const ending=document.querySelector('#ending'),runSummary=document.querySelector('#runSummary'),secretReveal=document.querySelector('#secretReveal');

const TILE=40,W=25,H=17;
const MAP=[
"1111111111111111111111111",
"1000000000101000000000001",
"1110111110101010101111101",
"1000000010101010000010001",
"1110111010101011111010111",
"1000101010100010000010001",
"1011101010101110111110101",
"1010000010000010100000101",
"1011101111111010101011101",
"1000100000001000101010001",
"1010111110101111111010111",
"1010001000001000000010101",
"1111101111111011101010101",
"1000001000000010101010101",
"1010111011111010101110101",
"1000000000000000100000001",
"1111111111111111111111111"
];

const gates=[
  {x:9,y:10,need:2,label:'MEMORY GATE I'},
  {x:15,y:8,need:4,label:'MEMORY GATE II'},
  {x:21,y:14,need:6,label:'MEMORY GATE III'}
];

const relics=[
 {x:7,y:3,title:'First Memory',type:'PHOTO',icon:'✦',text:'The first little piece of the birthday archive. This slot is waiting for a real photo.',reward:'Recovered memory: +1 armour.'},
 {x:5,y:7,title:'A Hidden Note',type:'MESSAGE',icon:'✉',text:'Something small, personal and probably embarrassing in exactly the right way.',reward:'Recovered memory: +1 bravery and +1 HP (up to 5).'},
 {x:7,y:9,title:'The Moving Memory',type:'VIDEO',icon:'▶',text:'A moving memory belongs here. Later this becomes a real video reveal.',reward:'Recovered memory: +1 mobility.'},
 {x:13,y:3,title:'Player Memory',type:'GAME',icon:'◆',text:'A memory from the years of games, chaos and questionable victory celebrations.',reward:'Recovered memory: +1 armour.'},
 {x:16,y:3,title:'The Ordinary Day',type:'MEMORY',icon:'◇',text:'The ordinary moments are usually the ones that become the good stories.',reward:'Recovered memory: +1 bravery and +1 HP (up to 5).'},
 {x:10,y:13,title:'Birthday Letter',type:'LETTER',icon:'✎',text:'The proper birthday message goes here. For now, the chest is deliberately sealed around a placeholder.',reward:'Recovered memory: +1 armour, +1 bravery and +1 HP (up to 5).'},
 {x:22,y:15,title:'The Final Relic',type:'LEGEND',icon:'★',text:'The strongest memory is saved for last. Recovering it opens the final arena.',reward:'Final relic recovered: the Birthday Boss is awake.'}
];

const state={
 started:false,paused:false,keys:new Set(),player:{x:1.5*TILE,y:1.5*TILE,r:10},hp:5,armour:0,bravery:0,mobility:1,memory:0,deaths:0,lastTime:0,invulnerableUntil:0,modalReturnFocus:gameStage,
 collected:new Set(),gateNotice:new Set(),claimOrder:[],pendingRelic:null,pendingSecret:null,bossUnlocked:false,bossDeaths:0,resumeUntil:0,pendingBossUnlock:false
};

const mobDefs=[
 {x:7.5,y:1.5,speed:1.55,mode:'horizontal',path:[[7,1],[8,1],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6],[9,7],[7,7],[7,6],[7,5],[7,4]]},
 {x:11.5,y:1.5,speed:1.35,mode:'vertical',path:[[11,1],[11,2],[11,3],[11,4],[11,5],[11,6],[11,7],[10,7]]},
 {x:5.5,y:5.5,speed:1.7,mode:'loop',path:[[5,5],[5,6],[5,7],[6,7],[7,7],[7,6],[7,5],[7,4],[7,3],[6,3],[5,3],[4,3],[3,3],[3,2],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[9,2],[9,3],[9,4],[9,5],[9,6],[9,7],[10,7],[11,7],[11,6],[11,5]]},
 {x:13.5,y:9.5,speed:1.5,mode:'vertical',path:[[13,9],[14,9],[15,9],[15,8],[15,7],[15,6],[15,5],[16,5],[17,5],[18,5],[19,5],[19,4],[19,3],[18,3],[17,3],[17,2],[17,1],[18,1],[19,1],[20,1],[21,1],[22,1],[23,1],[23,2],[23,3],[22,3],[21,3],[21,4],[21,5],[21,6],[21,7],[20,7],[19,7],[19,8],[19,9],[19,10],[19,11],[18,11],[17,11],[16,11],[15,11],[14,11],[13,11],[13,12],[13,13],[13,14],[13,15]]},
 {x:17.5,y:11.5,speed:1.45,mode:'hunter',path:[[17,11],[17,12],[17,13],[17,14],[17,15],[18,15],[19,15],[20,15],[21,15],[22,15],[23,15]]}
];
const mobColors=['#52b7ff','#ffad4d','#b77cff','#5fe39a','#ff647c'];
const mobs=mobDefs.map((m,i)=>({...m,index:i,color:mobColors[i],px:m.x*TILE,py:m.y*TILE,target:0,dir:1,alert:0,pulse:0}));

const rewards=Object.fromEntries(relics.map((r,i)=>[i,r]));
// The Trick follows the maze's natural relic order. The Treat deliberately zig-zags across the map.
const secretRoutes=[
 {kind:'TRICK',sequence:[1,2,3,4,5,6,7],title:'THE EMBARRASSING ARCHIVE',text:'You found the wrong kind of treasure. Somewhere in Rishi\'s personal history is a video that absolutely should not have survived. The real clip goes here.',media:'VIDEO SLOT // EMBARRASSING & FUNNY'},
 {kind:'TREAT',sequence:[1,4,7,2,6,3,5],title:'THE CHERISHED MEMORY',text:'You found the hidden route. This is the kind of memory that makes the whole maze worth walking: a real moment, kept because it mattered.',media:'MEMORY SLOT // CHERISHED & PERSONAL'}
];

function updateStats(){
 hpStat.textContent='♥'.repeat(Math.max(0,state.hp))+'♡'.repeat(5-Math.max(0,state.hp));
 armourStat.textContent=String(state.armour);
 braveryStat.textContent=String(state.bravery);
 mobilityStat.textContent=state.mobility.toFixed(1)+'×';
 memoryStat.textContent=state.memory+' / 7';
}
function setLog(msg){gameLog.textContent=msg}
function setStory(marker,kicker,title,text){
 storyBeatMarker.textContent=marker;storyBeatKicker.textContent=kicker;storyBeatTitle.textContent=title;storyBeatText.textContent=text;
 storyBeat.classList.remove('story-pulse');void storyBeat.offsetWidth;storyBeat.classList.add('story-pulse');
}
function updateStoryAfterProgress(){
 if(state.memory===0)return;
 if(state.memory===1)setStory("CHAPTER II","THE FIRST MEMORY","The past is never as far away as it looks.","The first memory is recovered. One ordinary piece of Rishi's life is enough to remind us that a big story is built from small days.");
 else if(state.memory===2)setStory("CHAPTER II","THE PEOPLE & DAYS","Two memories. Two reasons to keep going.","Not every important moment looks important while it is happening. Some become precious only after time has passed.");
 else if(state.memory===3)setStory("CHAPTER II","THE YEARS","Halfway through the archive.","The maze is getting harder. So is life. Rishi does not get through it by avoiding every obstacle. He gets through it by learning what each one teaches.");
 else if(state.memory===4)setStory("CHAPTER III","THE TURNING POINT","Four memories recovered. The route ahead changes.","At some point, growing up stops being about becoming someone else. It becomes about carrying what you have learned without letting it weigh you down.");
 else if(state.memory===5)setStory("CHAPTER III","THE HARD PART","The last two memories are behind harder doors.","There are chapters nobody volunteers for. Setbacks, mistakes, bad days, missed chances. They still become part of the person who keeps moving.");
 else if(state.memory===6)setStory("CHAPTER IV","THE EDGE OF THE STORY","One memory remains. The easy part is over.","The final door does not open because Rishi is fearless. It opens because he has learned that fear is allowed to come along for the ride.");
 else if(state.memory===7)setStory("CHAPTER IV","THE FIGHT","The memories are safe. Now the story asks a harder question.","What happens when remembering is not enough? The last obstacle is not another memory. It is the part of every story where you have to get back up and fight for the ending.");
}
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
 if(performance.now()<state.invulnerableUntil)return;
 state.invulnerableUntil=performance.now()+750;
 if(state.armour>0){
   state.armour--;state.player.x=1.5*TILE;state.player.y=1.5*TILE;updateStats();
   setLog('ARMOUR ABSORBED THE HIT. '+reason+' The shield held.');
   return;
 }
 state.hp--;
 if(state.hp>0){
   state.player.x=1.5*TILE;state.player.y=1.5*TILE;updateStats();
   setLog(reason+' HP -1. You have '+state.hp+' heart'+(state.hp===1?'':'s')+' left.');
   missionText.textContent=state.hp<=2?'Low health. The next memory matters.':'The maze hit hard. Keep moving.';
   return;
 }
 state.deaths++;state.bravery++;state.mobility=Math.min(2.5,state.mobility+.1);
 state.hp=5;state.armour=0;state.player.x=1.5*TILE;state.player.y=1.5*TILE;
 updateStats();setLog(reason+' You ran out of HP. The next attempt starts with a full recovery.');
 missionText.textContent=state.deaths%2?'The maze won that round. It does not keep the win.':'Caught. Good. Now you know where the danger is.';
 setStory("CHAPTER III","THE SETBACK","Rishi falls. The story does not.","Every failed run changes the next one. A little more bravery. A little more speed. A little more knowledge. The point was never to avoid falling.");
}
function collectRelic(index){
 if(state.collected.has(index))return;
 state.collected.add(index);state.memory++;state.bravery++;state.claimOrder.push(index+1);
 state.pendingRelic=null;relicPrompt.hidden=true;
 if(index===0||index===3||index===5)state.armour++;
 if(index===1||index===4||index===5)state.hp=Math.min(5,state.hp+1);
 if(index===2)state.mobility=Math.min(2.5,state.mobility+.15);
 updateStats();updateStoryAfterProgress();openReward(index);
 if(state.memory===7){
   missionState.textContent='CLEARED';missionText.textContent='Every memory recovered. The final arena is waiting.';
   const secret=secretRoutes.find(route=>route.sequence.every((value,i)=>state.claimOrder[i]===value));
   state.pendingSecret=secret||null;
   setLog(secret?'SECRET ROUTE FOUND. Claim the memory to see what you unlocked.':'ALL SEVEN MEMORIES RECOVERED. THE BIRTHDAY BOSS IS AWAKE.');
 }else setLog('Memory '+state.memory+' recovered. New route unlocked.');
}
function openReward(index){
 state.keys.clear();state.paused=true;gameStage.inert=true;modal.classList.add('open');modal.setAttribute('aria-hidden','false');state.modalReturnFocus=gameStage;
 const r=rewards[index];rewardKicker.textContent='MEMORY '+String(index+1).padStart(2,'0')+' // '+r.type;rewardTitle.textContent=r.icon+' '+r.title;
 rewardBody.innerHTML='<div class="reward-media"><div><strong>'+r.type+' SLOT</strong><br>Replace this panel with the real birthday photo, video or message.</div></div><p>'+r.text+'</p><div class="reward-reward">'+r.reward+'</div>';
 setTimeout(()=>modalClose.focus(),0);
}
function openSecretReward(secret){
 state.keys.clear();state.paused=true;gameStage.inert=true;modal.classList.add('open');modal.setAttribute('aria-hidden','false');state.modalReturnFocus=gameStage;
 rewardKicker.textContent='SECRET MEMORY // '+secret.kind;rewardTitle.textContent='✦ '+secret.title;
 rewardBody.innerHTML='<div class="reward-media secret-media"><div><strong>'+secret.media+'</strong><br>Replace this slot with the real birthday '+(secret.kind==='TRICK'?'video':'memory')+' when the content is ready.</div></div><p>'+secret.text+'</p><div class="reward-reward">SECRET ROUTE COMPLETE. You found something the main story does not reveal.</div>';
 setTimeout(()=>modalClose.focus(),0);
}
function closeReward(){
 const secret=state.pendingSecret;
 state.pendingSecret=null;
 state.keys.clear();modal.classList.remove('open');modal.setAttribute('aria-hidden','true');gameStage.inert=false;
 if(secret){
   state.paused=true;
   setTimeout(()=>openSecretReward(secret),260);
   return;
 }
 state.paused=false;state.resumeUntil=0;state.pendingBossUnlock=state.memory===7&&!state.bossUnlocked;resumeOverlay.hidden=true;if(state.pendingBossUnlock){state.pendingBossUnlock=false;unlockBoss()}else setTimeout(()=>gameStage.focus(),0);
}
function unlockBoss(){
 state.bossUnlocked=true;chapter4Intro.hidden=false;bossShell.hidden=false;setStory("CHAPTER IV","THE FIGHT","The final obstacle is not a memory. It is a test.","Twenty-two years do not become a story because everything went right. They become a story because every difficult chapter eventually has a next page.");chapter4Intro.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});bossStage.focus();initBoss();missionState.textContent='BOSS';setLog('FINAL RELIC RECOVERED. ENTER THE BIRTHDAY ARENA.');
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
 if((k==='e'||k==='enter')&&state.pendingRelic!==null&&!state.paused){e.preventDefault();collectRelic(state.pendingRelic);return}
 if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)||e.code==='Space'){e.preventDefault();state.keys.add(k);if(k===' '||e.code==='Space')bossState.attackQueued=true}
}
function handleKeyUp(e){state.keys.delete(e.key.toLowerCase())}
gameStage.addEventListener('keydown',handleKeyDown);bossStage.addEventListener('keydown',handleKeyDown);
document.addEventListener('keyup',handleKeyUp);
claimMemory.addEventListener('click',()=>{if(state.pendingRelic!==null&&!state.paused)collectRelic(state.pendingRelic)});
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
 setLog('CHAPTER III BEGINS. The next part cannot be read from a screen.');
 setStory('CHAPTER III','THE MAZE','Now you have to live the difficult chapter.','The next part cannot be read from a screen. Rishi has to walk it. Learn the guardians. Find the memories. Get lost. Try again.');
});

function updatePlayer(dt){
 let dx=0,dy=0;
 if(state.keys.has('arrowleft')||state.keys.has('a'))dx--;
 if(state.keys.has('arrowright')||state.keys.has('d'))dx++;
 if(state.keys.has('arrowup')||state.keys.has('w'))dy--;
 if(state.keys.has('arrowdown')||state.keys.has('s'))dy++;
 if(dx||dy){const len=Math.hypot(dx,dy);const speed=115*state.mobility;moveEntity(state.player,dx/len*speed*dt,dy/len*speed*dt)}
 let nearbyRelic=null;
 relics.forEach((r,i)=>{
  if(!state.collected.has(i)&&Math.hypot(state.player.x-(r.x+.5)*TILE,state.player.y-(r.y+.5)*TILE)<30)nearbyRelic=i;
 });
 if(nearbyRelic!==null){
  state.pendingRelic=nearbyRelic;
  const r=relics[nearbyRelic];
  relicPromptType.textContent='MEMORY '+String(nearbyRelic+1).padStart(2,'0')+' // '+r.type;
  relicPromptTitle.textContent=r.title;
  relicPrompt.hidden=false;
 }else{
  state.pendingRelic=null;
  relicPrompt.hidden=true;
 }
 if(state.paused)return;
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
 relics.forEach((r,i)=>{
  if(state.collected.has(i))return;
  const cx=(r.x+.5)*TILE,cy=(r.y+.5)*TILE,pulse=Math.sin(performance.now()/280+i)*2,near=state.pendingRelic===i;
  ctx.beginPath();ctx.arc(cx,cy,near?15+pulse:10+pulse,0,Math.PI*2);ctx.fillStyle=near?'#fff0a3':'#ffd866';ctx.fill();
  if(near){ctx.strokeStyle='#fff0a3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,19+pulse,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1}
  ctx.fillStyle='#3b2b0b';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(String(i+1),cx,cy+3);
});
 mobs.forEach(m=>{const bob=Math.sin(m.pulse*5+m.index)*2,cx=m.px,cy=m.py+bob;ctx.beginPath();ctx.arc(cx,cy,14+(m.alert*2),0,Math.PI*2);ctx.fillStyle=m.alert>.2?m.color:m.color;ctx.globalAlpha=m.alert>.2?1:.82;ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#310d1e';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText('!',cx,cy+5);if(m.alert>.2){ctx.strokeStyle=m.color+'88';ctx.beginPath();ctx.arc(cx,cy,21+Math.sin(m.pulse*8)*3,0,Math.PI*2);ctx.stroke()}});
 const p=state.player;ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.fillStyle='#70e6d6';ctx.fill();ctx.fillStyle='#06211e';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('R',p.x,p.y+4);
}
function frame(t){
 const dt=Math.min(.035,(t-state.lastTime)/1000||0);state.lastTime=t;
 if(state.resumeUntil){state.resumeUntil=0;resumeOverlay.hidden=true;state.paused=false;if(state.pendingBossUnlock){state.pendingBossUnlock=false;unlockBoss()}}
 if(state.started&&!state.paused&&bossShell.hidden&&ending.hidden){updatePlayer(dt);updateMobs(dt);drawMaze()}
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

const bossState={active:false,startingHp:5,startingArmour:0,player:{x:100,y:210,r:11,hp:5,armour:0,invulnerableUntil:0},boss:{x:620,y:210,r:25,hp:50,maxHp:50,phase:1,shotTimer:0,moveTimer:0,dir:1,vx:0,vy:0},shots:[],playerShots:[],attackQueued:false,last:0};
function initBoss(){bossState.active=true;bossState.startingHp=Math.max(1,state.hp);bossState.startingArmour=state.armour;bossState.player={x:100,y:210,r:11,hp:bossState.startingHp,armour:bossState.startingArmour,invulnerableUntil:0};bossState.boss={x:620,y:210,r:25,hp:50,maxHp:50,phase:1,shotTimer:0,moveTimer:0,dir:1,vx:0,vy:0};bossState.shots=[];bossState.playerShots=[];bossState.last=performance.now();bossMessage.textContent='The boss is waiting. Find the rhythm. Your maze health and armour carried forward.';updateBossHud();}
function bossMove(dt){
 let dx=0,dy=0;if(state.keys.has('arrowleft')||state.keys.has('a'))dx--;if(state.keys.has('arrowright')||state.keys.has('d'))dx++;if(state.keys.has('arrowup')||state.keys.has('w'))dy--;if(state.keys.has('arrowdown')||state.keys.has('s'))dy++;
 if(dx||dy){const l=Math.hypot(dx,dy);bossState.player.x=Math.max(15,Math.min(745,bossState.player.x+dx/l*170*state.mobility*dt));bossState.player.y=Math.max(15,Math.min(405,bossState.player.y+dy/l*170*state.mobility*dt))}
 if(bossState.attackQueued){bossState.attackQueued=false;if(bossState.playerShots.length<4){const a=Math.atan2(bossState.boss.y-bossState.player.y,bossState.boss.x-bossState.player.x);bossState.playerShots.push({x:bossState.player.x+15*Math.cos(a),y:bossState.player.y+15*Math.sin(a),vx:Math.cos(a)*420,vy:Math.sin(a)*420})}}
}
function updateBoss(dt){
 if(!bossState.active)return;
 bossMove(dt);const b=bossState.boss;
 b.phase=b.hp<=16?3:b.hp<=32?2:1;b.moveTimer+=dt;b.shotTimer+=dt;
 const dx=bossState.player.x-b.x,dy=bossState.player.y-b.y,d=Math.hypot(dx,dy)||1,aggression=b.phase===3?1:b.phase===2?.72:.42,desiredSpeed=b.phase===3?92:b.phase===2?68:48,orbit=Math.sin(b.moveTimer*2.2)*(b.phase===3?55:35),tx=bossState.player.x+(-dy/d)*orbit,ty=bossState.player.y+(dx/d)*orbit;
 b.vx+=(tx-b.x)/Math.max(1,d)*desiredSpeed*aggression*dt*3;b.vy+=(ty-b.y)/Math.max(1,d)*desiredSpeed*aggression*dt*3;const v=Math.hypot(b.vx,b.vy)||1;if(v>desiredSpeed){b.vx=b.vx/v*desiredSpeed;b.vy=b.vy/v*desiredSpeed}b.x=Math.max(35,Math.min(725,b.x+b.vx*dt));b.y=Math.max(35,Math.min(385,b.y+b.vy*dt));
 if(b.shotTimer>(b.phase===3?.38:b.phase===2?.55:.78)){b.shotTimer=0;const a=Math.atan2(bossState.player.y-b.y,bossState.player.x-b.x),speed=b.phase===3?305:b.phase===2?260:225;bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed});if(b.phase>=2){const spread=b.phase===3?.22:.14;[-spread,spread].forEach(offset=>bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(a+offset)*speed,vy:Math.sin(a+offset)*speed}))}if(b.phase===3){for(let i=0;i<4;i++){const aa=(Math.PI/2)*i+b.moveTimer*.25;bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(aa)*185,vy:Math.sin(aa)*185})}}}
 bossState.shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
 bossState.playerShots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
 bossState.shots=bossState.shots.filter(s=>s.x>-20&&s.x<780&&s.y>-20&&s.y<440);
 bossState.playerShots=bossState.playerShots.filter(s=>s.x<780);
 bossState.shots.forEach(s=>{if(Math.hypot(s.x-bossState.player.x,s.y-bossState.player.y)<bossState.player.r+5&&performance.now()>=bossState.player.invulnerableUntil){s.x=-99;bossState.player.invulnerableUntil=performance.now()+650;if(bossState.player.armour>0){bossState.player.armour--;bossMessage.textContent='ARMOUR BROKE. The hit did not reach Rishi.'}else{bossState.player.hp--;bossMessage.textContent='HIT. HP -1. Read the pattern, then move.'}state.hp=bossState.player.hp;state.armour=bossState.player.armour;updateStats();updateBossHud();if(bossState.player.hp<=0)bossDefeat()}});
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
function updateBossHud(){bossBar.style.width=Math.max(0,bossState.boss.hp/bossState.boss.maxHp*100)+'%';bossHpText.textContent=Math.max(0,bossState.boss.hp)+' / '+bossState.boss.maxHp;bossPlayerHp.textContent='HP '+('♥'.repeat(Math.max(0,bossState.player.hp))+'♡'.repeat(Math.max(0,5-bossState.player.hp)))+' · ARMOUR '+bossState.player.armour}
function bossDefeat(){bossState.active=false;state.hp=bossState.startingHp;state.armour=bossState.startingArmour;state.bossDeaths++;state.bravery++;state.mobility=Math.min(2.5,state.mobility+.15);updateStats();bossMessage.textContent=['DOWN, NOT OUT. You learned the attack timing.','THE BOSS WON THAT ROUND. Now you know what to dodge.','DEFEATED. Good. Knowledge acquired.','ONE MORE ROUND. The opening is there.'][state.bossDeaths%4];setStory("CHAPTER IV","THE SETBACK","The boss wins this round. Rishi is still here.","This is the part the story needed. A setback is not a verdict. Every attempt teaches a little more, and the next attempt starts with everything you learned.");setTimeout(()=>initBoss(),500)}
function winBoss(){bossState.active=false;bossMessage.textContent='BOSS DEFEATED. QUEST COMPLETE.';setStory("CHAPTER V","THE NEXT CHAPTER","The fight is over. Rishi's story is not.","The maze, the memories and the boss were only a metaphor for one thing: the road ahead will contain hard chapters too. Keep moving through them.");ending.hidden=false;secretReveal.hidden=state.collected.size>0&&secretRoutes.some(route=>route.sequence.every((value,i)=>state.claimOrder[i]===value));runSummary.textContent='MEMORIES 7/7 · FINAL HP '+state.hp+' · FINAL ARMOUR '+state.armour+' · BRAVERY '+state.bravery+' · MOBILITY '+state.mobility.toFixed(1)+'× · MAZE DEATHS '+state.deaths+' · BOSS ATTEMPTS '+(state.bossDeaths+1);ending.scrollIntoView({behavior:'smooth',block:'center'});}
function bossFrame(t){const dt=Math.min(.035,(t-bossState.last)/1000||0);bossState.last=t;if(state.started&&!state.paused&&bossState.active)updateBoss(dt);requestAnimationFrame(bossFrame)}
requestAnimationFrame(bossFrame);

document.addEventListener('visibilitychange',()=>{if(document.hidden){state.keys.clear();state.paused=true}else if(modal.getAttribute('aria-hidden')==='true'&&!state.resumeUntil){state.paused=false}});

updateStats();
