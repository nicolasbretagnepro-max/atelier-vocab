const fs = require('node:fs');
const vm = require('node:vm');
const Babel = require('./babel.min.cjs');
const source = fs.readFileSync('index.html','utf8').split('<script type="text/babel">')[1].split('</script>')[0];
const code = Babel.transform(source,{presets:['react']}).code;
module.exports = function app(start='2026-10-05T10:00:00Z') {
  let clock = Date.parse(start);
  const storage=new Map();
  class Clock extends Date {constructor(...args){super(...(args.length?args:[clock]));} static now(){return clock;}}
  let cursor=0;const slots=[];const timers=[];
  const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),
    useState:init=>{const i=cursor++;if(!(i in slots))slots[i]=typeof init==='function'?init():init;return [slots[i],v=>slots[i]=typeof v==='function'?v(slots[i]):v];},
    useRef:init=>{const i=cursor++;if(!(i in slots))slots[i]={current:init};return slots[i];},
    useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:()=>{}};
  const context=vm.createContext({AtelierCrossword:require('../crossword-engine.js'),window:{innerWidth:393,innerHeight:852},React,ReactDOM:{createRoot:()=>({render:()=>{}})},navigator:{},setTimeout:fn=>timers.push(fn),clearTimeout:()=>{},document:{getElementById:()=>({})},Date:Clock,console,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  vm.runInContext(Babel.transform(fs.readFileSync('crossword-ui.jsx','utf8'),{presets:['react']}).code,context);
  vm.runInContext(code,context);
  return {run:s=>vm.runInContext(s,context),render:s=>{cursor=0;return vm.runInContext(s,context);},timers,slots,advance:ms=>clock+=ms,storage};
};
