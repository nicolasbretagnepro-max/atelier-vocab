const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('./app-helper.cjs');

test('the routine introduces two words and keeps an active word despite its future SM2 date',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS);var s={progress:{[ws[0].id]:{...EMPTY_PROGRESS,seen:2,next:addDays(5),learning:{phase:'active',lastSeenDay:'2026-10-04'}}},meta:{}};var session=buildDailySession(s,ws);`);
 assert.equal(a.run('session.discover.length'),2);
 assert.equal(a.run('session.review.some(w=>w.id===ws[0].id)'),true);
});
test('active words rotate alongside newcomers within a thirty encounter budget',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS);var s={progress:{},meta:{}};ws.slice(0,10).forEach(w=>s.progress[w.id]={...EMPTY_PROGRESS,seen:2,next:addDays(5),learning:{phase:'active'}});var session=buildDailySession(s,ws);var queues=buildDailyQueues(session);`);
 assert.equal(a.run('new Set(queues.flat().map(w=>w.id)).size'),10);
 assert.equal(a.run('session.discover.filter(w=>!readP(s,w.id).seen).length'),2);
 assert.ok(a.run('queues.flat().length')<=30);
 assert.ok(a.run('session.boss.length')<=3);
});
test('oversized legacy active pools rotate the least recently seen words',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS);var s={progress:{},meta:{}};ws.forEach((w,i)=>s.progress[w.id]={...EMPTY_PROGRESS,seen:1,learning:{phase:'active',lastSeenDay:i<2?'2026-10-05':'2026-10-01'}});var session=buildDailySession(s,ws);`);
 assert.equal(a.run('session.active.length'),10);
 assert.equal(a.run('session.active.some(w=>w.id===ws[0].id)'),false);
 assert.equal(a.run('session.waiting'),a.run('ws.length-10'));
});

test('daily extra retries are limited to two total and one per word',()=>{
 const a=app();a.run(`var q=[[{id:'a'},{id:'b'},{id:'c'},{id:'d'}],[],[],[],[]];var r={current:{}};
 q=insertDailyRetry(q,0,0,q[0][0],r).queues;
 q=insertDailyRetry(q,0,0,q[0][0],r).queues;
 q=insertDailyRetry(q,0,1,q[0][1],r).queues;
 q=insertDailyRetry(q,0,2,q[0][2],r).queues;`);
 assert.equal(a.run('q.flat().length'),6);
 assert.equal(a.run('q.flat().filter(w=>w.id===\'a\').length'),2);
});
test('a tiny corpus and an unreviewed imported word can still enter the routine',()=>{
 const a=app();a.run(`var ws=buildWords([{word:'Exulter',definition:'Manifester une joie intense.',example_1:'Les joueurs exultent de joie.',example_cloze_1:'Les joueurs […] de joie.'}]);var session=buildDailySession({progress:{}},ws);`);
 assert.equal(a.run('session.discover.length'),1);
 assert.equal(a.run('session.boss.length'),1);
 assert.equal(a.run('session.production.length'),1);
});
test('leaving and reopening the routine cannot introduce more new words that day',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS);var s={progress:{},meta:{}};var first=buildDailySession(s,ws);first.discover.forEach(w=>s=gradeWord(s,w.id,'good','discover',0));var again=buildDailySession(s,ws);`);
 assert.equal(a.run('again.discover.filter(w=>!readP(s,w.id).seen).length'),0);
 a.advance(86400000);assert.equal(a.run('buildDailySession(s,ws).discover.length'),2);
});
