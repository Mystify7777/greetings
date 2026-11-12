const canvas=document.querySelector('#mazeCanvas'),ctx=canvas.getContext('2d');
const bossCanvas=document.querySelector('#bossCanvas'),bctx=bossCanvas.getContext('2d');
const startButton=document.querySelector('#startAdventure'),gameShell=document.querySelector('#gameShell'),gameStage=document.querySelector('#gameStage');
const missionState=document.querySelector('#missionState'),missionText=document.querySelector('#missionText'),stageHint=document.querySelector('#stageHint');
const storyBeat=document.querySelector('#storyBeat'),storyBeatMarker=document.querySelector('#storyBeatMarker'),storyBeatKicker=document.querySelector('#storyBeatKicker'),storyBeatTitle=document.querySelector('#storyBeatTitle'),storyBeatText=document.querySelector('#storyBeatText');
const hpStat=document.querySelector('#hpStat'),armourStat=document.querySelector('#armourStat'),braveryStat=document.querySelector('#braveryStat'),mobilityStat=document.querySelector('#mobilityStat'),memoryStat=document.querySelector('#memoryStat'),gameLog=document.querySelector('#gameLog');
const modal=document.querySelector('#rewardModal'),modalClose=document.querySelector('#modalClose'),rewardKicker=document.querySelector('#rewardKicker'),rewardTitle=document.querySelector('#rewardTitle'),rewardBody=document.querySelector('#rewardBody');
const relicPrompt=document.querySelector('#relicPrompt'),relicPromptType=document.querySelector('#relicPromptType'),relicPromptTitle=document.querySelector('#relicPromptTitle'),claimMemory=document.querySelector('#claimMemory');
const chapter4Intro=document.querySelector('#chapter4Intro'),bossShell=document.querySelector('#bossShell'),bossStage=document.querySelector('#bossStage'),bossBar=document.querySelector('#bossBar'),bossHpText=document.querySelector('#bossHpText'),bossMessage=document.querySelector('#bossMessage'),bossPlayerHp=document.querySelector('#bossPlayerHp');
const ending=document.querySelector('#ending'),runSummary=document.querySelector('#runSummary'),secretReveal=document.querySelector('#secretReveal'),bossRechallenge=document.querySelector('#bossRechallenge'),rechallengeBoss=document.querySelector('#rechallengeBoss'),roadGame=document.querySelector('#roadGame'),roadCanvas=document.querySelector('#roadCanvas'),roadCtx=roadCanvas?.getContext('2d'),roadOverlay=document.querySelector('#roadOverlay'),roadOverlayKicker=document.querySelector('#roadOverlayKicker'),roadOverlayTitle=document.querySelector('#roadOverlayTitle'),roadOverlayText=document.querySelector('#roadOverlayText'),roadStartButton=document.querySelector('#roadStart'),roadCheckpoint=document.querySelector('#roadCheckpoint'),roadDistance=document.querySelector('#roadDistance'),roadScore=document.querySelector('#roadScore'),roadBest=document.querySelector('#roadBest'),roadLog=document.querySelector('#roadLog');


const chapterSoundToggles=[...document.querySelectorAll('[data-sound-toggle]')];
const fullscreenButtons=[...document.querySelectorAll('[data-fullscreen-target]')];
const audioState={
 enabled:(()=>{try{return localStorage.getItem('rishi-sound-enabled')!=='0'}catch{return true}})(),
 stepTimer:0,
 lastRelic:null,
 lastPhase:1
};
const AUDIO_CUES={
 click:[[1200,.045,.16,'square',900]],
 confirm:[[700,.08,.18,'triangle',980],[1050,.12,.16,'triangle',1400]],
 step:[[150,.07,.09,'triangle',110]],
 relicNear:[[820,.08,.14,'triangle',1080],[1180,.08,.1,'triangle',1320]],
 relicCollect:[[660,.1,.18,'triangle',900],[990,.1,.18,'triangle',1320],[1320,.14,.16,'triangle',1760]],
 gate:[[220,.12,.16,'sine',360],[360,.12,.16,'sine',540],[540,.16,.15,'sine',760]],
 collision:[[95,.12,.2,'noise',70]],
 armour:[[240,.08,.18,'square',120],[120,.12,.15,'triangle',80]],
 hit:[[110,.08,.22,'noise',65],[70,.1,.16,'sine',45]],
 attack:[[320,.06,.16,'square',620]],
 bossHit:[[520,.07,.18,'square',280]],
 bossStart:[[180,.12,.12,'sine',240],[260,.12,.14,'sine',360],[380,.18,.16,'sine',520]],
 phase:[[220,.09,.14,'saw',330],[330,.09,.14,'saw',495],[495,.18,.16,'saw',740]],
 buffSpawn:[[620,.08,.14,'triangle',900],[900,.14,.14,'triangle',1320]],
 buffCollect:[[880,.08,.16,'triangle',1120],[1120,.08,.16,'triangle',1460],[1460,.16,.15,'triangle',1760]],
 buffExpire:[[520,.08,.12,'triangle',300]],
 gameOver:[[440,.16,.16,'sine',300],[300,.16,.15,'sine',190],[190,.24,.14,'sine',100]],
 victory:[[660,.1,.15,'triangle',880],[880,.1,.16,'triangle',1100],[1100,.1,.17,'triangle',1320],[1320,.24,.18,'triangle',1760]],
 roadStart:[[220,.1,.14,'sine',300],[300,.1,.15,'sine',440],[440,.2,.17,'sine',660]],
 lane:[[300,.045,.1,'square',520]],
 crash:[[70,.16,.2,'noise',45],[120,.2,.15,'sine',70]],
 opportunity:[[760,.08,.15,'triangle',1040],[1040,.13,.16,'triangle',1460]],
 checkpoint:[[660,.1,.15,'triangle',880],[880,.1,.16,'triangle',1100],[1100,.2,.18,'triangle',1460]],
 setback:[[320,.12,.14,'sine',220],[220,.18,.13,'sine',140]]
};
function audioTone(freq,duration,volume,wave,slide,sampleRate){
 const n=Math.max(1,Math.floor(duration*sampleRate)),out=new Float32Array(n);
 for(let i=0;i<n;i++){
  const t=i/(n-1||1),f=freq+(slide-freq)*t,phase=2*Math.PI*f*(i/sampleRate);
  let v=wave==='square'?(Math.sin(phase)>=0?1:-1):wave==='saw'?2*(phase/(2*Math.PI)-Math.floor(.5+phase/(2*Math.PI))):wave==='triangle'?2*Math.abs(2*(phase/(2*Math.PI)-Math.floor(.5+phase/(2*Math.PI))))-1:Math.sin(phase);
  const env=Math.min(1,t/.015)*Math.min(1,(1-t)/.035);
  out[i]=v*volume*env;
 }
 return out;
}
function audioNoise(duration,volume,slide,sampleRate){
 const n=Math.max(1,Math.floor(duration*sampleRate)),out=new Float32Array(n),seed=0x9e3779b9;
 let x=seed;
 for(let i=0;i<n;i++){x=(1664525*x+1013904223)>>>0;const t=i/(n-1||1);out[i]=((x/4294967296)*2-1)*volume*Math.min(1,t/.008)*Math.min(1,(1-t)/.04)}
 return out;
}
function audioConcat(parts,gap,sampleRate){
 const gapSamples=Math.floor(gap*sampleRate),total=parts.reduce((n,p)=>n+p.length,0)+Math.max(0,parts.length-1)*gapSamples,out=new Float32Array(total);
 let at=0;
 parts.forEach((p,i)=>{out.set(p,at);at+=p.length;if(i<parts.length-1)at+=gapSamples});
 return out;
}
function audioWavDataUri(samples,sampleRate){
 const bytes=new Uint8Array(44+samples.length*2),view=new DataView(bytes.buffer);
 const write=(o,str)=>{for(let i=0;i<str.length;i++)view.setUint8(o+i,str.charCodeAt(i))};
 write(0,'RIFF');view.setUint32(4,36+samples.length*2,true);write(8,'WAVE');write(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);
 view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,samples.length*2,true);
 for(let i=0;i<samples.length;i++){const v=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,v<0?v*32768:v*32767,true)}
 let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));
 return 'data:audio/wav;base64,'+btoa(binary);
}
function buildAudioSprite(){
 const rate=16000,sprite={},parts=[],gap=.045;let offset=0;
 Object.entries(AUDIO_CUES).forEach(([name,segments])=>{
  const rendered=segments.map(([f,d,v,w,slide])=>w==='noise'?audioNoise(d,v,slide,rate):audioTone(f,d,v,w,slide,rate));
  const samples=audioConcat(rendered,0,rate);
  parts.push(samples);
  sprite[name]=[Math.round(offset*1000),Math.round(samples.length/rate*1000)];
  offset+=samples.length/rate+gap;
 });
 return {src:audioWavDataUri(audioConcat(parts,gap,rate),rate),sprite};
}
const audioPack=buildAudioSprite();
const gameAudio=window.Howl?new Howl({src:[audioPack.src],format:['wav'],sprite:audioPack.sprite,volume:.42,preload:true}):null;
function playCue(name,volume=1,rate=1){
 if(!audioState.enabled||!gameAudio)return;
 try{const id=gameAudio.play(name);gameAudio.volume(.42*volume,id);if(rate!==1)gameAudio.rate(rate,id)}catch{}
}
function setSoundEnabled(enabled){
 audioState.enabled=enabled;
 try{localStorage.setItem('rishi-sound-enabled',enabled?'1':'0')}catch{}
 if(gameAudio&&!enabled)gameAudio.stop();
 chapterSoundToggles.forEach(toggle=>{
  toggle.textContent=enabled?'SOUND ON':'SOUND OFF';
  toggle.setAttribute('aria-pressed',String(enabled));
 });
}
chapterSoundToggles.forEach(toggle=>toggle.addEventListener('click',()=>setSoundEnabled(!audioState.enabled)));
setSoundEnabled(audioState.enabled);

