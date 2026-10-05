const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const app=require('./app-helper.cjs');const cw=require('../crossword-engine.js');
function fixture(){const a=app();a.run(`var ws=buildWords(['Abnégation','Aboulie','Anaphore','Anachorète','Atavisme','Biosphère','Abduction','Acrimonie','Adage','Acerbe','Absolu','Adjuvant'].map((word,i)=>({word,definition_courte:'Indice distinct '+i,definition:'Définition complète '+i})));var s={progress:{},meta:{}};ws.forEach((w,i)=>s.progress[w.id]=i<8?{...EMPTY_PROGRESS,seen:4,correct:1,wrong:3,next:'2020-01-01'}:{...EMPTY_PROGRESS,seen:12,correct:12,mastery:6,prod:4,recall:6,recallStreak:3,streak:6,next:'2026-11-01',correctDays:{'2026-09-01':1,'2026-09-12':1,'2026-09-24':1,'2026-10-02':1},recallDays:{'2026-09-12':1,'2026-09-24':1,'2026-10-02':1},firstCorrectDay:'2026-09-01',lastCorrectDay:'2026-10-02'});`);return a;}
test('adapter respects current SRS and mastery rules, not old error count alone',()=>{
 const a=fixture();assert.equal(a.run('buildCrosswordCandidates(s,ws).filter(w=>w.role==="due").length'),8);
 assert.equal(a.run('buildCrosswordCandidates(s,ws).filter(w=>w.role==="known").length'),4);
 a.run(`s.progress[ws[0].id].next='2030-01-01'`);assert.equal(a.run('buildCrosswordCandidates(s,ws).some(w=>w.id===ws[0].id)'),false);
 assert.equal(a.run('buildCrosswordCandidates({progress:{},meta:{}},ws).length'),0);
});
test('only a due matching word is graded once; known and stale clues never change profile',()=>{
 const a=fixture();a.run(`var puzzle=AtelierCrossword.createPuzzle(buildCrosswordCandidates(s,ws)).puzzle;var graded=new Set();var e=puzzle.entries.find(e=>e.role==='due');s=recordCrosswordResult(s,ws,puzzle,{id:e.id,rating:'good'},graded);`);
 assert.equal(a.run('s.meta.xp'),10);assert.equal(a.run('s.progress[e.id].context'),1);assert.equal(a.run('s.progress[e.id].prod'),0);
 a.run(`s=recordCrosswordResult(s,ws,puzzle,{id:e.id,rating:'good'},graded)`);assert.equal(a.run('s.meta.xp'),10);
 a.run(`var known=puzzle.entries.find(e=>e.role==='known');var before=JSON.stringify(s);s=recordCrosswordResult(s,ws,puzzle,{id:known.id,rating:'again'},graded)`);assert.equal(a.run('JSON.stringify(s)===before'),true);
 a.run(`var other=puzzle.entries.find(x=>x.role==='due'&&x.id!==e.id);ws.find(x=>x.id===other.id).compact='Sens modifié';s=recordCrosswordResult(s,ws,puzzle,{id:other.id,rating:'good'},graded)`);assert.equal(a.run('s.meta.xp'),10);
});
test('worker handles a serialized pool with a matching request ID',()=>{
 const messages=[];const ctx=vm.createContext({AtelierCrossword:cw,importScripts:()=>{},self:{postMessage:m=>messages.push(m)}});
 vm.runInContext(fs.readFileSync('crossword-worker.js','utf8'),ctx);
 ctx.self.onmessage({data:{id:42,items:fixture().run('buildCrosswordCandidates(s,ws)')}});
 assert.equal(messages[0].id,42);assert.ok(messages[0].result.puzzle);
});
module.exports={fixture};
test('compatible mastery survives the real profile serialization round trip',()=>{
 const a=fixture();a.run('saveProgress(s);s=loadProgress()');
 assert.equal(a.run('buildCrosswordCandidates(s,ws).filter(w=>w.role==="known").length'),4);
});
