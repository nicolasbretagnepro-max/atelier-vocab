(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AtelierLearning=api;
})(globalThis,function(){
  'use strict';
  const days=value=>Object.fromEntries(Object.entries(value||{}).filter(([d,n])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number(n)>0).map(([d])=>[d,1]));
  function normalize(progress={},day){
    const raw=progress.learning||{};
    const legacyAdvanced=progress.repetitions>=2||progress.intervalDays>=6||
      (progress.repetitions==null&&progress.intervalDays==null&&!!progress.next);
    const phase=['active','consolidated'].includes(raw.phase)?raw.phase:
      !progress.seen?'new':legacyAdvanced&&!progress.relearning&&!progress.lapsed&&!progress.needsRebuild?'consolidated':'active';
    return {phase,startedDay:raw.startedDay||null,lastSeenDay:raw.lastSeenDay||null,
      meaningDays:days(raw.meaningDays),supportedDays:days(raw.supportedDays),
      independentDays:days(raw.independentDays),contextDays:days(raw.contextDays),
      lastFailureDay:raw.lastFailureDay||null};
  }
  function record(progress,event,day){
    const learning=normalize(progress,day);
    if(learning.phase==='new')learning.phase='active';
    learning.startedDay=learning.startedDay||day;learning.lastSeenDay=day;
    if(event.kind==='discover')return learning;
    if(!event.ok){
      learning.phase='active';learning.lastFailureDay=day;
      // Rebuild independent evidence after an actual lapse, not with old successes.
      learning.independentDays={};
      return learning;
    }
    if(event.kind==='meaning')learning.meaningDays[day]=1;
    if(event.kind==='context'){
      learning.meaningDays[day]=1;learning.contextDays[day]=1;
    }
    if(event.kind==='recall'){
      if(event.assisted)learning.supportedDays[day]=1;
      else if(learning.lastFailureDay!==day)learning.independentDays[day]=1;
    }
    if(Object.keys(learning.meaningDays).length>=2&&Object.keys(learning.contextDays).length>=1&&Object.keys(learning.independentDays).length>=2)
      learning.phase='consolidated';
    return learning;
  }
  function level(progress={},day){
    const l=normalize(progress,day);
    if(l.phase==='consolidated')return 3;
    // Today's repeats cannot remove help intended for tomorrow's learning.
    const before=map=>Object.keys(map).filter(d=>d<day&&(!l.lastFailureDay||d>l.lastFailureDay)).length;
    const meaning=before(l.meaningDays),supported=before(l.supportedDays);
    if(meaning>=2&&supported>=1)return 3;
    if(meaning>=1)return 2;
    return 1;
  }
  return {normalize,record,level};
});
