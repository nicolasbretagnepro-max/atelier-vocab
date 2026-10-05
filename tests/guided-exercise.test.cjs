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
test('an unalignable cloze fallback cannot count as contextual understanding',()=>{
 const a=fixture();a.run("w.examples[0].cloze='Une […] phrase sans relation.'");
 const expr="GuidedRecall({word:w,level:1,context:true,onAnswer:r=>result=r})";
 let tree=a.render(expr);find(tree,t=>t.type==='input').props.onChange({target:{value:'exulter'}});
 tree=a.render(expr);find(tree,t=>t.props?.label==='Valider').props.onClick();
 tree=a.render(expr);find(tree,t=>t.props?.label==='Continuer').props.onClick();
 assert.equal(a.run('result.kind'),'recall');
});
test('reviewed irregular source forms keep seoir eligible for contextual learning',()=>{
 const a=fixture();a.run(`var irregular=buildWord({word:'Seoir',definition:'Convenir à une situation.',example_1:'Ce ton ne sied guère à cette invitation.',example_cloze_1:'Ce ton ne […] guère à cette invitation.',example_2:'Un ton plus mesuré sierait mieux.',example_cloze_2:'Un ton plus mesuré […] mieux.'});`);
 assert.equal(a.run('contextAnswer(irregular,0)?.answer'),'sied');
 assert.equal(a.run('contextAnswer(irregular,1)?.answer'),'sierait');
 assert.equal(a.run("guidedAnswerMatches('sied',irregular,contextAnswer(irregular,0))"),true);
 a.run("irregular.examples[0].example='Ce ton ne correspond guère à cette invitation.'");
 assert.equal(a.run('contextAnswer(irregular,0)'),null);
});
test('context uses the other source example when the selected gap cannot be aligned',()=>{
 const a=fixture();a.run(`w.examples[0].cloze='Une […] phrase sans relation.';w.examples.push({example:'Les supporters exultent au coup de sifflet.',cloze:'Les supporters […] au coup de sifflet.'});`);
 const expr="GuidedRecall({word:w,level:1,context:true,exampleIndex:0,onAnswer:r=>result=r})";
 let tree=a.render(expr);assert.match(visibleText(tree),/Les supporters/);
 find(tree,t=>t.type==='input').props.onChange({target:{value:'exultent'}});
 tree=a.render(expr);find(tree,t=>t.props?.label==='Valider').props.onClick();
 tree=a.render(expr);find(tree,t=>t.props?.label==='Continuer').props.onClick();
 assert.equal(a.run('result.kind'),'context');assert.equal(a.run('result.ok'),true);
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
test('a crossword for unseen words opens with readable discovery cards before its inputs',()=>{
 const a=fixture();a.run(`var puzzle={rows:1,cols:3,entries:[{id:'a',term:'Exulter',answer:'EXULTER',clue:'Exprimer une joie intense',role:'practice',unseen:true,keys:['0:0'],number:1,dir:'H'}],cells:[[{letter:'E',ids:['a']}]]};`);
 const tree=a.render('CrosswordGame({puzzle,open:true,onClose:()=>{}})');
 assert.ok(find(tree,t=>t.type==='button'&&visibleText(t).includes('Commencer la grille')));
 assert.equal(find(tree,t=>t.type==='input'),undefined);
});
