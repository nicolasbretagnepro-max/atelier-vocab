const fs = require('node:fs');
const vm = require('node:vm');
const Babel = require('./babel.min.cjs');
const source = fs.readFileSync('index.html','utf8').split('<script type="text/babel">')[1].split('</script>')[0];
const code = Babel.transform(source,{presets:['react']}).code;
module.exports = function app(start='2026-10-05T10:00:00Z') {
  let clock = Date.parse(start);
  const storage=new Map();
  class Clock extends Date {constructor(...args){super(...(args.length?args:[clock]));} static now(){return clock;}}
  const React={createElement:(type,props,...children)=>({type,props:{...props,children}})};
  const context=vm.createContext({React,ReactDOM:{createRoot:()=>({render:()=>{}})},document:{getElementById:()=>({})},Date:Clock,console,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  vm.runInContext(code,context);
  return {run:s=>vm.runInContext(s,context),advance:ms=>clock+=ms,storage};
};
