(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AtelierCrossword=api;
})(globalThis,function(){
  'use strict';
  const key=(r,c)=>`${r}:${c}`;
  const letters=text=>String(text||'').toUpperCase().replace(/Œ/g,'OE').replace(/Æ/g,'AE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z]/g,'');
  const phrase=text=>String(text||'').toUpperCase().replace(/Œ/g,'OE').replace(/Æ/g,'AE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z]+/g,' ').trim();
  function selectCandidates(items,count=7,size=11,now=Date.now()){
    count=Math.max(5,Math.min(8,Number.isFinite(count)?Math.round(count):7));
    const dueQuota=Math.round(count*.7),knownQuota=count-dueQuota;
    const unique=new Set(),ids=new Set();
    const eligible=[];
    for(const source of items||[]){
      if(!source||!source.id||!['due','known'].includes(source.role))continue;
      const answer=letters(source.term),clue=String(source.clue||'').trim();
      const termPhrase=phrase(source.term);
      if(answer.length<3||answer.length>size||!clue||unique.has(answer)||ids.has(source.id))continue;
      if(termPhrase&&(` ${phrase(clue)} `).includes(` ${termPhrase} `))continue;
      unique.add(answer);ids.add(source.id);
      const date=Date.parse(source.next);
      const overdue=Number.isFinite(date)?Math.min(30,Math.max(0,(now-date)/86400000)):30;
      const rate=Number.isFinite(source.rate)?source.rate:0;
      eligible.push({...source,answer,clue,priority:(source.fragile?1000:0)+(100-rate)*2+overdue});
    }
    const due=eligible.filter(w=>w.role==='due').sort((a,b)=>b.priority-a.priority||String(a.id).localeCompare(String(b.id)));
    const known=eligible.filter(w=>w.role==='known').sort((a,b)=>(b.rate||0)-(a.rate||0)||String(a.id).localeCompare(String(b.id)));
    const available={due:due.length,known:known.length};
    if(due.length<dueQuota||known.length<knownQuota)return {reason:'insufficient-pool',available,count,dueQuota,knownQuota,pool:[],selected:[]};
    const pool=[...due.slice(0,16).map((w,rank)=>({...w,rank})),...known.slice(0,8).map((w,rank)=>({...w,rank}))];
    return {count,dueQuota,knownQuota,pool,available,selected:[...pool.filter(w=>w.role==='due').slice(0,dueQuota),...pool.filter(w=>w.role==='known').slice(0,knownQuota)]};
  }
  function place(model,item,r,c,dir,size=11){
    const dr=dir==='V'?1:0,dc=dir==='H'?1:0,len=item.answer.length;
    if(!['H','V'].includes(dir)||!len||r<0||c<0||r+dr*(len-1)>=size||c+dc*(len-1)>=size)return null;
    const occupied=(rr,cc)=>model.cells.has(key(rr,cc));
    if(occupied(r-dr,c-dc)||occupied(r+dr*len,c+dc*len))return null;
    let crossings=0;
    for(let i=0;i<len;i++){
      const rr=r+dr*i,cc=c+dc*i,cell=model.cells.get(key(rr,cc));
      if(cell){if(cell.letter!==item.answer[i]||cell.directions.includes(dir))return null;crossings++;}
      else if(dir==='H'?(occupied(rr-1,cc)||occupied(rr+1,cc)):(occupied(rr,cc-1)||occupied(rr,cc+1)))return null;
    }
    if(model.entries.length&&!crossings)return null;
    const cells=new Map(model.cells);
    for(let i=0;i<len;i++){
      const k=key(r+dr*i,c+dc*i),old=cells.get(k);
      cells.set(k,{letter:item.answer[i],directions:[...(old?.directions||[]),dir]});
    }
    const coords=[...cells.keys()].map(k=>k.split(':').map(Number));
    const rows=coords.map(x=>x[0]),cols=coords.map(x=>x[1]);
    const area=(Math.max(...rows)-Math.min(...rows)+1)*(Math.max(...cols)-Math.min(...cols)+1);
    return {cells,entries:[...model.entries,{...item,r,c,dir}],area,score:model.score+40-(item.rank||0)*1.5+crossings*5-(area-(model.area||0))*.2};
  }
  function finish(model){
    const coords=[...model.cells.keys()].map(k=>k.split(':').map(Number));
    const minR=Math.min(...coords.map(x=>x[0])),minC=Math.min(...coords.map(x=>x[1]));
    const rows=Math.max(...coords.map(x=>x[0]))-minR+1,cols=Math.max(...coords.map(x=>x[1]))-minC+1;
    const entries=model.entries.map(e=>({...e,r:e.r-minR,c:e.c-minC,keys:[...e.answer].map((_,i)=>key(e.r-minR+(e.dir==='V'?i:0),e.c-minC+(e.dir==='H'?i:0)))}));
    const starts=[...new Set(entries.map(e=>key(e.r,e.c)))].sort((a,b)=>{const [ar,ac]=a.split(':').map(Number),[br,bc]=b.split(':').map(Number);return ar-br||ac-bc;});
    const numbers=new Map(starts.map((k,i)=>[k,i+1]));
    const cells=Array.from({length:rows},()=>Array(cols).fill(null));
    for(const e of entries){
      e.number=numbers.get(key(e.r,e.c));
      e.keys.forEach((k,i)=>{const [r,c]=k.split(':').map(Number);if(!cells[r][c])cells[r][c]={letter:e.answer[i],ids:[],number:numbers.get(k)||null};cells[r][c].ids.push(e.id);});
    }
    return {rows,cols,entries,cells};
  }
  function search(selection,size,width,budget){
    const empty={cells:new Map(),entries:[],score:0,area:0};let beam=[];
    const attempt=(...args)=>{if(budget.remaining<=0)return null;budget.remaining--;return place(...args);};
    for(const item of selection.pool.filter(w=>w.role==='due').slice(0,6))for(const dir of ['H','V']){
      const start=Math.floor((size-item.answer.length)/2),middle=Math.floor(size/2);
      const p=attempt(empty,item,dir==='H'?middle:start,dir==='H'?start:middle,dir,size);if(p)beam.push(p);
    }
    for(let depth=1;depth<selection.count;depth++){
      const next=new Map();
      for(const model of beam){
        const used=new Set(model.entries.map(e=>e.id));const due=model.entries.filter(e=>e.role==='due').length,known=model.entries.length-due;
        for(const item of selection.pool){
          if(used.has(item.id)||(item.role==='due'?due>=selection.dueQuota:known>=selection.knownQuota))continue;
          const tried=new Set();
          for(const [k,cell]of model.cells){
            const [r,c]=k.split(':').map(Number);
            for(let i=0;i<item.answer.length;i++)if(item.answer[i]===cell.letter)for(const dir of ['H','V']){
              const rr=r-(dir==='V'?i:0),cc=c-(dir==='H'?i:0),sig=key(rr,cc)+dir;
              if(tried.has(sig))continue;tried.add(sig);
              const p=attempt(model,item,rr,cc,dir,size);
              if(p){const signature=JSON.stringify(p.entries.map(e=>[e.id,e.r,e.c,e.dir]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));const old=next.get(signature);if(!old||p.score>old.score)next.set(signature,p);}
              if(budget.remaining<=0)return null;
            }
          }
        }
      }
      beam=[...next.values()].sort((a,b)=>b.score-a.score).slice(0,width);
      if(!beam.length)return null;
    }
    return beam.length?finish(beam.sort((a,b)=>b.score-a.score)[0]):null;
  }
  function createPuzzle(items,options={}){
    const count=Math.max(5,Math.min(8,Number.isFinite(options.count)?Math.round(options.count):7));
    const size=Math.max(5,Math.min(11,Number.isFinite(options.size)?Math.round(options.size):11));
    const width=Math.max(1,Math.min(24,options.beamWidth||16));
    const budget={remaining:Number.isFinite(options.maxAttempts)?Math.max(0,Math.min(60000,options.maxAttempts)):40000};
    let last=null,hadPool=false;
    for(let n=count;n>=5;n--){
      last=selectCandidates(items,n,size,options.now||Date.now());if(last.reason)continue;hadPool=true;
      const puzzle=search(last,size,width,budget);
      if(puzzle)return {puzzle,reason:null,attempts:(options.maxAttempts??40000)-budget.remaining};
      if(budget.remaining<=0)return {puzzle:null,reason:'search-limit',available:last.available};
    }
    return {puzzle:null,reason:hadPool?'no-intersections':'insufficient-pool',available:last?.available||{due:0,known:0}};
  }
  const newGame=()=>({values:{},results:{}});
  const lockedKeys=(game,puzzle)=>new Set(puzzle.entries.filter(e=>game.results[e.id]?.done).flatMap(e=>e.keys));
  function input(game,puzzle,id,k,text,paste=false){
    const entry=puzzle.entries.find(e=>e.id===id),locked=lockedKeys(game,puzzle);
    if(!entry||!entry.keys.includes(k)||locked.has(k))return {game,focus:null};
    // Native inputs can contain the old letter followed by a new grapheme.
    // Normalize the last grapheme only after extraction: œ must expand to OE.
    const graphemes=String(text||'').normalize('NFC').match(/\P{M}\p{M}*/gu)||[];
    const chars=letters(paste?text:graphemes.at(-1)||''),index=entry.keys.indexOf(k);
    const values={...game.values},results={...game.results},changed=[];
    if(!chars){values[k]='';changed.push(k);}
    for(let i=0;i<chars.length&&index+i<entry.keys.length;i++){
      const target=entry.keys[index+i];if(locked.has(target))continue;
      values[target]=chars[i];changed.push(target);
    }
    for(const e of puzzle.entries)if(!results[e.id]?.done&&e.keys.some(k=>changed.includes(k))){results[e.id]={...results[e.id],wrong:false};}
    const focus=chars?entry.keys.slice(index+Math.max(1,chars.length)).find(k=>!locked.has(k))||null:null;
    return {game:{values,results},focus};
  }
  function erase(game,puzzle,id,k){
    const entry=puzzle.entries.find(e=>e.id===id),locked=lockedKeys(game,puzzle);
    if(!entry)return {game,focus:null};
    const target=!locked.has(k)&&game.values[k]?k:entry.keys.slice(0,entry.keys.indexOf(k)).reverse().find(k=>!locked.has(k));
    if(!target)return {game,focus:null};
    return {game:input(game,puzzle,id,target,'').game,focus:target};
  }
  function check(game,puzzle,id,reveal=false){
    const entry=puzzle.entries.find(e=>e.id===id),previous=game.results[id]||{};
    if(!entry||previous.done)return {game,evaluation:null,message:'Ce mot est déjà terminé.'};
    const typed=entry.keys.map(k=>game.values[k]||'').join('');
    if(!reveal&&typed.length!==entry.answer.length)return {game,evaluation:null,message:'Complète le mot avant de le vérifier.'};
    const correct=typed===entry.answer,locked=lockedKeys(game,puzzle);
    const supplied=correct&&entry.keys.every(k=>locked.has(k));
    const evaluation=entry.role==='due'&&!previous.evaluated&&!supplied?{id:entry.id,role:entry.role,rating:reveal||!correct?'again':'good',mode:'context'}:null;
    const values={...game.values};if(reveal)entry.keys.forEach((k,i)=>values[k]=entry.answer[i]);
    const result={...previous,done:reveal||correct,wrong:!reveal&&!correct,helped:reveal,supplied,evaluated:previous.evaluated||!!evaluation};
    const message=supplied?'Mot complété grâce aux intersections.':reveal?`Réponse : ${entry.term}. À revoir.`:correct?'Correct ! Passe au mot suivant.':'À revoir : vérifie les lettres et les intersections.';
    return {game:{values,results:{...game.results,[id]:result}},evaluation,message};
  }
  return {letters,key,selectCandidates,place,createPuzzle,newGame,lockedKeys,input,erase,check};
});
