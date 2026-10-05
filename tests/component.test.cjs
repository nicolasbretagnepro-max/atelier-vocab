const {test}=require('node:test');const assert=require('node:assert/strict');const app=require('./app-helper.cjs');
function find(tree,predicate){if(!tree||typeof tree!=='object')return; if(predicate(tree))return tree;for(const c of [tree.props?.children||[]].flat(9)){const r=find(c,predicate);if(r)return r;}}
test('the primary daily action opens the full discovery-to-Boss routine',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS);var s={progress:{},meta:{}};var destination=null;`);
 const tree=a.render(`Dashboard({words:ws,figures:[],state:s,onStartDaily:()=>destination='daily',onStartShort:()=>destination='short'})`);
 const primary=find(tree,t=>t.type?.name==='Btn');assert.ok(primary);
 primary.props.onClick();assert.equal(a.run('destination'),'daily');
});
test('the full daily routine reaches the Boss after discovery and learning steps',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS).filter(w=>w.word==='Anaphore');var s={progress:{},meta:{}};`);
 const expr=`DailyTab({words:ws,state:s,setState:next=>s=typeof next==='function'?next(s):next,onMilestone:()=>{}})`;
 for(const name of ['StepDiscover','StepChoice','StepContext','StepProd']){
  const question=find(a.render(expr),t=>t.type?.name===name);assert.ok(question,`Expected ${name}`);
  if(name==='StepDiscover')question.props.onNext();else question.props.onAnswer(true);
  const timer=a.timers.shift();assert.equal(typeof timer,'function');timer();
 }
 const boss=find(a.render(expr),t=>t.type?.name==='StepChoice');assert.ok(boss);
 assert.equal(boss.props.mode,'mixed');assert.match(boss.props.key,/^boss-/);
});
test('short-session QCM varies the correct position and keeps it stable while answering',()=>{
 const a=app();a.run('var ws=buildWords(SEED_WORDS);var w=ws.find(w=>w.word==="Anaphore");Math.random=()=>0.75');
 const expression='ShortExercise({word:w,progress:{seen:1,repetitions:0},words:ws,onAnswer:()=>{}})';
 const question=a.render(expression);assert.equal(question.type.name,'StepChoice');assert.equal(question.props.answerIndex,3);
 a.run('Math.random=()=>0');assert.equal(a.render(expression).props.answerIndex,3);
 const b=app();b.run('var ws=buildWords(SEED_WORDS);var w=ws.find(w=>w.word==="Anaphore");Math.random=()=>0.25');
 assert.equal(b.render(expression).props.answerIndex,1);
});
test('wrong review answer schedules the next question',()=>{
 const a=app();a.run(`var ws=buildWords(SEED_WORDS).slice(0,2);var s={progress:{},meta:{}};`);
 const expr=`QuizSession({words:ws,state:s,setState:next=>s=next,onMilestone:()=>{},onBack:()=>{},title:'test',color:C.blue})`;
 a.render(expr);a.slots[1]=true;a.slots[2]=a.run('ws');const tree=a.render(expr);
 const question=find(tree,t=>t.type?.name==='ReviewQuizChoice');assert.ok(question);
 assert.doesNotThrow(()=>question.props.onAnswer(false,'prod'));assert.equal(a.timers.length,1);a.timers[0]();assert.equal(a.slots[3],1);
});
test('valid cloze selection is deterministic and excludes a leaking alternate',()=>{
 const a=app();a.run(`var w=buildWord({word:'Test',definition:'Examen',example_1:'Le test est utile pour vérifier la qualité.',example_cloze_1:'Le ________ est utile.',example_2:'Le test confirme tous les résultats attendus.',example_cloze_2:'Le test ________.'});`);
 const values=Array.from({length:30},()=>a.run('validClozePrompt(w)'));assert.equal(new Set(values).size,1);assert.equal(values[0],'Le ________ est utile.');
});
test('context question rejects choices reviewed only for a different sentence',()=>{
 const a=app();a.run(`var ws=buildWords([{word:'Calibrage',definition:'Réglage précis de la graduation',example_1:'Le calibrage assure une mesure précise.',example_cloze_1:'Le ________ assure une mesure précise.',example_2:'Un calibrage est nécessaire après le transport.',example_cloze_2:'Un ________ est nécessaire après le transport.',qcm_definition:'Réglage précis de la graduation',qcm_context_distractors:[{word:'Biosphère',definition:'Enveloppe vivante de la Terre',prompt:'Le ________ assure une mesure précise.'},{word:'Anachorète',definition:'Religieux solitaire retiré du monde',prompt:'Le ________ assure une mesure précise.'}]},{word:'Biosphère',definition:'Enveloppe vivante de la Terre'},{word:'Anachorète',definition:'Religieux solitaire retiré du monde'}]);`);
 const tree=a.render(`StepContext({word:ws[0],words:ws,exampleIndex:1,onAnswer:()=>{}})`);
 assert.equal(tree.type.name,'SafeRecallFallback');
});
