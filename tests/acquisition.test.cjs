const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('./app-helper.cjs');

test('an assisted written answer never becomes an independent recall or extends SM2',()=>{
 const a=app();a.run(`var s={progress:{},meta:{}};s=gradeWord(s,'a','good','prod',0,{kind:'recall',assisted:true});`);
 assert.equal(a.run('s.progress.a.prod'),0);
 assert.equal(a.run('s.progress.a.repetitions'),0);
 assert.equal(a.run('s.progress.a.learning.phase'),'active');
});
test('acquisition requires understanding and independent recalls on separate days',()=>{
 const a=app();a.run(`var s={progress:{},meta:{}};
 s=gradeWord(s,'a','good','discover',0);
 s=gradeWord(s,'a','good','recog',0,{kind:'meaning',assisted:true});
 s=gradeWord(s,'a','good','context',0,{kind:'context',assisted:true});
 s=gradeWord(s,'a','good','prod',0,{kind:'recall',assisted:false});
 s=gradeWord(s,'a','good','prod',0,{kind:'recall',assisted:false});`);
 assert.equal(a.run('s.progress.a.learning.phase'),'active');
 assert.equal(a.run('Object.keys(s.progress.a.learning.independentDays).length'),1);
 a.advance(86400000);
 a.run(`s=gradeWord(s,'a','good','recog',0,{kind:'meaning',assisted:true});s=gradeWord(s,'a','good','prod',0,{kind:'recall',assisted:false});`);
 assert.equal(a.run('s.progress.a.learning.phase'),'consolidated');
 const next=a.run('s.progress.a.next');
 a.run(`s=gradeWord(s,'a','good','prod',0,{kind:'recall',assisted:false});`);
 assert.equal(a.run('s.progress.a.next'),next);
});
test('a failed recall reactivates a consolidated word and removes that day success',()=>{
 const a=app();a.run(`var s={progress:{a:{...EMPTY_PROGRESS,seen:10,repetitions:2,intervalDays:6,next:addDays(4),learning:{phase:'consolidated',meaningDays:{'2026-10-03':1,'2026-10-04':1},independentDays:{'2026-10-03':1,'2026-10-04':1},contextDays:{'2026-10-03':1}}}},meta:{}};
 s=gradeWord(s,'a','good','prod',0,{kind:'recall',assisted:false});
 s=gradeWord(s,'a','again','prod',0,{kind:'recall',assisted:false});`);
 assert.equal(a.run('s.progress.a.learning.phase'),'active');
 assert.equal(a.run('s.progress.a.learning.independentDays[localDateKey()]'),undefined);
 assert.equal(a.run('s.progress.a.learning.lastFailureDay'),a.run('localDateKey()'));
});
test('profile save and reload preserve learning evidence and old due dates',()=>{
 const a=app();a.run(`var s={progress:{a:{...EMPTY_PROGRESS,seen:4,next:addDays(8),repetitions:2,intervalDays:6}},meta:{}};
 s=gradeWord(s,'a','good','context',0,{kind:'context',assisted:true});var before=s.progress.a.next;saveProgress(s);s=loadProgress();`);
 assert.equal(a.run('s.progress.a.next'),a.run('before'));
 assert.equal(a.run('s.progress.a.learning.phase'),'consolidated');
 assert.equal(a.run('Object.keys(s.progress.a.learning.contextDays).length'),1);
});
test('an old next-only profile remains consolidated after normalization and save',()=>{
 const a=app();a.run(`var w={id:'a'};var s={progress:{a:{seen:10,correct:7,next:addDays(30)}},meta:{}};saveProgress(s);s=loadProgress();`);
 assert.equal(a.run('buildDailySession(s,[w]).review.length'),0);
});

