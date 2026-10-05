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
