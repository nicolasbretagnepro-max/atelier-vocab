const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
function worker(fail=false){
 const handlers={},entries=new Map(),added=[],deleted=[];let skipped=0;
 const cache={add:async u=>{added.push(u);if(fail&&u.includes('react-dom'))throw new Error('required asset unavailable');entries.set(u,{status:200,url:u});},put:async(k,v)=>entries.set(k.url||k,v)};
 const ctx=vm.createContext({console:{warn:()=>{}},self:{addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:()=>{skipped++;},clients:{claim:()=>{}}},caches:{open:async()=>cache,match:async request=>entries.get(request.url||request),keys:async()=>['atelier-vocab-v7-learning','atelier-vocab-v8-crossword','atelier-vocab-v9-release','atelier-vocab-v10-routine','unrelated-app'],delete:async k=>{deleted.push(k);}},fetch:async()=>{throw new Error('offline');}});
 vm.runInContext(fs.readFileSync('sw.js','utf8'),ctx);
 return {handlers,entries,added,deleted,get skipped(){return skipped;}};
}
test('PWA caches every required asset and serves navigation and data offline',async()=>{
 const w=worker();let wait;w.handlers.install({waitUntil:p=>wait=p});await wait;
 assert.ok(w.added.includes('./data/qcm-reviewed.json'));assert.ok(w.entries.has('./index.html'));
 for(const asset of ['crossword-engine.js','crossword-worker.js','crossword-ui.jsx','crossword.css'])assert.ok(w.entries.has('./'+asset));
 assert.ok(w.added.some(u=>u.includes('react-dom')));assert.equal(w.skipped,1);
 w.handlers.activate({waitUntil:p=>wait=p});await wait;
 assert.deepEqual(w.deleted,['atelier-vocab-v7-learning','atelier-vocab-v8-crossword','atelier-vocab-v9-release']);
 let response;w.handlers.fetch({request:{url:'./index.html',mode:'navigate'},respondWith:p=>response=p});assert.equal((await response).url,'./index.html');
 w.handlers.fetch({request:{url:'./data/qcm-reviewed.json',mode:'cors'},respondWith:p=>response=p});assert.equal((await response).url,'./data/qcm-reviewed.json');
});
test('an incomplete PWA update rejects installation and keeps the active offline cache',async()=>{
 const w=worker(true);let wait;w.handlers.install({waitUntil:p=>wait=p});
 await assert.rejects(wait,/required asset unavailable/);assert.equal(w.skipped,0);assert.deepEqual(w.deleted,[]);
});
