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


describe('handler = {trap: {}} fa restituire proxy dei valori ritornati', () => {
  it('es con get', () => {
    const obj = {param: {a: 5}};
    const handler = {get: {}};
    const proxy = new ProxyTracker(obj, handler);
    let value = proxy.param;
    expect(util.types.isProxy(value)).to.be.true;
    
  });
});
describe('traps return Proxy if proxable (function or object and doesnt throw error es for non writeble element', () => {
  class classe{
        static funzione(){}
        static oggetto = {}
      }

  class base{
    constructor(arg){this.base = arg;}
  }
  class classe_derivata extends base{
    static oggetto = {}
    static funzione(){}
  }
  const object = {oggetto: {}, funzione(){}};
  const funzione = function(){return {};};
  addPropertyForTrapGetTest(funzione);
  const array = [];
  addPropertyForTrapGetTest(array);
  const Native_Array = Array;
  const Native_String = String;
  const Native_Object = Object;
  const Native_Number = Number;
  const Native_Function = Function;

  
  
  const list_target = [
    {title: 'class', entita: classe, traps: t.lista_all_traps_except('apply'), proxy: t.lista_all_traps_except(                  'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf')},
    {title: 'class derivata', entita: classe_derivata, traps: t.lista_all_traps_except('apply'), proxy: t.lista_all_traps_except('deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor',                   'ownKeys', 'setPrototypeOf')},
    {title: 'oggetto', entita: object, traps: t.lista_all_traps_except('apply', 'construct'), proxy: t.lista_all_traps_except(   'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor',                   'ownKeys', 'setPrototypeOf')},
    {title: 'funzione', entita: funzione, traps: t.lista_all_traps_except(), proxy: t.lista_all_traps_except(                    'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf')},
    {title: 'array []', entita: array, traps: t.lista_all_traps_except('apply', 'construct'), proxy: t.lista_all_traps_except(   'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor',                   'ownKeys', 'setPrototypeOf')},
    {title: 'native Array', entita: Native_Array, traps: t.lista_all_traps_except('get'), proxy: t.lista_all_traps_except(       'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf')},
    {title: 'native String', entita: Native_String, traps: t.lista_all_traps_except('get'), proxy: t.lista_all_traps_except(     'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf', 'apply')},
    {title: 'native Object', entita: Native_Object, traps: t.lista_all_traps_except('get'), proxy: t.lista_all_traps_except(     'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf')},
    {title: 'native Number', entita: Native_Number, traps: t.lista_all_traps_except('get'), proxy: t.lista_all_traps_except(     'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf', 'apply')},
    {title: 'native Function', entita: Native_Function, traps: t.lista_all_traps_except('get'), proxy: t.lista_all_traps_except( 'deleteProperty', 'has', 'isExtensible', 'set', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'ownKeys', 'setPrototypeOf')}
  ];
  
  testReturnProxy(list_target);

});
describe('traps doesnt return proxy if the value returnet isnt function or object', () => {
  
});
describe('traps doesnt return proxy if isnt proxable(es for non writable element)', () => {

});

function addPropertyForTrapGetTest(entita){
  entita.oggetto = {};
  entita.funzione = function(){};
}

function testReturnProxy(list_target){
  for(let type_target of list_target){
    describe(`for ${type_target.title} traps returning proxy test`, ()=>{
      for(let does_trap_return_proxy of [true, false]){
          const testTrap = new testTrapGenerator(type_target.entita, does_trap_return_proxy);
          for(let trap of returns_traps_to_test(type_target.traps, type_target.proxy, does_trap_return_proxy))
          {
             testTrap[trap]();                             
          }
      }
    });
  }
}
function returns_traps_to_test(traps_list, traps_that_returns_proxy, does_trap_return_proxy){
  assert(typeof does_trap_return_proxy === 'boolean');
  if(does_trap_return_proxy){
    return traps_that_returns_proxy = traps_list.filter(elem => traps_that_returns_proxy.indexOf(elem) !== -1);
  
  }
  else
    return traps_that_doesnt_return_proxy = traps_list.filter(elem => traps_that_returns_proxy.indexOf(elem) === -1);
}


const forceToReturnProxy = function(){
  return {};
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
    it(`trap get object ${title}`, () => {
      const handler = {get: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = track.oggetto;
      expect(util.types.isProxy(value) === trap_must_to_be_return_proxy).to.be.true;
    });
    it(`trap get funzione ${title}`, () => {
      const handler = {get: [forceToReturnProxy()]};
      let track = new ProxyTracker(entita, handler);
      let value = track.funzione;
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
