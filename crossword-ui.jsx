/* React component loaded before the main application. No profile writes here. */
function CrosswordGame({puzzle,open=true,onEvaluate,onClose,onNewGame}) {
  const cw=AtelierCrossword;
  const [game,setGame]=React.useState(cw.newGame);
  const [preparing,setPreparing]=React.useState(()=>puzzle.entries.some(e=>e.unseen));
  const gameRef=React.useRef(game);
  const [activeId,setActiveId]=React.useState(puzzle.entries[0].id);
  const activeRef=React.useRef(activeId);
  const [message,setMessage]=React.useState("");
  const [viewport,setViewport]=React.useState(()=>({width:window.innerWidth,height:window.visualViewport?.height||window.innerHeight,top:window.visualViewport?.offsetTop||0}));
  const inputs=React.useRef({});
  const focused=React.useRef(null);
  const composing=React.useRef(false);
  const callback=React.useRef(onEvaluate);callback.current=onEvaluate;
  const closeRef=React.useRef(null);
  const panelRef=React.useRef(null);
  const evaluationRef=React.useRef(new Set());

  React.useEffect(()=>{
    if(!open)return;
    const previousFocus=document.activeElement;
    const read=()=>setViewport({width:window.innerWidth,height:window.visualViewport?.height||window.innerHeight,top:window.visualViewport?.offsetTop||0});
    const vv=window.visualViewport;
    read();window.addEventListener("resize",read);vv?.addEventListener("resize",read);vv?.addEventListener("scroll",read);
    const overflow=document.body.style.overflow;document.body.style.overflow="hidden";
    closeRef.current?.focus({preventScroll:true});
    return ()=>{window.removeEventListener("resize",read);vv?.removeEventListener("resize",read);vv?.removeEventListener("scroll",read);document.body.style.overflow=overflow;previousFocus?.focus?.({preventScroll:true});};
  },[open]);

  // iOS opens its keyboard after focus. Keep the focused cell inside the
  // board's own scroll area once the visual viewport has shrunk.
  React.useEffect(()=>{
    if(!open)return;
    const el=inputs.current[focused.current];
    if(el&&document.activeElement===el)el.scrollIntoView({block:"nearest",inline:"nearest"});
  },[open,viewport.height,viewport.width]);

  const active=puzzle.entries.find(e=>e.id===activeId);
  const activeKeys=new Set(active.keys);
  const locked=cw.lockedKeys(game,puzzle);
  const finished=puzzle.entries.filter(e=>game.results[e.id]?.done).length;
  const complete=finished===puzzle.entries.length;
  const cellSize=Math.max(Math.min(28,(viewport.width-26)/puzzle.cols),Math.min(38,(viewport.width-26)/puzzle.cols,(viewport.height-250)/puzzle.rows));

  function commit(next){gameRef.current=next;setGame(next);}
  function activate(id){activeRef.current=id;setActiveId(id);setMessage("");}
  function focus(k){const el=inputs.current[k];if(!el)return;el.focus({preventScroll:true});el.select();el.scrollIntoView({block:"nearest",inline:"nearest"});}
  function pick(k,ids){const current=activeRef.current;const id=focused.current===k&&ids.length>1?ids[(ids.indexOf(current)+1)%ids.length]:ids.includes(current)?current:ids[0];activate(id);focus(k);}
  function type(k,text,paste=false){const result=cw.input(gameRef.current,puzzle,activeRef.current,k,text,paste);commit(result.game);setMessage("");if(result.focus)focus(result.focus);}
  function verify(reveal=false){
    const result=cw.check(gameRef.current,puzzle,activeRef.current,reveal);
    commit(result.game);setMessage(result.message);
    if(result.evaluation&&!evaluationRef.current.has(result.evaluation.id)){
      evaluationRef.current.add(result.evaluation.id);callback.current?.(result.evaluation);
    }
  }
  function nextWord(){
    const index=puzzle.entries.findIndex(e=>e.id===activeRef.current);
    const rotated=[...puzzle.entries.slice(index+1),...puzzle.entries.slice(0,index+1)];
    const next=rotated.find(e=>!gameRef.current.results[e.id]?.done);if(!next)return;
    activate(next.id);const locks=cw.lockedKeys(gameRef.current,puzzle);const k=next.keys.find(k=>!locks.has(k))||next.keys[0];focus(k);
  }
  function trap(event){
    if(event.key==="Escape"){event.preventDefault();onClose();return;}
    if(event.key!=="Tab")return;
    const controls=[...panelRef.current.querySelectorAll('button:not(:disabled),input')];
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
  if(!open)return null;
  if(preparing)return <section ref={panelRef} className="cw-screen" role="dialog" aria-modal="true" aria-labelledby="cw-title" onKeyDown={trap} style={{top:viewport.top,height:viewport.height}}>
    <header className="cw-header"><div><h2 id="cw-title">Grille découverte</h2><p>{puzzle.entries.length} mots · prends d’abord connaissance de leur sens</p></div><button ref={closeRef} onClick={onClose}>Fermer</button></header>
    <div className="cw-board-scroll" style={{display:"block",padding:16}}>{puzzle.entries.map(e=><article key={e.id} style={{padding:16,borderRadius:14,background:"#fff",marginBottom:12}}><h3 style={{fontSize:22,margin:"0 0 8px"}}>{e.term}</h3><p style={{fontSize:17,lineHeight:1.6}}>{e.definition||e.clue}</p>{e.example&&<p style={{fontSize:16,lineHeight:1.6,fontStyle:"italic"}}>{e.example}</p>}</article>)}</div>
    <article className="cw-clue"><p>Ces mots sont nouveaux : le jeu t’aide à les découvrir et ne les compte pas comme maîtrisés.</p></article>
    <footer className="cw-actions cw-discovery-actions"><button onClick={()=>setPreparing(false)}>Commencer la grille</button></footer>
  </section>;
  return <section ref={panelRef} className="cw-screen" role="dialog" aria-modal="true" aria-labelledby="cw-title" onKeyDown={trap} style={{top:viewport.top,height:viewport.height,"--cw-cell":`${cellSize}px`}}>
    <header className="cw-header"><div><h2 id="cw-title">{puzzle.discovery?"Grille découverte":"Mots croisés"}</h2><p>{finished}/{puzzle.entries.length} mots · {puzzle.entries.filter(e=>e.role==="due").length} à revoir · aides disponibles</p></div><button ref={closeRef} onClick={onClose}>{complete?"Terminer":"Fermer"}</button></header>
    <div className="cw-board-scroll"><div className="cw-board" aria-label="Grille de mots croisés" style={{gridTemplateColumns:`repeat(${puzzle.cols},var(--cw-cell))`}}>
      {puzzle.cells.flatMap((row,r)=>row.map((cell,c)=>{
        const k=cw.key(r,c);if(!cell)return <div key={k} className="cw-block" aria-hidden="true"/>;
        const selected=activeKeys.has(k),wrong=selected&&game.results[activeId]?.wrong;
        return <div key={k} className={["cw-cell",selected?"is-active":"",locked.has(k)?"is-done":"",wrong?"is-wrong":""].join(" ")}>
          {cell.number&&<span className="cw-number" aria-hidden="true">{cell.number}</span>}
          <input ref={el=>{if(el)inputs.current[k]=el;else delete inputs.current[k];}} value={game.values[k]||""} readOnly={locked.has(k)}
            aria-label={`Ligne ${r+1}, colonne ${c+1}`} aria-describedby="cw-clue" inputMode="text" autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false}
            onPointerDown={e=>{e.preventDefault();pick(k,cell.ids);}}
            onFocus={e=>{focused.current=k;if(!cell.ids.includes(activeRef.current))activate(cell.ids[0]);e.currentTarget.select();}}
            onChange={e=>{if(!composing.current&&!e.nativeEvent.isComposing)type(k,e.target.value);}}
            onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={e=>{composing.current=false;type(k,e.currentTarget.value);}}
            onPaste={e=>{e.preventDefault();type(k,e.clipboardData.getData("text"),true);}}
            onKeyDown={e=>{
              if(e.key==="Backspace"){e.preventDefault();const result=cw.erase(gameRef.current,puzzle,activeRef.current,k);commit(result.game);setMessage("");if(result.focus)focus(result.focus);}
              if(e.key==="Enter"){e.preventDefault();verify();}
              if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();const entry=puzzle.entries.find(x=>x.id===activeRef.current);const i=entry.keys.indexOf(k);if(entry.keys[i+1])focus(entry.keys[i+1]);}
              if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();const entry=puzzle.entries.find(x=>x.id===activeRef.current);const i=entry.keys.indexOf(k);if(entry.keys[i-1])focus(entry.keys[i-1]);}
            }}/>
        </div>;
      }))}
    </div></div>
    <article className="cw-clue" id="cw-clue"><div className="cw-clue-meta">{active.number}. {active.dir==="H"?"Horizontal":"Vertical"} · {active.answer.length} lettres{game.results[activeId]?.helped?" · Révélé":""}</div><p>{active.clue}</p>
      <div className="cw-message" role="status">{message||(complete?puzzle.discovery?"Grille découverte terminée. Tu peux poursuivre dans la routine.":"Grille terminée. Les révisions évaluées ont été enregistrées.":"Sans accents, espaces ni traits d’union.")}</div>
    </article>
    <footer className="cw-actions"><button onClick={complete?onNewGame:()=>verify()} disabled={complete?!onNewGame:game.results[activeId]?.done}>{complete?"Nouvelle grille":"Vérifier"}</button><button onClick={nextWord} disabled={complete}>Mot suivant</button><button onClick={()=>verify(true)} disabled={game.results[activeId]?.done}>Révéler</button></footer>
    <button className="cw-hide-keyboard" onClick={()=>document.activeElement?.blur?.()}>Masquer le clavier</button>
  </section>;
}

