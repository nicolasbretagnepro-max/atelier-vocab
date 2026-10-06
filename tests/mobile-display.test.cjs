const {test}=require('node:test');
const assert=require('node:assert/strict');
const app=require('./app-helper.cjs');

test('progress meters expose a bounded value and a matching visual fill, including an empty session',()=>{
  const a=app();
  for(const [value,max,expected,width] of [[0,2,0,'0%'],[1,2,1,'50%'],[8,2,2,'100%'],[-1,2,0,'0%'],[0,0,0,'0%']]){
    const tree=a.render(`ProgressMeter({value:${value},max:${max},label:'Avancement'})`);
    assert.equal(tree.props.role,'progressbar');
    assert.equal(tree.props['aria-valuenow'],expected);
    assert.equal(tree.props['aria-valuemax'],Math.max(1,max));
    assert.equal(tree.props.children[0].props.style.width,width);
  }
});

test('statistics do not display a streak that expired after a missed day',()=>{
  const a=app();
  const tree=a.render("StatsTab({words:[],state:{progress:{},meta:{streak:7,lastDay:'2026-10-01'}}})");
  function find(node){
    if(!node||typeof node!=='object')return;
    if(node.props?.label==='Série')return node;
    for(const child of [node.props?.children||[]].flat(9)){const result=find(child);if(result)return result;}
  }
  assert.equal(find(tree).props.value,'0j');
});
