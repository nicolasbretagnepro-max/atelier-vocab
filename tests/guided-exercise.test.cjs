const {test}=require('node:test');const assert=require('node:assert/strict');const app=require('./app-helper.cjs');
function find(tree,predicate){if(!tree||typeof tree!=='object')return; if(predicate(tree))return tree;for(const c of [tree.props?.children||[]].flat(9)){const r=find(c,predicate);if(r)return r;}}
function visibleText(tree){if(typeof tree==='string')return tree;if(!tree||typeof tree!=='object')return '';return [tree.props?.children||[]].flat(9).map(visibleText).join(' ');}
function fixture(){const a=app();a.run(`var w=buildWord({word:'Exulter',definition_courte:'Manifester une joie intense.',definition:'Exprimer une joie visible et très intense.',example_1:'Les joueurs exultent lorsque le dernier tir entre dans le but.',example_cloze_1:'Les joueurs […] lorsque le dernier tir entre dans le but.'});var result=null;`);return a;}

test('discovery teaches the definition immediately before asking for a recall',()=>{
 const a=fixture();const tree=a.render('StepDiscover({word:w,words:[w],shown:false,setShown:()=>{},onNext:()=>{}})');
 assert.match(visibleText(tree),/Manifester une joie intense/);
 assert.match(visibleText(tree),/Exprimer une joie visible/);
});
test('context accepts the conjugated source form and the studied infinitive',()=>{
 const a=fixture();assert.equal(a.run('contextAnswer(w,0).answer'),'exultent');
 assert.equal(a.run("guidedAnswerMatches('exultent',w,contextAnswer(w,0))"),true);
 assert.equal(a.run("guidedAnswerMatches('exulter',w,contextAnswer(w,0))"),true);
 assert.equal(a.run("guidedAnswerMatches('hurlent',w,contextAnswer(w,0))"),false);
 a.run("w.examples[0].cloze='Une […] phrase sans relation.'");
 assert.equal(a.run('contextAnswer(w,0)'),null);
});
test('a missing safe QCM offers assisted learning instead of cold written recall',()=>{
 const a=fixture();const tree=a.render('SafeRecallFallback({word:w,onAnswer:()=>{}})');
 assert.equal(tree.type.name,'GuidedRecall');assert.equal(tree.props.level,1);
});
test('a contextual mistake keeps its explanation until Continue and does not auto-advance',()=>{
 const a=fixture();const expr="GuidedRecall({word:w,level:1,context:true,onAnswer:r=>result=r})";
 let tree=a.render(expr);find(tree,t=>t.type==='input').props.onChange({target:{value:'hurlent'}});
 tree=a.render(expr);find(tree,t=>t.props?.label==='Valider').props.onClick();
 assert.equal(a.run('result'),null);assert.equal(a.timers.length,0);
 tree=a.render(expr);assert.ok(find(tree,t=>t.type?.name==='LearningFeedback'));
 find(tree,t=>t.props?.label==='Continuer').props.onClick();
 assert.equal(a.run('result.ok'),false);
});
test('asking for an initial letter makes an otherwise successful recall assisted',()=>{
 const a=fixture();const expr="GuidedRecall({word:w,level:3,onAnswer:r=>result=r})";
 let tree=a.render(expr);find(tree,t=>t.props?.label==='Indice').props.onClick();
 tree=a.render(expr);find(tree,t=>t.type==='input').props.onChange({target:{value:'exulter'}});
 tree=a.render(expr);find(tree,t=>t.props?.label==='Valider').props.onClick();
 tree=a.render(expr);find(tree,t=>t.props?.label==='Continuer').props.onClick();
 assert.equal(a.run('result.assisted'),true);assert.equal(a.run('result.ok'),true);
});
test('an ambiguous prompt can be revealed without recording a failure',()=>{
 const a=fixture();const expr="GuidedRecall({word:w,level:3,onAnswer:r=>result=r})";
 let tree=a.render(expr);find(tree,t=>t.props?.label==='Autre réponse possible').props.onClick();
 tree=a.render(expr);find(tree,t=>t.props?.label==='Continuer').props.onClick();
 assert.equal(a.run('result.neutral'),true);
});
