const CACHE='manga-shelf-shell-v61';
const SHELL=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin===location.origin){
  const isPage=req.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/');
  if(isPage){
   event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{})}return res}).catch(async()=>{const cache=await caches.open(CACHE);return (await cache.match(req))||(await cache.match('./index.html'))}));
  }else{
   event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(req))||fetch(req).then(res=>{if(res.ok){cache.put(req,res.clone()).catch(()=>{})}return res})));
  }
 } else if(url.hostname==='cdn.jsdelivr.net'||url.hostname==='cdnjs.cloudflare.com'){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(req))||fetch(req).then(res=>{if(res.ok){cache.put(req,res.clone())}return res})));
 }
});