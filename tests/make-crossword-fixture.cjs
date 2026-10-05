// Local verification profile; never served by the production entry point.
const fs=require('node:fs');
const raw=[
 ['Abnégation','Renoncement à ses intérêts personnels au profit des autres.'],
 ['Aboulie','Difficulté à prendre une décision ou à passer à l’action.'],
 ['Anaphore','Répétition d’un même élément au début de phrases successives.'],
 ['Anachorète','Personne vivant seule et retirée pour se consacrer à la prière.'],
 ['Atavisme','Réapparition de caractères hérités de lointains ancêtres.'],
 ['Biosphère','Ensemble des milieux où la vie existe sur la Terre.'],
 ['Abduction','Raisonnement proposant une hypothèse pour expliquer un fait.'],
 ['Acrimonie','Aigreur et hostilité dans les paroles ou le comportement.'],
 ['Adage','Formule ancienne exprimant un conseil ou une vérité générale.'],
 ['Acerbe','Qui exprime une critique mordante et sévère.'],
 ['Absolu','Qui ne dépend de rien et ne comporte aucune limite.'],
 ['Adjuvant','Élément qui renforce l’action d’un autre.'],
].map(([word,definition])=>({word,definition,definition_courte:definition}));
const seed=`
const verificationRaw=${JSON.stringify(raw)};
saveCustomWords(verificationRaw); saveCustomFigures([]);
const verificationWords=buildWords(verificationRaw);
const verificationState={progress:{},meta:{}};
if(!new URLSearchParams(location.search).has('empty'))verificationWords.forEach((w,i)=>{
 verificationState.progress[w.id]=i<8?{...EMPTY_PROGRESS,seen:4,correct:1,wrong:3,next:'2020-01-01'}:
 {...EMPTY_PROGRESS,seen:12,correct:12,mastery:6,prod:4,recall:6,recallStreak:3,streak:6,next:new Date(Date.now()+86400000*30).toISOString(),correctDays:{'2026-09-01':1,'2026-09-12':1,'2026-09-24':1,'2026-10-02':1},recallDays:{'2026-09-12':1,'2026-09-24':1,'2026-10-02':1},firstCorrectDay:'2026-09-01',lastCorrectDay:'2026-10-02'};
});
saveProgress(verificationState);
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);`;
let html=fs.readFileSync('index.html','utf8');
html=html.replace(/const VOCAB_URL = [^;]+;/,'const VOCAB_URL = "";').replace(/const FIGURES_URL = [^;]+;/,'const FIGURES_URL = "";');
html=html.replace("navigator.serviceWorker.register('./sw.js')","Promise.resolve({scope:'disabled in verification fixture'})");
html=html.replace('ReactDOM.createRoot(document.getElementById("root")).render(<App/>);',seed);
fs.writeFileSync('crossword-fixture.html',html);
console.log('Local fixture: /crossword-fixture.html (or ?empty for a new profile)');