function getFullscreenElement(){
 return document.fullscreenElement||document.webkitFullscreenElement||null;
}
function toggleFullscreen(target){
 const element=document.querySelector('#'+target);
 if(!element)return;
 if(getFullscreenElement()===element){
  const exit=document.exitFullscreen||document.webkitExitFullscreen;
  if(exit)Promise.resolve(exit.call(document)).catch(()=>{});
  return;
 }
 const request=element.requestFullscreen||element.webkitRequestFullscreen;
 if(request)Promise.resolve(request.call(element)).catch(()=>{});
}
function syncFullscreenControls(){
 const active=getFullscreenElement();
 fullscreenButtons.forEach(button=>{
  const isActive=active&&active.id===button.dataset.fullscreenTarget;
  button.textContent=isActive?'EXIT FULLSCREEN':'FULLSCREEN';
  button.setAttribute('aria-pressed',String(Boolean(isActive)));
 });
}
fullscreenButtons.forEach(button=>button.addEventListener('click',()=>toggleFullscreen(button.dataset.fullscreenTarget)));
document.addEventListener('fullscreenchange',syncFullscreenControls);
document.addEventListener('webkitfullscreenchange',syncFullscreenControls);
syncFullscreenControls();

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
 {x:13,y:3,title:'Player Memory',type:'GAME',icon:'◆',text:'A memory from the years of games, volleyball, anime, games, chaos and questionable victory celebrations.',reward:'Recovered memory: +1 armour.'},
 {x:16,y:3,title:'The Ordinary Day',type:'MEMORY',icon:'◇',text:'The ordinary moments are usually the ones that become the good stories. College days, games, random conversations, and the people who somehow became part of the routine.',reward:'Recovered memory: +1 bravery and +1 HP (up to 5).'},
 {x:10,y:13,title:'Birthday Letter',type:'LETTER',icon:'✎',text:'The proper birthday message goes here. For now, the chest stays sealed around a placeholder. The real birthday message belongs here when the archive gets its final memories. Pushpa probably has evidence that should not be archived without supervision.',reward:'Recovered memory: +1 armour, +1 bravery and +1 HP (up to 5).'},
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
 {kind:'TRICK',sequence:[1,2,3,4,5,6,7],title:'THE EMBARRASSING ARCHIVE',text:'You found the wrong kind of treasure. Somewhere in Rishi\'s personal history is a video that absolutely should not have survived. If Pushpa is involved, there may be more than one. The real clip goes here.',media:'VIDEO SLOT // EMBARRASSING & FUNNY'},
 {kind:'TREAT',sequence:[1,4,7,2,6,3,5],title:'THE CHERISHED MEMORY',text:'You found the hidden route. This is the kind of memory that makes the whole maze worth walking: a real moment, kept because it mattered. Some memories are not flashy. They are just yours. The kind you remember because the people in them mattered.',media:'MEMORY SLOT // CHERISHED & PERSONAL'}
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


