'use strict';
importScripts('./crossword-engine.js?v=14');
self.onmessage=event=>{
  const {id,items,options}=event.data||{};
  try{self.postMessage({id,result:AtelierCrossword.createPuzzle(Array.isArray(items)?items:[],options||{})});}
  catch{self.postMessage({id,result:{puzzle:null,reason:'worker-error'}});}
};
