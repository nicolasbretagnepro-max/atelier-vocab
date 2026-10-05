const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('./app-helper.cjs');
test('grading preserves a streak across multiple answers and consecutive ISO dates',()=>{
 const a=app();a.run(`var s={progress:{},meta:{xp:0,streak:6,lastDay:'2026-10-04'}};s=gradeWord(s,'a','good');`);
 assert.equal(a.run('s.meta.streak'),7);a.run(`s=gradeWord(s,'b','again')`);assert.equal(a.run('s.meta.streak'),7);
});
test('daily goal counts distinct evaluated words including errors',()=>{
  const a=app(); a.run(`var s={progress:{},meta:{}};s=gradeWord(s,'a','again');s=gradeWord(s,'a','good');s=gradeWord(s,'b','good','discover')`);
  assert.equal(a.run(`dailyGoalStatus(s.meta).count`),2);
});
test('five distinct words complete the goal with no extra reward',()=>{
  const a=app(); a.run(`var s={progress:{},meta:{}};for(let i=0;i<5;i++)s=gradeWord(s,'word'+i,'again');`);
  assert.equal(a.run(`dailyGoalStatus(s.meta).completed`),true); assert.equal(a.run(`s.meta.xp`),0);
});
test('old profiles start empty and daily goals survive save and load',()=>{
  const a=app(); assert.equal(a.run(`dailyGoalStatus({}).count`),0);
  a.run(`var s=gradeWord({progress:{},meta:{}},'a','again');`);
  assert.equal(a.run(`dailyGoalStatus(loadProgress().meta).count`),1);
});
test('missed day hides stale streak; evaluated discovery starts a streak',()=>{
  const a=app(); assert.equal(a.run(`visibleDailyStreak({lastDay:'2026-10-01',streak:7})`),0);
  assert.equal(a.run(`gradeWord({progress:{},meta:{}},'a','good','discover').meta.streak`),1);
});
test('day change resets goal and future lastDay cannot extend flame',()=>{
  const a=app(); a.run(`var s=gradeWord({progress:{},meta:{}},'a','again')`);a.advance(86400000);
  assert.equal(a.run(`dailyGoalStatus(s.meta).count`),0);
  assert.equal(a.run(`visibleDailyStreak({lastDay:'2026-10-30',streak:7})`),0);
});