const narrativeRails={
 maze:document.querySelector('[data-narrative-rail="maze"]'),
 boss:document.querySelector('[data-narrative-rail="boss"]'),
 road:document.querySelector('[data-narrative-rail="road"]')
};
const narrativeSeen=new Set();
let narrativeLastShownAt=0;
const NARRATIVE_EVENTS={
 'maze.start':['THE MAZE','Now you have to live this chapter.','The route is unfamiliar on purpose. Keep moving until the memories start making sense.'],
 'maze.memory.1':['FIRST MEMORY','The past is closer than it looks.','One ordinary piece of Rishi’s life is enough to start the archive moving.'],
 'maze.memory.2':['TWO MEMORIES','Small moments become important later.','Not every day feels like part of a story while you are living it.'],
 'maze.memory.3':['HALFWAY','The maze is getting harder.','So is growing up. The answer is not avoiding every obstacle, but learning its pattern.'],
 'maze.memory.4':['TURNING POINT','Carry the lesson, not the weight.','At some point, growing up becomes less about changing who you are and more about knowing what to keep.'],
 'maze.memory.5':['THE HARD PART','Some chapters are difficult by definition.','Setbacks, mistakes and missed chances still become part of the person who keeps moving.'],
 'maze.memory.6':['ONE LEFT','The easy part is over.','Fear can come along for the ride. It does not get to choose the destination.'],
 'maze.memory.7':['MEMORIES SAFE','Now the story asks a harder question.','Remembering is not enough. The next chapter is about what Rishi does when the obstacle fights back.'],
 'maze.death.first':['SETBACK','Rishi falls. The story does not.','The first failed attempt gives you information the successful one could not.'],
 'maze.death.repeat':['TRY AGAIN','Progress is not always forward.','A harder route is still a route. Change the approach and keep moving.'],
 'boss.start':['THE FIGHT','Getting stronger does not make the obstacle smaller.','It changes what you are capable of doing when the obstacle arrives.'],
 'boss.phase.2':['THE PATTERN CHANGES','The fight is asking for more.','When the pattern changes, panic is optional. Adaptation is the skill.'],
 'boss.phase.3':['FINAL PHASE','The hardest part is usually the last part.','Keep moving. The finish is closer than the screen makes it feel.'],
 'boss.opportunity':['AN OPPORTUNITY','Good moments do not always wait.','The opening is temporary. Notice it, move toward it, take it.'],
 'boss.buff.collect':['OPPORTUNITY TAKEN','A little help at the right moment matters.','The hard chapter did not become easy. Rishi just found another reason to keep going.'],
 'boss.setback':['THE BOSS WINS THIS ROUND','A setback is not a verdict.','Every attempt leaves something behind: timing, knowledge, patience. Carry that into the next one.'],
 'boss.victory':['CHAPTER CLEARED','You did not beat the obstacle by avoiding it.','You learned its rhythm, took the hits, found the openings and kept going. That is the story.'],
 'road.start':['THE LONG ROAD','The road gets longer from here.','Success does not remove the next challenge. It gives you a farther place to reach.'],
 'road.crash.first':['FIRST CRASH','Not every bad turn means you took the wrong road.','The important part is what changes before you try the stretch again.'],
 'road.crash.repeat':['ANOTHER CRASH','Some lessons need to be learned twice.','The checkpoint is still there. So is the chance to approach it differently.'],
 'road.checkpoint':['CHECKPOINT','You made it farther than before.','A checkpoint is proof that yesterday’s distance is no longer the limit.'],
 'road.fallback':['FALLING BACK','Progress is not always forward.','Sometimes the road sends you back so you can rebuild the part you rushed through.'],
 'road.opportunity':['OPPORTUNITY TAKEN','Good things rarely announce themselves twice.','You noticed the opening. That matters as much as the points.'],
 'road.restart':['A NEW RUN','A new beginning is still progress.','The score reset. The experience did not.'],
 'road.best':['NEW PERSONAL BEST','You just went farther than you ever have.','Keep the number. Then keep going.']
};
function emitNarrative(id,force=false){
 const railKey=id.split('.')[0],rail=narrativeRails[railKey],event=NARRATIVE_EVENTS[id];
 if(!rail||!event||(!force&&narrativeSeen.has(id)))return;
 const now=performance.now();
 if(!force&&now-narrativeLastShownAt<1600)return;
 narrativeSeen.add(id);narrativeLastShownAt=now;
 const [kicker,title,text]=event;
 rail.querySelector('span').textContent=kicker;
 rail.querySelector('strong').textContent=title;
 rail.querySelector('p').textContent=text;
 rail.classList.remove('narrative-pulse');void rail.offsetWidth;rail.classList.add('narrative-pulse');
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
 playCue('collision',.8);
 state.invulnerableUntil=performance.now()+750;
 if(state.armour>0){
   state.armour--;playCue('armour');state.player.x=1.5*TILE;state.player.y=1.5*TILE;updateStats();
   setLog('ARMOUR ABSORBED THE HIT. '+reason+' The shield held.');
   return;
 }
 state.hp--;playCue('hit');
 if(state.hp>0){
   state.player.x=1.5*TILE;state.player.y=1.5*TILE;updateStats();
   setLog(reason+' HP -1. You have '+state.hp+' heart'+(state.hp===1?'':'s')+' left.');
   missionText.textContent=state.hp<=2?'Low health. The next memory matters.':'The maze hit hard. Keep moving.';
   return;
 }
 state.deaths++;state.bravery++;state.mobility=Math.min(2.5,state.mobility+.1);playCue('gameOver');
 state.hp=5;state.armour=0;state.player.x=1.5*TILE;state.player.y=1.5*TILE;
 updateStats();setLog(reason+' You ran out of HP. The next attempt starts with a full recovery.');
 missionText.textContent=state.deaths%2?'The maze won that round. It does not keep the win.':'Caught. Good. Now you know where the danger is.';
 setStory("CHAPTER III","THE SETBACK","Rishi falls. The story does not.","Every failed run changes the next one. A little more bravery. A little more speed. A little more knowledge. The point was never to avoid falling.");
 emitNarrative(state.deaths===1?'maze.death.first':'maze.death.repeat');
}
function collectRelic(index){
 if(state.collected.has(index))return;
 playCue('relicCollect');
 state.collected.add(index);state.memory++;state.bravery++;state.claimOrder.push(index+1);
 if(gates.some(g=>g.need===state.memory))playCue('gate');
 state.pendingRelic=null;relicPrompt.hidden=true;
 emitNarrative('maze.memory.'+state.memory);
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

const mobilePointers=new Map();
document.querySelectorAll('[data-dir]').forEach(btn=>{
 const dir=btn.dataset.dir;
 const map={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'};
 const press=e=>{
  e.preventDefault();
  btn.setPointerCapture?.(e.pointerId);
  mobilePointers.set(e.pointerId,map[dir]);
  state.keys.add(map[dir]);
  btn.classList.add('pressed');
 };
 const release=e=>{
  e.preventDefault();
  const key=mobilePointers.get(e.pointerId);
  if(key)state.keys.delete(key);
  mobilePointers.delete(e.pointerId);
  btn.classList.remove('pressed');
 };
 btn.addEventListener('pointerdown',press);
 btn.addEventListener('pointerup',release);
 btn.addEventListener('pointercancel',release);
 btn.addEventListener('lostpointercapture',release);
});
document.querySelectorAll('[data-action="attack"]').forEach(btn=>{
 btn.addEventListener('pointerdown',e=>{
  e.preventDefault();
  btn.setPointerCapture?.(e.pointerId);
  bossState.attackQueued=true;
  btn.classList.add('pressed');
 });
 const release=e=>{e.preventDefault();btn.classList.remove('pressed')};
 btn.addEventListener('pointerup',release);
 btn.addEventListener('pointercancel',release);
 btn.addEventListener('lostpointercapture',release);
});
const preventGameContextMenu=e=>e.preventDefault();
[gameStage,bossStage,...document.querySelectorAll('.mobile-controls')].forEach(el=>{
 el.addEventListener('contextmenu',preventGameContextMenu);
 el.addEventListener('dragstart',preventGameContextMenu);
 el.addEventListener('selectstart',preventGameContextMenu);
});

startButton.addEventListener('click',()=>{
 playCue('confirm');
 gameShell.hidden=false;state.started=true;missionState.textContent='ACTIVE';stageHint.textContent='FOCUS ACTIVE · WASD / ARROWS TO MOVE';
 gameShell.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});
 setTimeout(()=>gameStage.focus(),matchMedia('(prefers-reduced-motion:reduce)').matches?0:180);
 setLog('CHAPTER III BEGINS. The next part cannot be read from a screen.');
 setStory('CHAPTER III','THE MAZE','Now you have to live the difficult chapter.','The next part cannot be read from a screen. Rishi has to walk it. Learn the guardians. Find the memories. Get lost. Try again.');
 emitNarrative('maze.start',true);
});

