const {test}=require('node:test');const assert=require('node:assert/strict');const app=require('./app-helper.cjs');
test('short sessions prioritize due words and cap new words and total',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS);var s={progress:{},meta:{}};ws.slice(0,10).forEach(w=>s.progress[w.id]={...EMPTY_PROGRESS,seen:1,next:'2020-01-01'});`);
 assert.equal(a.run('buildShortSession(s,ws).length'),5);assert.equal(a.run('buildShortSession(s,ws).filter(w=>!readP(s,w.id).seen).length'),0);
 a.run('s.progress={};ws.slice(0,3).forEach(w=>s.progress[w.id]={...EMPTY_PROGRESS,seen:1,next:"2020-01-01"})');
 assert.equal(a.run('buildShortSession(s,ws).length'),5);assert.equal(a.run('buildShortSession(s,ws).filter(w=>!readP(s,w.id).seen).length'),2);
 a.run('s.progress={}');assert.equal(a.run('buildShortSession(s,ws).length'),2);
 assert.equal(a.run('buildShortSession(s,[]).length'),0);
});
test('future reviews are excluded and next due date is returned',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS).slice(0,2);var s={progress:{},meta:{}};ws.forEach(w=>s.progress[w.id]={...EMPTY_PROGRESS,seen:1,next:'2030-01-01T00:00:00Z'});`);
 assert.equal(a.run('buildShortSession(s,ws).length'),0);assert.equal(a.run('getNextDueAt(s,ws)'), '2030-01-01T00:00:00.000Z');
});
