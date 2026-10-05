const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('./app-helper.cjs');
test('feedback never invents absent examples or differences',()=>{
  const a=app();assert.equal(a.run(`learningFeedbackContent(buildWord({word:'A',definition:'Une définition'})).example`),'');
  assert.equal(a.run(`learningFeedbackContent(buildWord({word:'A'}),{word:'B'}).difference`),'');
});
test('feedback uses reviewed difference and preserves mnemonic',()=>{
  const a=app();a.run(`var w=buildWord({word:'A',definition:'A',memory_tip:'Astuce personnelle',confusions:[{word:'B',difference:'A implique une intention, B non.'}]});`);
  assert.equal(a.run(`learningFeedbackContent(w,{word:'B'}).difference`),'A implique une intention, B non.');
  assert.equal(a.run(`learningFeedbackContent(w).memoryTip`),'Astuce personnelle');
});
test('four failures still produce progress and keep retries bounded',()=>{
  const a=app();a.run(`var s={progress:{},meta:{}};for(let i=0;i<4;i++)s=gradeWord(s,'a','again');`);
  assert.equal(a.run(`s.progress.a.wrong`),4);
  assert.equal(a.run(`(()=>{const words=buildWords(SEED_WORDS);const ref={current:{}};let list=words;for(let i=0;i<10;i++)list=insertRetryItem(list,0,words[0],ref,'test').list;return ref.current['test:'+words[0].id];})()`),2);
  assert.equal(a.run(`learningFeedbackContent({word:'A'}).definition`),'');
});