function updatePlayer(dt){
 let dx=0,dy=0;
 if(state.keys.has('arrowleft')||state.keys.has('a'))dx--;
 if(state.keys.has('arrowright')||state.keys.has('d'))dx++;
 if(state.keys.has('arrowup')||state.keys.has('w'))dy--;
 if(state.keys.has('arrowdown')||state.keys.has('s'))dy++;
 if(dx||dy){const len=Math.hypot(dx,dy);const speed=115*state.mobility;moveEntity(state.player,dx/len*speed*dt,dy/len*speed*dt);audioState.stepTimer-=dt;if(audioState.stepTimer<=0){playCue('step',.65,1+Math.random()*.08);audioState.stepTimer=.17/state.mobility}}else audioState.stepTimer=0;
 let nearbyRelic=null;
 relics.forEach((r,i)=>{
  if(!state.collected.has(i)&&Math.hypot(state.player.x-(r.x+.5)*TILE,state.player.y-(r.y+.5)*TILE)<30)nearbyRelic=i;
 });
 if(nearbyRelic!==null){
  if(audioState.lastRelic!==nearbyRelic){playCue('relicNear');audioState.lastRelic=nearbyRelic}
  state.pendingRelic=nearbyRelic;
  const r=relics[nearbyRelic];
  relicPromptType.textContent='MEMORY '+String(nearbyRelic+1).padStart(2,'0')+' // '+r.type;
  relicPromptTitle.textContent=r.title;
  relicPrompt.hidden=false;
 }else{
  state.pendingRelic=null;
  audioState.lastRelic=null;
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

const bossState={active:false,startingHp:5,startingArmour:0,rechallengeCount:0,player:{x:100,y:210,r:11,hp:5,armour:0,invulnerableUntil:0},boss:{x:620,y:210,r:25,hp:50,maxHp:50,phase:1,shotTimer:0,moveTimer:0,dir:1,vx:0,vy:0},shots:[],playerShots:[],attackQueued:false,last:0,buffs:[]};
function initBoss(playIntroCue=true){if(playIntroCue){playCue('bossStart',.9);emitNarrative('boss.start',true)}bossState.active=true;bossState.startingHp=Math.max(1,state.hp);bossState.startingArmour=state.armour;const level=bossState.rechallengeCount;const maxHp=50+level*25;bossState.player={x:100,y:210,r:11,hp:bossState.startingHp,armour:bossState.startingArmour,invulnerableUntil:0};bossState.boss={x:620,y:210,r:25,hp:maxHp,maxHp,phase:1,shotTimer:0,moveTimer:0,dir:1,vx:0,vy:0};bossState.shots=[];bossState.playerShots=[];bossState.buffs=[];bossState.last=performance.now();bossMessage.textContent=level===0?"The boss is waiting. Find the rhythm. Your maze health and armour carried forward.":"REMATCH "+level+". Rishi starts fresh. The boss does not.";updateBossHud();}
function bossMove(dt){
 let dx=0,dy=0;if(state.keys.has('arrowleft')||state.keys.has('a'))dx--;if(state.keys.has('arrowright')||state.keys.has('d'))dx++;if(state.keys.has('arrowup')||state.keys.has('w'))dy--;if(state.keys.has('arrowdown')||state.keys.has('s'))dy++;
 if(dx||dy){const l=Math.hypot(dx,dy);bossState.player.x=Math.max(15,Math.min(745,bossState.player.x+dx/l*170*state.mobility*dt));bossState.player.y=Math.max(15,Math.min(405,bossState.player.y+dy/l*170*state.mobility*dt))}
 if(bossState.attackQueued){bossState.attackQueued=false;if(bossState.playerShots.length<4){playCue('attack',.75);const a=Math.atan2(bossState.boss.y-bossState.player.y,bossState.boss.x-bossState.player.x);bossState.playerShots.push({x:bossState.player.x+15*Math.cos(a),y:bossState.player.y+15*Math.sin(a),vx:Math.cos(a)*420,vy:Math.sin(a)*420})}}
}
function updateBoss(dt){
 if(!bossState.active)return;
 bossMove(dt);const b=bossState.boss;
 const phaseTwo=Math.round(b.maxHp*.64),phaseThree=Math.round(b.maxHp*.32);const previousPhase=b.phase;b.phase=b.hp<=phaseThree?3:b.hp<=phaseTwo?2:1;if(b.phase!==previousPhase){playCue('phase',.85);if(b.phase===2)emitNarrative('boss.phase.2');if(b.phase===3)emitNarrative('boss.phase.3');}b.moveTimer+=dt;b.shotTimer+=dt;
 const buff=1+bossState.rechallengeCount*.12;const dx=bossState.player.x-b.x,dy=bossState.player.y-b.y,d=Math.hypot(dx,dy)||1,aggression=(b.phase===3?1:b.phase===2?.72:.42)*buff,desiredSpeed=(b.phase===3?92:b.phase===2?68:48)*buff,orbit=Math.sin(b.moveTimer*2.2)*(b.phase===3?55:35),tx=bossState.player.x+(-dy/d)*orbit,ty=bossState.player.y+(dx/d)*orbit;
 b.vx+=(tx-b.x)/Math.max(1,d)*desiredSpeed*aggression*dt*3;b.vy+=(ty-b.y)/Math.max(1,d)*desiredSpeed*aggression*dt*3;const v=Math.hypot(b.vx,b.vy)||1;if(v>desiredSpeed){b.vx=b.vx/v*desiredSpeed;b.vy=b.vy/v*desiredSpeed}b.x=Math.max(35,Math.min(725,b.x+b.vx*dt));b.y=Math.max(35,Math.min(385,b.y+b.vy*dt));
 if(b.shotTimer>(b.phase===3?.38:b.phase===2?.55:.78)){b.shotTimer=0;const a=Math.atan2(bossState.player.y-b.y,bossState.player.x-b.x),speed=(b.phase===3?305:b.phase===2?260:225)*buff;bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed});if(b.phase>=2){const spread=b.phase===3?.22:.14;[-spread,spread].forEach(offset=>bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(a+offset)*speed,vy:Math.sin(a+offset)*speed}))}if(b.phase===3){for(let i=0;i<4;i++){const aa=(Math.PI/2)*i+b.moveTimer*.25;bossState.shots.push({x:b.x,y:b.y,vx:Math.cos(aa)*185,vy:Math.sin(aa)*185})}}}
 bossState.shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
 bossState.playerShots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt});
 bossState.shots=bossState.shots.filter(s=>s.x>-20&&s.x<780&&s.y>-20&&s.y<440);
 bossState.playerShots=bossState.playerShots.filter(s=>s.x<780);
 const now=performance.now();
 bossState.buffs=bossState.buffs.filter(buff=>buff.expiresAt>now&&buff.active!==false);
 bossState.buffs.forEach(buff=>{
  buff.pulse+=dt;
  if(Math.hypot(buff.x-bossState.player.x,buff.y-bossState.player.y)<bossState.player.r+buff.r){
   buff.active=false;playCue('buffCollect');emitNarrative('boss.buff.collect');
   if(buff.type==="hp"){bossState.player.hp=Math.min(5,bossState.player.hp+1);bossMessage.textContent="A GOOD MOMENT. HP +1. Kabhi-kabhi game bhi favour karta hai."}
   if(buff.type==="armour"){bossState.player.armour++;bossMessage.textContent="A LITTLE EXTRA COVER. ARMOUR +1. Protection mil gayi, ab overconfidence mat karna."}
   if(buff.type==="mobility"){state.mobility=Math.min(2.5,state.mobility+.2);bossMessage.textContent="A BETTER STEP. MOBILITY +0.2×. Thoda faster, thoda smarter."}
   state.hp=bossState.player.hp;state.armour=bossState.player.armour;updateStats();updateBossHud();
  }
 });
 bossState.shots.forEach(s=>{if(Math.hypot(s.x-bossState.player.x,s.y-bossState.player.y)<bossState.player.r+5&&performance.now()>=bossState.player.invulnerableUntil){s.x=-99;bossState.player.invulnerableUntil=performance.now()+650;if(bossState.player.armour>0){bossState.player.armour--;bossMessage.textContent='ARMOUR BROKE. The hit did not reach Rishi.'}else{bossState.player.hp--;bossMessage.textContent='HIT. HP -1. Read the pattern, then move.'}state.hp=bossState.player.hp;state.armour=bossState.player.armour;updateStats();updateBossHud();if(bossState.player.hp<=0)bossDefeat()}});
 bossState.playerShots.forEach(s=>{if(Math.hypot(s.x-b.x,s.y-b.y)<b.r+5){s.x=9999;b.hp--;playCue('bossHit',.85);bossMessage.textContent=b.phase===1?'Good hit. Pattern samajh aa raha hai.':b.phase===2?'Boss phase change. Keep moving.':'Final phase. Ab rukna mana hai.';
 if(b.hp>0&&Math.random()<0.2){
  const available=[];
  if(bossState.player.hp<5)available.push("hp");
  available.push("armour");
  if(state.mobility<2.5)available.push("mobility");
  const type=available[Math.floor(Math.random()*available.length)];
  bossState.buffs.push({x:b.x,y:b.y,r:13,type,pulse:Math.random()*Math.PI*2,expiresAt:performance.now()+4200,active:true});playCue('buffSpawn',.8);
  bossMessage.textContent="AN OPPORTUNITY APPEARED. Chance saamne hai. Miss mat karna.";emitNarrative('boss.opportunity');
 }
 updateBossHud();if(b.hp<=0)winBoss()}});
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
 bossState.buffs.forEach(buff=>{
  const pulse=1+Math.sin(buff.pulse*5)*.12;
  bctx.save();bctx.globalAlpha=Math.max(0,Math.min(1,(buff.expiresAt-performance.now())/700));
  bctx.strokeStyle=buff.type==="hp"?"#70e6d6":buff.type==="armour"?"#ffd866":"#b18cff";
  bctx.lineWidth=3;bctx.beginPath();bctx.arc(buff.x,buff.y,buff.r*pulse,0,Math.PI*2);bctx.stroke();
  bctx.fillStyle=buff.type==="hp"?"#70e6d6":buff.type==="armour"?"#ffd866":"#b18cff";
  bctx.beginPath();bctx.arc(buff.x,buff.y,6,0,Math.PI*2);bctx.fill();
  bctx.fillStyle="#061018";bctx.font="bold 9px monospace";bctx.textAlign="center";
  bctx.fillText(buff.type==="hp"?"+HP":buff.type==="armour"?"+A":"+M",buff.x,buff.y+3);
  bctx.restore();
 });
 bctx.fillStyle='#ff647c';bossState.shots.forEach(s=>{bctx.beginPath();bctx.arc(s.x,s.y,5,0,Math.PI*2);bctx.fill()});
 bctx.fillStyle='#ffd866';bossState.playerShots.forEach(s=>{bctx.beginPath();bctx.arc(s.x,s.y,4,0,Math.PI*2);bctx.fill()});
 bctx.fillStyle='#71809e';bctx.font='10px monospace';bctx.textAlign='left';bctx.fillText('PHASE '+b.phase,14,20);
}
function updateBossHud(){bossBar.style.width=Math.max(0,bossState.boss.hp/bossState.boss.maxHp*100)+'%';bossHpText.textContent=Math.max(0,bossState.boss.hp)+' / '+bossState.boss.maxHp;bossPlayerHp.textContent='HP '+('♥'.repeat(Math.max(0,bossState.player.hp))+'♡'.repeat(Math.max(0,5-bossState.player.hp)))+' · ARMOUR '+bossState.player.armour}
function bossDefeat(){bossState.active=false;playCue('setback',.8);state.hp=bossState.startingHp;state.armour=bossState.startingArmour;state.bossDeaths++;state.bravery++;state.mobility=Math.min(2.5,state.mobility+.15);updateStats();bossMessage.textContent=['DOWN, NOT OUT. You learned the attack timing.','THE BOSS WON THAT ROUND. Now you know what to dodge.','DEFEATED. Good. Knowledge acquired.','ONE MORE ROUND. The opening is there.'][state.bossDeaths%4];setStory("CHAPTER IV","THE SETBACK","The boss wins this round. Rishi is still here. Round lost. Story over nahi hui.","This is the part the story needed. A setback is not a verdict. Har attempt kuch sikhata hai, aur next run zero se nahi, experience se start hota hai.");
 emitNarrative('boss.setback');setTimeout(()=>initBoss(false),500)}
