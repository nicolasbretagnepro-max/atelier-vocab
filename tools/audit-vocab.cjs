const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').split('<script type="text/babel">')[1].split('const MILESTONES =')[0];
const stableMath=Object.create(Math);stableMath.random=()=>0.5;
const ctx=vm.createContext({React:{},Date,Math:stableMath,console,localStorage:{getItem:()=>null,setItem:()=>{}}});
vm.runInContext(source,ctx);
const api=vm.runInContext('({buildWords,getQcmReviewRecord,smartDistractors,norm,validClozePrompt,isAmbiguousDistractor,getReviewExamplePrompt,textContainsAnswer})',ctx);
function audit(raw,review,kind='vocab') {
 const words=api.buildWords(raw,kind,review), duplicates=new Map();
 for(const w of words){const key=api.norm(w.compact||w.definition);if(!key)continue;duplicates.set(key,[...(duplicates.get(key)||[]),w.word]);}
 const staleReviews=[];
 for(const r of review?.entries||[]){
  if((r.kind||'vocab')!==kind)continue;
  const w=words.find(w=>api.norm(w.word)===api.norm(r.word));
  if(!w||!api.getQcmReviewRecord(w,review)){staleReviews.push({word:r.word,reason:'answer changed or missing'});continue;}
  for(const d of [...(r.qcm_distractors||[]),...(r.qcm_context_distractors||[])]){
   const candidate=words.find(w=>api.norm(w.word)===api.norm(d.word));
   if(!candidate||candidate.compact!==d.definition||('prompt' in d&&d.prompt!==api.getReviewExamplePrompt(w)))staleReviews.push({word:r.word,candidate:d.word,reason:'candidate or prompt changed'});
  }
 }
 const ready=words.filter(w=>api.smartDistractors(w,words,3).length>=2).map(w=>w.word);
 return {total:words.length,qcmReady:ready.length,qcmReadyWords:ready,staleReviews,duplicateDefinitions:[...duplicates.values()].filter(g=>g.length>1),missingExamples:words.filter(w=>!w.hasRealExample).map(w=>w.word),leakingPrompts:words.filter(w=>w.hasRealExample&&api.textContainsAnswer(api.getReviewExamplePrompt(w),w)).map(w=>w.word)};
}
module.exports={audit,api};
if(require.main===module){
 if(!process.argv[2]){console.error('Usage: node tools/audit-vocab.cjs corpus.json [review-data.json] [vocab|figure]');process.exitCode=1;}
 else {const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const review=JSON.parse(fs.readFileSync(process.argv[3]||path.join(__dirname,'../data/qcm-reviewed.json'),'utf8'));console.log(JSON.stringify(audit(raw,review,process.argv[4]||'vocab'),null,2));}
}
