/* global Promise, describe, it, __dirname, process*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyExtension, ProxyTracker} = require(`../proxy-tracker.js`);

const t = {};
Object.freeze(t);

describe.skip('ProxyExtension', () => {
  let classe;
  beforeEach(()=>{
    classe = class{
      constructor(arg){this.argomenti = arg; this.constr = 5;}
      met1(){this.uno = 1; return 'called'}
      met2(arg){this.due = arg; return 'called'}
    };
  });
  it('creazione proxy con handler {vuoto} -> no errore', () => {
    expect(()=>{new ProxyExtension(classe, {});}).to.not.throw();
    let proxy = new ProxyExtension(classe, {});
    expect(()=>{new proxy();}).to.not.throw();
  });
  it.skip('creazioen proxy con handler {get} ->', () => {
    // non va bene questo test, ho implmentato diversamente proxy-extension
    const handler = {get: function(target, prop, receiver){
                        return Reflect.get(...arguments);
                        //return 'valore generato da proxy';
                    }};
    let proxy = new ProxyExtension(classe, handler);
    let istanza = new proxy();
    expect(istanza.constr).to.equal(5);
    expect(istanza.parametro).to.equal('valore generato da proxy');
  });
  it('un solo handler = oggetto', () => {
    const bridge = [];
    const handler = {
      construct:  function(target, arg, newtarget){
        bridge.push('construct');
        return  new target(...arg);
      }
    };
    const proxy = new ProxyExtension(classe, handler);
    let istanza;
    expect(()=>{istanza = new proxy(2);}).to.not.throw();
    expect(bridge).to.include.members(['construct']);
    expect(istanza.met2(3)).to.equal('called');
    expect(istanza.due).to.equal(3);
    expect(istanza.constr).to.equal(5);
    expect(istanza.argomenti).to.equal(2);
  });
  it('due handler, primo callback', () => {
    const bridge = [];
    const handler = (handler)=>{return{
      construct:  function(target, arg, newtarget){
        bridge.push('construct');
        return  new Proxy(new target(...arg), handler);
      }
    }};
    const handler_istanza = {
      get(target, prop, receiver){
        bridge.push('get');
        return Reflect.get(...arguments);
      }
    };
    const proxy = new ProxyExtension(classe, handler, handler_istanza);
    let istanza;
    expect(()=>{istanza = new proxy(2);}).to.not.throw();
    expect(istanza.met2(3)).to.equal('called');
    expect(istanza.due).to.equal(3);
    expect(istanza.constr).to.equal(5);
    expect(istanza.argomenti).to.equal(2);
    expect(bridge).to.include.members(['construct', 'get']);
  });
  
});