function winBoss(){bossState.active=false;playCue('victory');bossMessage.textContent="BOSS DEFEATED. QUEST COMPLETE. Next chapter unlocked.";setStory("CHAPTER V","THE NEXT CHAPTER","The fight is over. Rishi's story is not.","The maze, the memories and the boss were only a metaphor for one thing: the road ahead will contain hard chapters too. Life ka difficulty setting kabhi permanently easy nahi hota. Keep moving through it anyway.");
 emitNarrative('boss.victory',true);ending.hidden=false;bossRechallenge.hidden=false;secretReveal.hidden=state.collected.size>0&&secretRoutes.some(route=>route.sequence.every((value,i)=>state.claimOrder[i]===value));runSummary.textContent="MEMORIES 7/7 · FINAL HP "+state.hp+" · FINAL ARMOUR "+state.armour+" · BRAVERY "+state.bravery+" · MOBILITY "+state.mobility.toFixed(1)+"× · MAZE DEATHS "+state.deaths+" · BOSS ATTEMPTS "+(state.bossDeaths+1)+" · REMATCHES "+bossState.rechallengeCount;
 document.querySelector('#historyMemories').textContent=state.memory+' / 7';
 document.querySelector('#historyBravery').textContent=String(state.bravery);
 document.querySelector('#historyMobility').textContent=state.mobility.toFixed(1)+'×';
 document.querySelector('#historyDeaths').textContent=String(state.deaths);
 const historyLine=state.deaths===0
   ? 'You made it through without falling once. Clean run. Suspiciously competent.'
   : state.deaths===1
     ? 'You fell once, learned the route, and kept going. That is enough evidence.'
     : 'You fell '+state.deaths+' times. The archive kept the attempts because the point was never perfection.';
 document.querySelector('#historyLine').textContent=historyLine;unlockRoadGame();ending.scrollIntoView({behavior:"smooth",block:"center"});}
