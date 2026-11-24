const CACHE_NAME="rishi-birthday-v4";
const CORE_ASSETS=["./","./index.html","./style.css","./script.js","./vendor/howler.min.js","./vendor/HOWLER-LICENSE.md"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_ASSETS.map(url=>new Request(url,{cache:"reload"})))).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

function store(request,response){
  if(response&&response.status===200&&new URL(request.url).origin===self.location.origin){
    const copy=response.clone();
    caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{});
  }
  return response;
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||request.headers.has("range"))return;
  const isCode=request.mode==="navigate"||["document","script","style"].includes(request.destination);
  if(isCode){
    // Network first so a new deploy is never hidden behind an old cache; cache is the offline fallback.
    event.respondWith(fetch(request).then(response=>store(request,response)).catch(()=>caches.match(request).then(cached=>cached||(request.mode==="navigate"?caches.match("./index.html"):Response.error()))));
    return;
  }
  // Images, audio and video: cache first.
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>store(request,response))));
});
