/* global Promise, describe, it, __dirname, process*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyExtension, ProxyTracker} = require(`../proxy-tracker.js`);

const t = {};
Object.freeze(t);

describe('ProxyExtension', () => {
  const value_modified_by_trap_cb1 = 8;
  const value_modified_by_trap_cb2 = 5;
  const value_modified_by_trap_cb3 = function(){return 'this value will modified';};
  function cb1(...args){bridge.push('cb1 called'); return value_modified_by_trap_cb1;}
  function cb2(...args){bridge.push('cb2 called'); return value_modified_by_trap_cb2;}
  function cb3(t,p,r){bridge.push('cb3 called'); if(p === 'statmet2')  return value_modified_by_trap_cb3; else return Reflect.get(t,p,r);}
  
  function cbs(bridge){this.cb1 = cb1, this.cb2 = cb2; return this;}
  let classe;
  let bridge;
  beforeEach(()=>{
    classe = class{
      constructor(arg){this.argomenti = arg; this.constr = 5;}
      met1(){this.uno = 1; return 'called';}
      met2(arg){this.due = arg; return 'called';}
      static statprop = 1;
      static statmet(){return 1;}
      static statmet2(){return {}}
    };
    bridge = [];
  });
  it('creazione proxy con handler {vuoto} -> no errore', () => {
    expect(()=>{new ProxyExtension(classe, {});}).to.not.throw();
    let proxy = new ProxyExtension(classe, {});
    expect(()=>{new proxy();}).to.not.throw();
  });
  it('Proxy created with handler that have one callback return the returned value of callback', () => {
    const handler = {get: cb1};
    const proxy = new ProxyExtension(classe, handler);
    let value =  proxy.statprop;
    expect(value).to.equal(value_modified_by_trap_cb1);
    expect(bridge).to.eql(['cb1 called']);
  });
  it('Proxy created with handler that have two callbacks return the returned value of second callback and performes the first callaback', () => {
    const handler = {get: [cb1, cb2]};
    const proxy = new ProxyExtension(classe, handler);
    let value =  proxy.statprop;
    expect(value).to.equal(value_modified_by_trap_cb2);
    expect(bridge).to.eql(['cb2 called', 'cb1 called']);
  });
  it('proxy created with handler that have more subhandler, the last callback return a proxy if the value is proxable', () => {
    const handler = {get: [cb3, {apply: cb2}]};
    const proxy = new ProxyExtension(classe, handler);
    let value = proxy.statmet2();
    expect(value).to.equal(value_modified_by_trap_cb2);
    expect(bridge).to.eql(['cb3 called', 'cb2 called']);
  });
  it('proxy created with handler that have more subhandler, the last callback return a value and not proxy if the value is not proxable', () => {
    const handler = {get: [cb3, {apply: cb2}]};
    const proxy = new ProxyExtension(classe, handler);
    let value = proxy.statprop;
    expect(util.types.isProxy(value)).to.be.false;
    expect(value).to.equal(classe.statprop);
    expect(bridge).to.eql(['cb3 called']);
  });
  
});