function bossFrame(t){const dt=Math.min(.035,(t-bossState.last)/1000||0);bossState.last=t;if(state.started&&!state.paused&&bossState.active)updateBoss(dt);requestAnimationFrame(bossFrame)}
requestAnimationFrame(bossFrame);

document.addEventListener('visibilitychange',()=>{if(document.hidden){state.keys.clear();state.paused=true}else if(modal.getAttribute('aria-hidden')==='true'&&!state.resumeUntil){state.paused=false}});

updateStats();

const ROAD_SAVE_KEY = "rishi-road-progress-v1";
const ROAD_UNLOCK_KEY = "rishi-road-unlocked-v1";
const roadCheckpointDistances = [0,100,260,520,940,1620,2720,4500,7380,12040,19620];
const roadLaneX = [205,380,555];
const roadState = {
 active:false,
 distance:0,
 score:0,
 best:0,
 checkpoint:0,
 checkpointScore:0,
 checkpointScores:Array(roadCheckpointDistances.length).fill(0),
 checkpointAttempts:Array(roadCheckpointDistances.length).fill(0),
 lane:1,
 targetLane:1,
 objects:[],
 spawnTimer:0,
 last:0,
 crashCooldown:0,
 seed:1
};

function roadSafeGet(key){
 try{return localStorage.getItem(key)}catch{return null}
}
function roadSafeSet(key,value){
 try{localStorage.setItem(key,value)}catch{}
}
function roadSave(){
 roadSafeSet(ROAD_SAVE_KEY,JSON.stringify({
  distance:roadState.distance,
  score:roadState.score,
  best:roadState.best,
  checkpoint:roadState.checkpoint,
  checkpointScore:roadState.checkpointScore,
  checkpointAttempts:roadState.checkpointAttempts,
  checkpointScores:roadState.checkpointScores
 }));
}
function roadLoad(){
 const raw=roadSafeGet(ROAD_SAVE_KEY);
 if(!raw)return false;
 try{
  const saved=JSON.parse(raw);
  roadState.distance=Number(saved.distance)||0;
  roadState.score=Number(saved.score)||0;
  roadState.best=Number(saved.best)||roadState.score;
  roadState.checkpoint=Math.max(0,Math.min(roadCheckpointDistances.length-1,Number(saved.checkpoint)||0));
  roadState.checkpointScore=Number(saved.checkpointScore)||roadState.score;
  roadState.checkpointScores=Array.isArray(saved.checkpointScores)?saved.checkpointScores.slice(0,roadCheckpointDistances.length):Array(roadCheckpointDistances.length).fill(0);
  while(roadState.checkpointScores.length<roadCheckpointDistances.length)roadState.checkpointScores.push(0);
  roadState.checkpointAttempts=Array.isArray(saved.checkpointAttempts)?saved.checkpointAttempts.slice(0,roadCheckpointDistances.length):Array(roadCheckpointDistances.length).fill(0);
  while(roadState.checkpointAttempts.length<roadCheckpointDistances.length)roadState.checkpointAttempts.push(0);
  return true;
 }catch{return false}
}
function roadUpdateHud(){
 const cp=roadState.checkpoint===0?"START":"CHECKPOINT "+String(roadState.checkpoint).padStart(2,"0");
 roadCheckpoint.textContent=cp;
 roadDistance.textContent=Math.floor(roadState.distance).toLocaleString();
 roadScore.textContent=Math.floor(roadState.score).toLocaleString();
 roadBest.textContent=Math.floor(roadState.best).toLocaleString();
}
function roadSetOverlay(kicker,title,text,buttonText){
 roadOverlayKicker.textContent=kicker;
 roadOverlayTitle.textContent=title;
 roadOverlayText.textContent=text;
 roadStartButton.textContent=buttonText;
 roadOverlay.hidden=false;
}
function roadUnlock(){
 roadSafeSet(ROAD_UNLOCK_KEY,"1");
 if(roadGame)roadGame.hidden=false;
}
function unlockRoadGame(){
 roadUnlock();
 roadSetOverlay("CHAPTER VI // THE LONG ROAD","THE NEXT SUCCESS IS FARTHER.","The road remembers where you stopped. The next checkpoint will demand more distance than the last. Easy mode was never promised.","▶ START THE ROAD");
 roadGame.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});
}
function roadResetSegment(){
 roadState.distance=roadCheckpointDistances[roadState.checkpoint];
 roadState.score=roadState.checkpointScore;
 roadState.lane=1;
 roadState.targetLane=1;
 roadState.objects=[];
 roadState.spawnTimer=.35;
 roadState.crashCooldown=1.2;
}
function roadStart(){
 playCue('roadStart',.9);emitNarrative('road.start',true);
 roadLoad();
 roadState.active=true;
 roadState.last=performance.now();
 roadOverlay.hidden=true;
 roadGame.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});
 roadLog.textContent=roadState.checkpoint===0?"The first checkpoint is close. The next one will not be. First win easy thi. Ab asli road shuru.":"Checkpoint "+roadState.checkpoint+" restored. The road ahead is yours again.";
 roadStage.focus();
}
function roadAdvanceCheckpoint(){
 const next=roadState.checkpoint+1;
 if(next>=roadCheckpointDistances.length)return;
 roadState.checkpoint=next;
 roadState.checkpointScore=Math.floor(roadState.score);
 roadState.checkpointScores[next]=roadState.checkpointScore;
 playCue('checkpoint',.85);
 roadState.checkpointAttempts[next]=0;
 roadState.distance=roadCheckpointDistances[next];
 roadSave();
 roadLog.textContent="CHECKPOINT "+String(next).padStart(2,"0")+" CLEARED AT "+roadState.checkpointScore+" POINTS. The next stretch is longer.";
 const personalNote=document.querySelector('#roadPersonalNote');
 if(personalNote){
   const notes=[
     'First checkpoint. The road is still introducing itself.',
     'You are farther than the version of you who started this run.',
     'The finish line moved. You moved with it.',
     'At this point, the distance is almost beside the point.'
   ];
   personalNote.textContent=notes[Math.min(roadState.checkpoint-1,notes.length-1)];
 }
 emitNarrative('road.checkpoint',true);
}
function roadCrash(){
 if(roadState.crashCooldown>0)return;
 playCue('crash');
 roadState.best=Math.max(roadState.best,Math.floor(roadState.score));
 const current=roadState.checkpoint;
 roadState.checkpointAttempts[current]=(roadState.checkpointAttempts[current]||0)+1;
 const attempts=roadState.checkpointAttempts[current];
 roadState.active=false;
 roadState.objects=[];
 if(attempts>2&&current>0){
  const fallback=current-1;
  for(let i=fallback+1;i<roadState.checkpointAttempts.length;i++){roadState.checkpointAttempts[i]=0;roadState.checkpointScores[i]=0;}
  roadState.checkpoint=fallback;
  roadState.checkpointScore=roadState.checkpointScores[fallback]||0;
  roadState.distance=roadCheckpointDistances[fallback];
  roadState.score=roadState.checkpointScore;
  roadLog.textContent="THREE FAILURES ON THE SAME STRETCH. You fell back to checkpoint "+String(fallback).padStart(2,"0")+". The road ahead has been reset.";
 emitNarrative('road.fallback',true);
 }else{
  roadState.distance=roadCheckpointDistances[current];
  roadState.score=roadState.checkpointScore;
  roadLog.textContent="CRASH. Back to checkpoint "+(current===0?"START":String(current).padStart(2,"0"))+". Change something before the next attempt.";
 emitNarrative(attempts===1?'road.crash.first':'road.crash.repeat');
 }
 roadSave();
 roadUpdateHud();
 playCue('setback',.75);roadSetOverlay("SETBACK","GET BACK ON THE ROAD.","Your checkpoint held. The road does not care how many times you fall, only what you change before the next run. Girna allowed hai. Same mistake ko subscription banana allowed nahi.","▶ KEEP GOING");
}
function roadSpawn(){
 const lane=Math.floor(Math.random()*3);
 const opportunity=Math.random()<.27;
 roadState.objects.push({
  lane,
  x:roadLaneX[lane],
  y:-45,
  type:opportunity?"opportunity":"obstacle",
  speed:roadState.speed*(opportunity?.96:1),
  pulse:Math.random()*Math.PI*2
 });
}
function roadInput(dir){
 if(!roadState.active)return;
 const nextLane=Math.max(0,Math.min(2,roadState.targetLane+dir));if(nextLane!==roadState.targetLane)playCue('lane',.65);roadState.targetLane=nextLane;
}
function roadUpdate(dt){
 if(!roadState.active)return;
 roadState.crashCooldown=Math.max(0,roadState.crashCooldown-dt);
 roadState.speed=260+Math.min(180,roadState.distance/20);
 roadState.distance+=roadState.speed*dt*.32;
 roadState.score+=roadState.speed*dt*.045;
 roadState.lane+=(roadState.targetLane-roadState.lane)*Math.min(1,dt*9);
 roadState.lane=Math.max(0,Math.min(2,roadState.lane));
 const laneX=roadLaneX[roadState.targetLane];
 const currentX=roadLaneX[0]+(roadLaneX[2]-roadLaneX[0])*(roadState.lane/2);
 roadState.spawnTimer-=dt;
 if(roadState.spawnTimer<=0){
  roadSpawn();
  roadState.spawnTimer=Math.max(.34,1.05-roadState.distance/9000);
 }
 roadState.objects.forEach(o=>{o.y+=o.speed*dt;o.pulse+=dt});
 for(const o of roadState.objects){
  const hit=Math.abs(o.x-currentX)<38&&Math.abs(o.y-350)<34;
  if(hit){
   if(o.type==="opportunity"){
    o.y=999;playCue('opportunity',.8);
    roadState.score+=150;
    roadLog.textContent="OPPORTUNITY TAKEN. +150. Keep your eyes open.";
    emitNarrative('road.opportunity');
   }else{
    roadCrash();
    return;
   }
  }
 }
 roadState.objects=roadState.objects.filter(o=>o.y<470);
 while(roadState.checkpoint<roadCheckpointDistances.length-1&&roadState.distance>=roadCheckpointDistances[roadState.checkpoint+1]){
  roadAdvanceCheckpoint();
  roadState.checkpointAttempts[roadState.checkpoint]=0;
 }
 roadState.best=Math.max(roadState.best,Math.floor(roadState.score));
 roadUpdateHud();
 roadDraw();
}
function roadDraw(){
 roadCtx.clearRect(0,0,roadCanvas.width,roadCanvas.height);
 roadCtx.fillStyle="#061018";roadCtx.fillRect(0,0,roadCanvas.width,roadCanvas.height);
 roadCtx.fillStyle="#101a24";roadCtx.fillRect(110,0,540,roadCanvas.height);
 roadCtx.fillStyle="#26313b";roadCtx.fillRect(120,0,520,roadCanvas.height);
 roadCtx.fillStyle="#0b121a";roadCtx.fillRect(140,0,480,roadCanvas.height);
 roadCtx.strokeStyle="#596574";roadCtx.lineWidth=3;roadCtx.setLineDash([26,22]);
 roadCtx.beginPath();roadCtx.moveTo(300,0);roadCtx.lineTo(300,roadCanvas.height);roadCtx.stroke();
 roadCtx.beginPath();roadCtx.moveTo(460,0);roadCtx.lineTo(460,roadCanvas.height);roadCtx.stroke();
 roadCtx.setLineDash([]);
 roadCtx.strokeStyle="#70e6d6";roadCtx.lineWidth=2;roadCtx.strokeRect(120,0,520,roadCanvas.height);
 const currentX=roadLaneX[0]+(roadLaneX[2]-roadLaneX[0])*(roadState.lane/2);
 roadState.objects.forEach(o=>{
  if(o.type==="opportunity"){
   roadCtx.fillStyle="#70e6d6";roadCtx.beginPath();roadCtx.arc(o.x,o.y,14+Math.sin(o.pulse*4)*2,0,Math.PI*2);roadCtx.fill();
   roadCtx.fillStyle="#06211e";roadCtx.font="bold 12px monospace";roadCtx.textAlign="center";roadCtx.fillText("+",o.x,o.y+4);
  }else{
   roadCtx.fillStyle="#ff647c";roadCtx.fillRect(o.x-18,o.y-25,36,50);
   roadCtx.fillStyle="#300b19";roadCtx.fillRect(o.x-12,o.y-17,24,8);roadCtx.fillRect(o.x-12,o.y+9,24,8);
  }
 });
 roadCtx.save();
 roadCtx.translate(currentX,350);
 roadCtx.fillStyle="#ffd866";roadCtx.fillRect(-18,-28,36,56);
 roadCtx.fillStyle="#121a25";roadCtx.fillRect(-12,-20,24,12);roadCtx.fillRect(-12,8,24,12);
 roadCtx.fillStyle="#70e6d6";roadCtx.fillRect(-22,-20,5,12);roadCtx.fillRect(17,-20,5,12);roadCtx.fillRect(-22,8,5,12);roadCtx.fillRect(17,8,5,12);
 roadCtx.restore();
 roadCtx.fillStyle="#71809e";roadCtx.font="10px monospace";roadCtx.textAlign="left";roadCtx.fillText("DISTANCE "+Math.floor(roadState.distance),14,20);
 roadCtx.textAlign="right";roadCtx.fillText("NEXT "+(roadState.checkpoint<roadCheckpointDistances.length-1?roadCheckpointDistances[roadState.checkpoint+1]: "∞"),746,20);
}
function roadFrame(t){
 const dt=Math.min(.035,(t-roadState.last)/1000||0);
 roadState.last=t;
 if(roadState.active&&!document.hidden)roadUpdate(dt);
 requestAnimationFrame(roadFrame);
}
requestAnimationFrame(roadFrame);

