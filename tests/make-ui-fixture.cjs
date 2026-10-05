const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const harness=`function VerificationHarness() {
  const scenario=new URLSearchParams(location.search).get('scenario')||'errors';
  const words=useMemo(()=>scenario==='empty'?[]:scenario==='tiny'?buildWords(SEED_WORDS).slice(0,1):scenario==='formats'?buildWords(SEED_WORDS).filter(w=>['Anaphore','Abnégation','Aboulie','Biosphère','Anachorète','Atavisme'].includes(w.word)):buildWords(SEED_WORDS).slice(0,5),[]);
  const [state,setState]=useState(()=>({progress:scenario==='tiny'||scenario==='empty'?{}:Object.fromEntries(words.map((w,i)=>[w.id,{...EMPTY_PROGRESS,seen:scenario==='formats'&&i===words.length-1?0:1,repetitions:scenario==='formats'?(i%3):1,next:addDays(-1)}])),meta:{}}));
  return <div style={{padding:18,maxWidth:650,margin:'auto'}}>
    <ShortSession words={words} state={state} setState={setState} onBack={()=>{}}/>
    <DailyGoal meta={state.meta}/>
    <p>Erreurs enregistrées : {Object.values(state.progress).reduce((n,p)=>n+(p.wrong||0),0)}</p>
  </div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<VerificationHarness/>);`;
fs.writeFileSync('tests/ui-fixture.html',html.replace('ReactDOM.createRoot(document.getElementById("root")).render(<App/>);',harness));
