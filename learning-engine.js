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
    if(Object.keys(learning.meaningDays).length>=2&&Object.keys(learning.independentDays).length>=2)
      learning.phase='consolidated';
    return learning;
  }
  function level(progress={},day){
    const l=normalize(progress,day);
    if(l.phase==='consolidated')return 3;
    // Today's repeats cannot remove help intended for tomorrow's learning.
    const before=map=>Object.keys(map).filter(d=>d<day&&(!l.lastFailureDay||d>l.lastFailureDay)).length;
    const meaning=before(l.meaningDays);
    if(meaning>=2)return 3;
    if(meaning>=1)return 2;
    return 1;
  }
  function selectDaily(words,state={},options={},day,now){
    const progress=state.progress||{},p=w=>progress[w.id]||{};
    const list=[...new Map((words||[]).filter(w=>w&&w.id).map(w=>[w.id,w])).values()];
    const active=list.filter(w=>p(w).seen&&normalize(p(w),day).phase==='active').sort((a,b)=>{
      const al=normalize(p(a),day),bl=normalize(p(b),day);
      return String(al.lastSeenDay||'').localeCompare(String(bl.lastSeenDay||''))||String(a.id).localeCompare(String(b.id));
    });
    const newPerDay=Math.max(1,Math.min(3,Math.round(Number(options.newPerDay)||2)));
    const hash=w=>[...`${day}:${w.id}`].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,0);
    const introducedToday=list.filter(w=>p(w).seen&&normalize(p(w),day).startedDay===day).length;
    const discover=list.filter(w=>!p(w).seen).sort((a,b)=>hash(a)-hash(b)).slice(0,Math.max(0,newPerDay-introducedToday));
    const due=list.filter(w=>p(w).seen&&normalize(p(w),day).phase==='consolidated'&&(!Number.isFinite(Date.parse(p(w).next))||Date.parse(p(w).next)<=now))
      .sort((a,b)=>(Date.parse(p(a).next)||0)-(Date.parse(p(b).next)||0)).slice(0,3);
    const capacity=Math.max(0,10-discover.length-due.length);
    return {discover,active:active.slice(0,capacity),due,waiting:Math.max(0,active.length-capacity),newLimit:newPerDay};
  }
  return {normalize,record,level,selectDaily};
});