function roadRestart(){
 roadState.active=false;
 roadState.distance=0;
 roadState.score=0;
 roadState.checkpoint=0;
 roadState.checkpointScore=0;
 roadState.checkpointScores=Array(roadCheckpointDistances.length).fill(0);
 roadState.checkpointAttempts=Array(roadCheckpointDistances.length).fill(0);
 roadState.lane=1;
 roadState.targetLane=1;
 roadState.objects=[];
 roadState.spawnTimer=.35;
 roadState.crashCooldown=1.2;
 roadSave();
 roadUpdateHud();
 playCue('roadStart',.75);
 emitNarrative('road.restart',true);
 roadSetOverlay("FRESH START","THE ROAD STARTS OVER.","Checkpoint and current score cleared. Your best score stays on the board.","▶ START THE ROAD");
 roadLog.textContent="New run ready. Every checkpoint is yours to earn again.";
 roadGame.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});
}

if(roadSafeGet(ROAD_UNLOCK_KEY)==="1"){
 roadGame.hidden=false;
 roadLoad();
 roadUpdateHud();
 roadSetOverlay("CHAPTER VI // KEEP GOING","THE ROAD REMEMBERS.","Checkpoint "+(roadState.checkpoint===0?"START":String(roadState.checkpoint).padStart(2,"0"))+" is saved with a score of "+Math.floor(roadState.checkpointScore)+".","▶ KEEP GOING");
}else if(roadGame){
 roadGame.hidden=true;
}
roadStartButton.addEventListener("click",roadStart);
document.querySelector('#roadRestart').addEventListener("click",roadRestart);
document.querySelectorAll("[data-road-dir]").forEach(button=>{
 button.addEventListener("pointerdown",e=>{
  e.preventDefault();
  button.setPointerCapture?.(e.pointerId);
  roadInput(button.dataset.roadDir==="left"?-1:1);
  button.classList.add("pressed");
 });
 const release=e=>{e.preventDefault();button.classList.remove("pressed")};
 button.addEventListener("pointerup",release);
 button.addEventListener("pointercancel",release);
 button.addEventListener("lostpointercapture",release);
 button.addEventListener("contextmenu",e=>e.preventDefault());
});
roadStage.addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if(k==="arrowleft"||k==="a"){e.preventDefault();roadInput(-1)}
 if(k==="arrowright"||k==="d"){e.preventDefault();roadInput(1)}
});
roadStage.addEventListener("click",()=>roadStage.focus());

rechallengeBoss.addEventListener("click",()=>{
 bossState.rechallengeCount++;
 state.hp=5;
 state.armour=0;
 state.mobility=1;
 state.bossDeaths=0;
 bossRechallenge.hidden=true;
 ending.hidden=true;
 missionState.textContent="REMATCH";
 setStory("CHAPTER IV","THE REMATCH","Same arena. New difficulty. Character reset. Lessons retained.","The character resets to the beginning. The obstacle does not. The only thing Rishi gets to carry forward is what he learned. Baaki sab fresh run.");
 bossShell.hidden=false;
 bossShell.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});
 initBoss();
 setLog("REMATCH "+bossState.rechallengeCount+" BEGINS. Fresh character. Stronger boss.");
});

document.addEventListener("visibilitychange",()=>{
 if(document.hidden){
  if(roadState.active)roadSave();
  roadState.active=false;
 }
});
