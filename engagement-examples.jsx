// Optional proposals: paste the desired functions into index.html's text/babel
// script. They reuse existing helpers and React. Separate from bug corrections.

// QUICK WIN: count effort (distinct words), even after a wrong response.
// Integration in gradeWord, just before saveProgress(ns):
// ns.meta = recordDailyPractice(ns.meta, id);
function recordDailyPractice(meta, id, now = new Date()) {
  const today = localDateKey(now);
  const practiceDays = { ...(meta.practiceDays || {}) };
  const previous = Array.isArray(practiceDays[today]) ? practiceDays[today] : [];
  practiceDays[today] = [...new Set([...previous, id])];
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate()-30);
  for (const day of Object.keys(practiceDays)) if(day < localDateKey(cutoff)) delete practiceDays[day];
  return { ...meta, practiceDays };
}
function DailyGoal({meta, goal=5}) {
  const count = (meta.practiceDays?.[localDateKey()] || []).length;
  const completed = Math.min(count,goal);
  return <section aria-label="Objectif quotidien">
    <p>{completed}/{goal} mots travaillés aujourd'hui</p>
    <progress max={goal} value={completed} style={{width:'100%'}} aria-label="Mots travaillés"/>
    <p>{count >= goal ? 'Objectif atteint : bravo pour ta régularité !' : 'Quelques mots suffisent pour avancer.'}</p>
  </section>;
}

// QUICK WIN: display zero after a missed day, without erasing historic data.
// Replace state.meta.streak in the header with visibleDailyStreak(state.meta).
function visibleDailyStreak(meta, now = new Date()) {
  if(!meta.lastDay) return 0;
  const last = new Date(meta.lastDay);
  if(Number.isNaN(last.getTime())) return 0;
  const gap = dayDiff(localDateKey(last),localDateKey(now));
  return gap <= 1 ? meta.streak || 0 : 0;
}

// QUICK WIN: add curated context and an optional personal mnemonic.
// In a wrong-answer branch: <LearningFeedback word={word} chosen={selectedWord}/>
function LearningFeedback({word, chosen=null}) {
  const difference = chosen && normalizeConfusions(word.confusions)
    .find(item => norm(item.word) === norm(chosen.word))?.difference;
  return <aside aria-live="polite" style={{padding:16,background:'#F2F2F7',borderRadius:14}}>
    <p><strong>{word.word}</strong> — {word.compact}</p>
    {difference && <p>{difference}</p>}
    {word.hasRealExample && <ExampleBlock word={word}/>}
    {word.memoryTip && <p>Astuce : {word.memoryTip}</p>}
    {word.etymology && <p>Origine : {word.etymology}</p>}
  </aside>;
}

// MEDIUM: 5 words maximum, due first, at most 2 new.
// Freeze this queue on Start using useState; do not regenerate after each answer.
function buildShortSession(state, words) {
  const due = candidates(state,words,'due',5);
  const newCount = Math.min(2,5-due.length);
  return [...due,...candidates(state,words,'new',newCount)];
}

// MEDIUM: choose ONE format per scheduled word, varying over subsequent days.
// Feed the rating back into the same gradeWord / scheduleReview entry.
function chooseLearningFormat(word, progress, words) {
  if(progress.relearning || !progress.seen) return 'flashcard';
  if(progress.repetitions >= 2 && validClozePrompt(word)) return 'cloze';
  if(progress.repetitions >= 1) return 'typing';
  if(smartDistractors(word,words).length >= 2) return 'qcm';
  return 'typing';
}
function validClozePrompt(word) {
  const prompt = getReviewExamplePrompt(word);
  return word.hasRealExample && prompt && /________|\[…\]/.test(prompt) && !textContainsAnswer(prompt,word)
    ? prompt : null;
}

// HEAVIER: editorial workflow, not a browser call to an AI with a secret key.
// Generate draft examples / distractors server-side, store their reviewed
// qcm_definition + qcm_distractors + qcm_context_distractors, then publish JSON.
// Context approvals bind both the displayed prompt and candidate definition.

// Optional server-side pre-screening of embedding vectors, before editorial QA.
// The threshold needs calibration on YOUR French definitions. It does not
// establish that a distractor is false, nor that a cloze has a unique answer.
function cosineSimilarity(a,b) {
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length||!a.length) throw new Error('Invalid embeddings');
  let dot=0,aa=0,bb=0;
  for(let i=0;i<a.length;i++) {
    if(!Number.isFinite(a[i])||!Number.isFinite(b[i])) throw new Error('Invalid embedding value');
    dot+=a[i]*b[i]; aa+=a[i]*a[i]; bb+=b[i]*b[i];
  }
  if(!aa||!bb) throw new Error('Empty embedding norm');
  return dot/Math.sqrt(aa*bb);
}
function preScreenDistractorVectors(answer,candidates,threshold=0.75) {
  const selected=[];
  for(const candidate of candidates) {
    if(candidate.id===answer.id) continue;
    if(cosineSimilarity(answer.embedding,candidate.embedding)>=threshold) continue;
    if(selected.some(other=>cosineSimilarity(other.embedding,candidate.embedding)>=threshold)) continue;
    selected.push(candidate);
    if(selected.length===3) break;
  }
  return selected; // Drafts only: publish through the reviewed-pair schema.
}
