/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyExtension, ProxyTracker} = require(`../proxy-tracker.js`);

const t = {list_all_traps: ['apply', 'get', 'construct', 'defineProperty', 'deleteProperty',
                  'getOwnPropertyDescriptor', 'getPrototypeOf', 'has',
                  'isExtensible', 'ownKeys', 'preventExtensions', 'set',
                  'setPrototypeOf']};
const lista_all_traps_except = function(...list){return t.list_all_traps.filter(elem =>list.indexOf(elem)===-1);};
t.lista_all_traps_except = lista_all_traps_except;
Object.freeze(t);



describe.only('traps return Proxy if proxable (function or object and doesnt throw error es for non writeble element', () => {
  class classe{
        static funzione(){}
        static oggetto = {}
      }

  class base{
    constructor(arg){this.base = arg;}
  }
  class classe_derivata extends base{
    constructor(arg){super(arg); this.derivata = arg + 100;}
    metodo_derivata(){this.metodo = 8; return 'qualcosa';}
    static oggetto = {}
  }
  const object = {param: 5, metodo(){return 8;}, oggetto: {}};

  const list_target = [
    {title: 'class', entita: classe, traps: t.lista_all_traps_except('apply'), proxy: t.lista_all_traps_except('defineProperty', 'deleteProperty', 'has', 'isExtensible', 'set')}/*,
    {title: 'class derivata', entita: classe_derivata, traps: t.lista_all_traps_except('apply'), proxy: t.lista_all_traps_except()},
    {title: 'oggetto', entita: object, traps: t.lista_all_traps_except('apply', 'construct'), proxy: t.lista_all_traps_except()},
    {title: 'funzione', entita: function(){return {}}, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except()},
    {title: 'array []', entita: [], traps: t.lista_all_traps_except('apply', 'construct'), proxy: t.lista_all_traps_except()},
    {title: 'native Array', entita: Array, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except()},
    {title: 'native String', entita: String, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except()},
    {title: 'native Object', entita: Object, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except()},
    {title: 'native Number', entita: Number, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except()},
    {title: 'native Function', entita: Function, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except()}*/
  ];
  
  for(let type_target of list_target){
    describe(`for ${type_target.title} traps returning proxy test`, ()=>{
      const does_trap_return_proxy = true;
      const testTrap = new testTrapGenerator(type_target.entita, does_trap_return_proxy);
                            
      for(let trap of returns_traps_to_test(type_target.traps, type_target.proxy, does_trap_return_proxy))
      {
         testTrap[trap]();                             
      }
    });
  }

});
describe('traps doesnt return proxy if the value returnet isnt function or object', () => {
  
});
describe('traps doesnt return proxy if isnt proxable(es for non writable element)', () => {

});
function returns_traps_to_test(traps_list, traps_that_returns_proxy, does_trap_return_proxy){
  assert(typeof does_trap_return_proxy === 'boolean');
  if(does_trap_return_proxy){
    return traps_that_returns_proxy = traps_list.filter(elem => traps_that_returns_proxy.indexOf(elem) !== -1);
  
  }
  else
    return traps_that_doesnt_return_proxy = traps_list.filter(elem => traps_that_returns_proxy.indexOf(elem) === -1);
}


const forceToReturnProxy = function(){
  const any_trap = 'get';
  const handler_for_forcing_returning_proxy_from_trap = {};
  handler_for_forcing_returning_proxy_from_trap[any_trap] = function(){};
  return handler_for_forcing_returning_proxy_from_trap;
};

function testTrapGenerator(entita, trap_must_to_be_return_proxy){
  assert(typeof trap_must_to_be_return_proxy === 'boolean');
  const any_trap = 'get';
  const title = trap_must_to_be_return_proxy?'returns proxy':'doesnt return proxy';
  this.apply = function(){
    it(`trap apply ${title}`, () => {
      const handler = {apply: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = track();
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;

    });
  };
  this.construct = function(){
    it(`trap construct ${title}`, () => {
      const handler = {construct: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = new track(5);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;

    });
  };
  this.defineProperty = function(){
    it(`trap defineProperty ${title}`, () => {
      const handler = {defineProperty: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.defineProperty(track, 'new_prop', {value: 8});
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;

    });
  };
  this.deleteProperty = function(){
    it(`trap deleteProperty ${title}`, () => {
      const handler = {deleteProperty: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Reflect.deleteProperty(track, 'prop');
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
    it(`trap deleteProperty ${title}`, () => {
      const handler = {deleteProperty: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = delete track.parametro;
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.get = function(){
    it(`trap get ${title}`, () => {
      const handler = {get: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = track.oggetto;
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
      value = track.funzione;
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.getOwnPropertyDescriptor = function(){
    it(`trap getOwnPropertyDescriptor ${title}`, () => {
      const handler = {getOwnPropertyDescriptor: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.getOwnPropertyDescriptor(track, 'oggetto');
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.getPrototypeOf = function(){
    it(`trap getPrototypeOf ${title}`, () => {
      const handler = {getPrototypeOf: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.getPrototypeOf(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;

    });
  };
  this.has = function(){
    it(`trap has ${title}`, () => {
      const handler = {has: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = 'param' in track;
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
    it(`trap has ${title}`, () => {
      const handler = {has: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Reflect.has(track, 'param');
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.isExtensible = function(){
    it(`trap isExtensible ${title}`, () => {
      const handler = {isExtensible: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.isExtensible(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.ownKeys = function(){
    it(`trap ownKeys ${title}`, () => {
      const handler = {ownKeys: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.keys(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
    it(`trap ownKeys ${title}`, () => {
      const handler = {ownKeys: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.getOwnPropertyNames(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.preventExtensions = function(){
    it(`trap preventExtensions ${title}`, () => {
      const handler = {preventExtensions: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.seal(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;

    });
    it(`trap preventExtensions ${title}`, () => {
      const handler = {preventExtensions: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.freeze(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
    it(`trap preventExtensions ${title}`, () => {
      const handler = {preventExtensions: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Object.preventExtensions(track);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.set = function(){
    it(`trap set ${title}`, () => {
      const handler = {set: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Reflect.set(track, 'parametro', 8);
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };
  this.setPrototypeOf = function(){
    it(`trap setPrototypeOf ${title}`, () => {
      const handler = {setPrototypeOf: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = Reflect.setPrototypeOf(track, {});
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
  };

};
