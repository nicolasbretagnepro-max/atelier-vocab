const {test}=require('node:test');const assert=require('node:assert/strict');const app=require('./app-helper.cjs');
test('overlay applies only to exact current definitions and preserves IDs',()=>{
 const a=app();a.run(`var raw=[{word:'Alpha',definition:'Sens complet',definition_courte:'Sens court'},{word:'Beta',definition:'Autre'}];var review={version:1,entries:[{word:'Alpha',kind:'vocab',qcm_definition:'Sens court',qcm_full_definition:'Sens complet',qcm_distractors:[{word:'Beta',definition:'Autre'}]}]};`);
 assert.equal(a.run(`buildWords(raw,'vocab',review)[0].qcmDistractors.length`),1);
 assert.equal(a.run(`buildWords(raw,'vocab',review)[0].id===buildWords(raw)[0].id`),true);
 a.run(`raw[0].definition='Sens modifié'`);assert.equal(a.run(`getQcmReviewRecord(buildWord(raw[0]),review)`),null);
 assert.equal(a.run(`buildWords(raw,'vocab',null).length`),2);
});
test('stale candidate and changed context are discarded rather than replaced',()=>{
 const a=app();a.run(`var ws=buildWords([{word:'Alpha',definition:'Une action',qcm_definition:'Une action',qcm_distractors:[{word:'Beta',definition:'Ancien sens'}],qcm_context_distractors:[{word:'Beta',definition:'Autre sens',prompt:'Un ________.'}]},{word:'Beta',definition:'Autre sens'}]);`);
 assert.equal(a.run('smartDistractors(ws[0],ws).length'),0);
 assert.equal(a.run(`smartDistractorsContext(ws[0],ws,3,'Nouveau ________.').length`),0);
});