function CrosswordLauncher({status,reason,available,onClose,onRetry,onReview}) {
  const panel=React.useRef(null);
  React.useEffect(()=>{const previous=document.activeElement;const overflow=document.body.style.overflow;document.body.style.overflow="hidden";panel.current?.querySelector("button")?.focus({preventScroll:true});return()=>{document.body.style.overflow=overflow;previous?.focus?.({preventScroll:true});};},[]);
  const loading=status==="loading";
  const text=reason==="insufficient-pool"?"Il faut au moins cinq mots distincts de trois à onze lettres avec une définition utilisable. Les mots peuvent être nouveaux ou déjà étudiés.":reason==="no-intersections"?"Ces mots ne forment pas encore une grille compacte avec suffisamment d’intersections.":reason==="search-limit"?"La recherche a atteint sa limite. Une révision classique reste disponible.":"Le jeu n’a pas pu se charger. Réessaie lorsque ses fichiers sont disponibles.";
  return <section className="cw-launcher" ref={panel} role="dialog" aria-modal="true" aria-labelledby="cw-launch-title" onKeyDown={e=>{
    if(e.key==="Escape")onClose();
    if(e.key==="Tab"){const buttons=[...panel.current.querySelectorAll("button")];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  }}><div><button onClick={onClose}>Retour à l’accueil</button><h2 id="cw-launch-title">{loading?"Préparation de la grille…":"Pas de grille disponible"}</h2>
    <p role="status">{loading?"Nous cherchons une petite grille parmi tes révisions et les mots du corpus.":text}</p>
    {!loading&&available&&<p>{available.due} mots à revoir compatibles · {available.known} mots d’appui compatibles.</p>}
    {!loading&&<div className="cw-launch-actions"><button onClick={onReview}>Faire une révision</button><button onClick={onRetry}>Réessayer</button></div>}
  </div></section>;
}
