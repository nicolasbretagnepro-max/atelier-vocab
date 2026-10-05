// Reproduce the initial editorial selection from the checked source snapshot.
// Do not extend the labels below without checking meaning and distinct choices.
const fs=require('node:fs');const {api}=require('./audit-vocab.cjs');
const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const words=api.buildWords(raw);
const labels=["Se rebiffer","Se rengorger","À l'aune de","À l'orée","A posteriori","A priori","Abduction","Abîme","Abjurer","Abnégation","Aboulie","Abraser","Abscons","Absoudre","Absous","Abyssal","Abysses","Acerbe","Achalandé","Aconit","Acrimonie","Ad hoc","Ad ignorantiam","Ad misericordiam","Ad populum","Ad verecundiam","Ad vitam aeternam","Adage","Adamantin","Adipeux","Adjuger","Adjuvant","Biosphère","Anachorète","Atavisme"];
const anchors=['Biosphère','Anachorète','Atavisme','Aboulie'];
const entries=labels.map(label=>{
 const w=words.find(w=>w.word===label);if(!w)throw new Error('Missing reviewed word: '+label);
 const distractors=anchors.filter(label=>label!==w.word).map(label=>{const d=words.find(w=>w.word===label);if(!d)throw new Error('Missing anchor: '+label);return {word:d.word,definition:d.compact};}).slice(0,3);
 return {word:w.word,kind:w.kind,qcm_definition:w.compact,qcm_full_definition:w.definition,qcm_distractors:distractors,qcm_context_distractors:[]};
});
fs.writeFileSync('data/qcm-reviewed.json',JSON.stringify({version:1,reviewedAt:'2026-10-05',note:'35 définitions contrôlées. Choix volontairement éloignés : biosphère, vie érémitique, héritage ancestral, trouble de la volonté. Validation limitée à ces paires et à ces définitions exactes. Aucun QCM contextuel validé dans ce lot.',entries},null,2)+'\n');
