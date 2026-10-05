const {test}=require('node:test');const assert=require('node:assert/strict');
const cw=require('../crossword-engine.js');
const terms=['ABNEGATION','ABOULIE','ANAPHORE','ANACHORETE','ATAVISME','BIOSPHERE','ABDUCTION','ACRIMONIE','ADAGE','ACERBE','ABSOLU','ADJUVANT'];
const items=terms.map((term,i)=>({id:'w'+i,term,clue:'Indice distinct '+i,role:i<8?'due':'known',rate:i*7,next:'2020-01-01'}));
test('French letters, duplicate answers, long words and invalid candidates',()=>{
 assert.equal(cw.letters('À l’orée, cœur!'),'ALOREECOEUR');
 const s=cw.selectCandidates([...items,{...items[0],id:'duplicate'},{id:'long',term:'INCONSTITUTIONNEL',clue:'Trop long',role:'due'}],7);
 assert.equal(s.selected.length,7);assert.equal(s.selected.filter(w=>w.role==='due').length,5);
 assert.equal(s.pool.filter(w=>w.answer==='ABNEGATION').length,1);
 assert.ok(s.pool.every(w=>w.answer.length<=11));
});
test('missing known or due pool returns an explicit reason',()=>{
 assert.equal(cw.createPuzzle(items.filter(w=>w.role==='due')).reason,'insufficient-pool');
 assert.equal(cw.createPuzzle([]).reason,'insufficient-pool');
});
test('generated grid has 5–7 unique connected words, proper quotas and matching intersections',()=>{
 const result=cw.createPuzzle(items);assert.ok(result.puzzle,result.reason);
 const p=result.puzzle;assert.ok(p.rows<=11&&p.cols<=11);assert.ok(p.entries.length>=5&&p.entries.length<=7);
 assert.equal(p.entries.filter(e=>e.role==='due').length,Math.round(p.entries.length*.7));
 assert.equal(new Set(p.entries.map(e=>e.answer)).size,p.entries.length);
 for(const e of p.entries)e.keys.forEach((k,i)=>{const [r,c]=k.split(':').map(Number);assert.equal(p.cells[r][c].letter,e.answer[i]);});
 const reached=new Set([p.entries[0].id]);let changed=true;
 while(changed){changed=false;for(const row of p.cells)for(const cell of row){if(cell?.ids.some(id=>reached.has(id)))for(const id of cell.ids)if(!reached.has(id)){reached.add(id);changed=true;}}}
 assert.equal(reached.size,p.entries.length);
});
test('placements reject incompatible letters, parallel overlaps, adjacent words and islands',()=>{
 const empty={cells:new Map(),entries:[],score:0,area:0};const word={id:'a',term:'CHAT',answer:'CHAT',role:'due',rank:0};
 const base=cw.place(empty,word,4,3,'H',11);assert.ok(base);
 assert.equal(cw.place(base,{...word,id:'b',answer:'CHOC'},4,3,'H',11),null);
 assert.equal(cw.place(base,{...word,id:'b',answer:'TIGE'},3,4,'V',11),null);
 assert.equal(cw.place(base,{...word,id:'b',answer:'CHAT'},5,3,'H',11),null);
 assert.equal(cw.place(base,{...word,id:'b',answer:'MER'},0,0,'H',11),null);
 assert.ok(cw.place(base,{...word,id:'b',answer:'HIVER'},4,4,'V',11));
});
test('incompatible corpus and computation budget never publish a partial grid',()=>{
 const disjoint=Array.from({length:12},(_,i)=>({id:String(i),term:String.fromCharCode(65+i).repeat(4),clue:'Indice '+i,role:i<8?'due':'known'}));
 assert.equal(cw.createPuzzle(disjoint).puzzle,null);
 assert.equal(cw.createPuzzle(items,{maxAttempts:0}).puzzle,null);
});
module.exports={items};
test('typing advances within the word, paste and deletion preserve shared locked letters',()=>{
 const p=cw.createPuzzle(items).puzzle;let s=cw.newGame();const e=p.entries[0];
 let change=cw.input(s,p,e.id,e.keys[0],'é');assert.equal(change.game.values[e.keys[0]],'E');assert.equal(change.focus,e.keys[1]);
 change=cw.input(change.game,p,e.id,e.keys[1],'oe',true);assert.equal(change.game.values[e.keys[1]],'O');assert.equal(change.game.values[e.keys[2]],'E');
 const back=cw.erase(change.game,p,e.id,e.keys[3]);assert.equal(back.focus,e.keys[2]);assert.equal(back.game.values[e.keys[2]],'');
 s=cw.check(change.game,p,e.id,true).game;
 const locked=e.keys[0];assert.equal(cw.input(s,p,e.id,locked,'Z').game.values[locked],e.answer[0]);
});
test('incomplete is ungraded, errors and reveals are graded once; later corrections cannot farm XP',()=>{
 const p=cw.createPuzzle(items).puzzle;const e=p.entries.find(e=>e.role==='due');let s=cw.newGame();
 assert.equal(cw.check(s,p,e.id).evaluation,null);
 for(const k of e.keys)s=cw.input(s,p,e.id,k,'Z').game;
 let checked=cw.check(s,p,e.id);assert.equal(checked.evaluation.rating,'again');s=checked.game;
 assert.equal(cw.check(s,p,e.id).evaluation,null);
 checked=cw.check(s,p,e.id,true);assert.equal(checked.evaluation,null);assert.equal(checked.game.results[e.id].done,true);
 assert.equal(cw.check(checked.game,p,e.id).evaluation,null);
});
test('correct due word emits context result; known support never emits an SRS result',()=>{
 const p=cw.createPuzzle(items).puzzle;
 for(const role of ['due','known']){const e=p.entries.find(e=>e.role===role);let s=cw.newGame();s=cw.input(s,p,e.id,e.keys[0],e.answer,true).game;
 const result=cw.check(s,p,e.id);assert.equal(result.game.results[e.id].done,true);
 assert.equal(result.evaluation?.rating||null,role==='due'?'good':null);
 }
});
test('fully supplied word is solved without a recalled-success grade',()=>{
 const p={entries:[{id:'a',role:'known',answer:'ABC',keys:['0:0','0:1','0:2']},{id:'b',role:'due',answer:'ABC',keys:['0:0','0:1','0:2']} ]};
 const s={values:{'0:0':'A','0:1':'B','0:2':'C'},results:{a:{done:true}}};
 const result=cw.check(s,p,'b');assert.equal(result.evaluation,null);assert.equal(result.game.results.b.supplied,true);
});
