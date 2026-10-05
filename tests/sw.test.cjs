const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
test('PWA caches review data and serves cached navigation and data offline',async()=>{
 const handlers={},entries=new Map(),added=[];const cache={add:async u=>{added.push(u);if(u.includes('react-dom'))throw new Error('unavailable asset');entries.set(u,{status:200,url:u});},put:async(k,v)=>entries.set(k.url||k,v)};
 const ctx=vm.createContext({console:{warn:()=>{}},self:{addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:()=>{},clients:{claim:()=>{}}},caches:{open:async()=>cache,match:async request=>entries.get(request.url||request),keys:async()=>['atelier-vocab-v6-srs','atelier-vocab-v7-learning'],delete:async k=>{assert.equal(k,'atelier-vocab-v6-srs');}},fetch:async()=>{throw new Error('offline');}});
 vm.runInContext(fs.readFileSync('sw.js','utf8'),ctx);let wait;handlers.install({waitUntil:p=>wait=p});await wait;
 assert.ok(added.includes('./data/qcm-reviewed.json'));assert.ok(entries.has('./index.html'));assert.ok(entries.has('./data/qcm-reviewed.json'));
 handlers.activate({waitUntil:p=>wait=p});await wait;
 let response;handlers.fetch({request:{url:'./index.html',mode:'navigate'},respondWith:p=>response=p});assert.equal((await response).url,'./index.html');
 handlers.fetch({request:{url:'./data/qcm-reviewed.json',mode:'cors'},respondWith:p=>response=p});assert.equal((await response).url,'./data/qcm-reviewed.json');
});
