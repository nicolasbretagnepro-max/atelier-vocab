const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const source = html.split('<script type="text/babel">')[1].split('const MILESTONES =')[0];
function app() {
  let clock = Date.parse('2026-10-05T10:00:00Z');
  const storage = new Map();
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [clock])); } static now() {return clock;} }
  const context = vm.createContext({AtelierLearning:require('../learning-engine.js'),React:{}, Date:Clock, console,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  vm.runInContext(source, context);
  return {run: code=>vm.runInContext(code, context), advance:ms=>clock+=ms};
}
test('smart excludes future words even with many historical errors',()=>{
  const a=app(); assert.equal(a.run(`candidates({progress:{a:{seen:40,wrong:100,next:addDays(10)}}},[{id:'a'}]).length`),0);
});
test('new never recycles already seen words',()=>{
  const a=app(); assert.equal(a.run(`candidates({progress:{a:{seen:1}}},[{id:'a'}],'new').length`),0);
});
test('due precedes new and missing legacy dates are recoverable',()=>{
  const a=app(); assert.equal(a.run(`candidates({progress:{a:{seen:1,next:addDays(-1)}}},[{id:'b'},{id:'a'}])[0].id`),'a');
  assert.equal(a.run(`isDue({progress:{a:{seen:1}}},{id:'a'})`),true);
});
test('SM2 success intervals 1, 6, 15 days and early practice preserves schedule',()=>{
  const a=app(); a.run(`var s={progress:{},meta:{}}; s=gradeWord(s,'a','good');`);
  assert.equal(a.run(`s.progress.a.intervalDays`),1);
  const next=a.run(`s.progress.a.next`); a.run(`s=gradeWord(s,'a','easy','prod')`);
  assert.equal(a.run(`s.progress.a.next`),next); assert.equal(a.run(`s.progress.a.repetitions`),1);
  a.advance(86400000); a.run(`s=gradeWord(s,'a','good')`); assert.equal(a.run(`s.progress.a.intervalDays`),6);
  a.advance(6*86400000); a.run(`s=gradeWord(s,'a','good')`); assert.equal(a.run(`s.progress.a.intervalDays`),15);
});
test('failure resets, waits twenty minutes, and successful retry starts at one day',()=>{
  const a=app(); a.run(`var s={progress:{},meta:{}}; s=gradeWord(s,'a','again')`);
  const next=a.run(`s.progress.a.next`); a.run(`s=gradeWord(s,'a','good')`);
  assert.equal(a.run(`s.progress.a.next`),next);
  a.advance(20*60000); a.run(`s=gradeWord(s,'a','good')`);
  assert.equal(a.run(`s.progress.a.intervalDays`),1); assert.equal(a.run(`s.progress.a.repetitions`),1);
});
test('migration keeps IDs, dates and counters; discovery is not a recalled success',()=>{
  const a=app(); assert.equal(a.run(`migrateProgressEntry({seen:10,correct:7,next:addDays(7)}).correct`),7);
  a.run(`var s=gradeWord({progress:{},meta:{}},'a','good','discover')`);
  assert.equal(a.run(`s.progress.a.repetitions`),0); assert.equal(a.run(`s.progress.a.correct`),0);
});
test('ambiguous fallback never reintroduces identical definitions',()=>{
  const a=app(); assert.equal(a.run(`smartDistractors({id:'a',word:'A',compact:'tranquillité'},[{id:'b',word:'B',compact:'tranquillité'}]).length`),0);
});
test('unvalidated synonyms are omitted even without lexical overlap',()=>{
  const a=app(); assert.equal(a.run(`smartDistractors({id:'a',word:'A',compact:'calme intérieur'},[{id:'b',word:'B',compact:'sérénité spirituelle'}]).length`),0);
});
test('validated options are distinct pairwise and survive storage',()=>{
  const a=app(); assert.equal(a.run(`(() => {
    const a=buildWord({word:'A',definition_compacte:'tranquillité intérieure',qcm_definition:'tranquillité intérieure',qcm_distractors:[{word:'B',definition:'construction géométrique'},{word:'C',definition:'construction géométrique'}]});
    const b=buildWord({word:'B',definition_compacte:'construction géométrique'});
    const c=buildWord({word:'C',definition_compacte:'construction géométrique'});
    return smartDistractors(a,[b,c]).length;
  })()`),1);
  assert.equal(a.run(`compactItemForStorage({word:'A',qcm_distractors:[{word:'B',definition:'test'}]}).qcm_distractors.length`),1);
});
test('seed distractors work only while reviewed definitions remain unchanged',()=>{
  const a=app(); assert.ok(a.run(`smartDistractors(buildWord(SEED_WORDS[0]),buildWords(SEED_WORDS)).length`)>0);
  assert.equal(a.run(`smartDistractors({...buildWord(SEED_WORDS[0]),compact:'sens éditorial modifié'},buildWords(SEED_WORDS)).length`),0);
});
test('practice is explicit, preserves exclusions and cannot reopen asked words',()=>{
  const a=app(); assert.equal(a.run(`candidates({progress:{a:{seen:1,next:addDays(7)}}},[{id:'a'}],'practice',10,new Set(['a'])).length`),0);
});
test('context distractors require a review for the exact prompt',()=>{
  const a=app(); a.run(`var wa=buildWord({word:'A',definition_compacte:'calme intérieur',qcm_definition:'calme intérieur',qcm_context_distractors:[{word:'B',definition:'construction géométrique',prompt:'texte validé'}]}); var wb=buildWord({word:'B',definition_compacte:'construction géométrique'});`);
  assert.equal(a.run(`smartDistractorsContext(wa,[wb],3,'autre texte').length`),0);
  assert.equal(a.run(`smartDistractorsContext(wa,[wb],3,'texte validé').length`),1);
});
test('all seed QCM choices remain distinct over repeated shuffles',()=>{
  const a=app(); assert.equal(a.run(`(() => {
    const words=buildWords(SEED_WORDS);
    for(let pass=0;pass<10;pass++) for(const word of words) {
      const opts=[word,...smartDistractors(word,words)];
      for(let i=0;i<opts.length;i++)for(let j=i+1;j<opts.length;j++)
        if(isAmbiguousDistractor(opts[i],opts[j]))return false;
    }
    return true;
  })()`),true);
});
test('daily routine does not pull mastered future words to fill a quota',()=>{
  const a=app(); assert.equal(a.run(`buildDailySession({progress:{a:{seen:10,next:addDays(30)}}},[{id:'a'}]).review.length`),0);
});
test('low easiness and invalid imported interval cannot cause zero-day reviews',()=>{
  const a=app(); assert.ok(a.run(`scheduleReview({seen:1,repetitions:4,intervalDays:0,easeFactor:1.3,next:addDays(-1)},'hard').intervalDays`)>0);
});
test('daily new-word quota cannot be exceeded by unseen review fillers',()=>{
  const a=app(); assert.equal(a.run(`(() => {const session=buildDailySession({progress:{}},buildWords(SEED_WORDS));return new Set([...session.discover,...session.review,...session.boss].map(w=>w.id)).size;})()`),5);
});
