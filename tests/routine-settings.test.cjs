const {test}=require('node:test');const assert=require('node:assert/strict');const app=require('./app-helper.cjs');
test('learning settings default to two and survive profile save with valid limits',()=>{
 const a=app();assert.equal(a.run('loadProfile().learningSettings?.newPerDay'),2);
 a.run('updateProfilePatch({learningSettings:{newPerDay:3}})');assert.equal(a.run('loadProfile().learningSettings.newPerDay'),3);
 assert.equal(a.run('buildDailySession({progress:{}},buildWords(SEED_WORDS)).discover.length'),3);
 a.run('updateProfilePatch({learningSettings:{newPerDay:-50}})');assert.equal(a.run('loadProfile().learningSettings.newPerDay'),1);
 a.run('updateProfilePatch({learningSettings:{newPerDay:500}})');assert.equal(a.run('loadProfile().learningSettings.newPerDay'),3);
});
test('the summary distinguishes independent recall from assisted discovery and lists tomorrow active words',()=>{
 const a=app();a.run(`var w=buildWords(SEED_WORDS)[0];var s={progress:{[w.id]:{...EMPTY_PROGRESS,seen:3,learning:{phase:'active'}}}};
 var summary=routineSummary([{word:w,ok:true,kind:'discover'},{word:w,ok:true,kind:'recall',assisted:true},{word:w,ok:true,kind:'recall',assisted:false}],s);`);
 assert.equal(a.run('summary.assisted'),1);assert.equal(a.run('summary.independent'),1);
 assert.equal(a.run('summary.tomorrow.length'),1);
});
test('assisted practice in complementary modes cannot push out a due review',()=>{
 const a=app();a.run(`var s={progress:{a:{...EMPTY_PROGRESS,seen:8,repetitions:2,intervalDays:6,next:addDays(-1)}},meta:{}};var due=s.progress.a.next;s=gradeWord(s,'a','good','guided');`);
 assert.equal(a.run('s.progress.a.next'),a.run('due'));
});
test('the short session teaches an unseen word instead of asking to recall its unseen meaning',()=>{
 const a=app();a.run('var w=buildWords(SEED_WORDS)[0]');
 const tree=a.render('ShortExercise({word:w,progress:{seen:0},words:[w],onAnswer:()=>{}})');
 assert.equal(tree.type.name,'StepDiscover');
});
