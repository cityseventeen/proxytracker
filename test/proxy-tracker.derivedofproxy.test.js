/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyTracker} = require(`../proxy-tracker.js`);
const {createDerivedFromProxy} = require('./test.support.js');

const t = { list_all_traps_for_class: ['get', 'construct', 'defineProperty', 'deleteProperty',
                  'getOwnPropertyDescriptor', 'getPrototypeOf', 'has',
                  'isExtensible', 'ownKeys', 'preventExtensions', 'set',
                  'setPrototypeOf'],
            list_traps_for_derived_that_doesnt_activate_trap: ['defineProperty', 'deleteProperty',
                  'getOwnPropertyDescriptor', 'getPrototypeOf',
                  'isExtensible', 'ownKeys', 'preventExtensions',
                  'setPrototypeOf']};
Object.freeze(t);

describe('derived class of proxy - Each trap isnt activated in the derived class', () => {
  let bridge;
  let derived_class, base_proxy;
  
  beforeEach(()=>{
    bridge = [];
    const entity = createDerivedFromProxy(bridge, ProxyTracker);
    base_proxy = entity.base_proxy;
    derived_class = entity.derived_class;
    svuotaBridge(bridge);
  });
  
  it('extends base class with proxy return a non proxy entity', () => {
    expect(util.types.isProxy(derived_class)).to.be.false;
  });
  for(let trap_name of t.list_traps_for_derived_that_doesnt_activate_trap)
    it(`${trap_name} isnt activated`, () => {
      expect(bridge).to.eql([]);
      activesTrap(derived_class, trap_name);
      expect(bridge).to.be.an('array').that.not.include(`called ${trap_name}`);
      doesSureThatBaseClassProxedActivesTrap(bridge, base_proxy, trap_name);
    });
  for(let trap_name of t.list_all_traps_for_class)
    it.skip(`${trap_name} isnt activated when the method/param is overwrite in derived class`, () => { //// al momento get construct has e set sono ancor auna trappola.
      /// per cui, se si vuole una derivata senza trappole, bisogna farla dall'entità originria e non dal proxy dell'entità
      class derived_with_overwhrite extends base_proxy{
        constructor(){super();}
        static property = 'value';
      }
      expect(bridge).to.eql([]);
      activesTrap(derived_class, trap_name);
      expect(bridge).to.be.an('array').that.not.include(`called ${trap_name}`);
      doesSureThatBaseClassProxedActivesTrap(bridge, base_proxy, trap_name);
    });
});
function svuotaBridge(bridge){
  for(let i=0; i<bridge.length; i++){
    bridge.pop();
  }
}
function activesTrap(entity, trap_name){
  let value;
  switch(trap_name){
    case 'apply': value = Reflect[trap_name](entity, [undefined]); break;
    case 'construct': value = Reflect[trap_name](entity, [undefined]); break;
    case 'defineProperty': value = Reflect[trap_name](entity, 'property', {}); break;
    case 'deleteProperty': value = Reflect[trap_name](entity, 'property'); break;
    case 'get': value = Reflect[trap_name](entity, 'property'); break;
    case 'getOwnPropertyDescriptor': value = Reflect[trap_name](entity, 'property'); break;
    case 'getPrototypeOf': value = Reflect[trap_name](entity); break;
    case 'has': value = Reflect[trap_name](entity, 'property'); break;
    case 'isExtensible': value = Reflect[trap_name](entity); break;
    case 'ownKeys': value = Reflect[trap_name](entity); break;
    case 'preventExtensions': value = Reflect[trap_name](entity); break;
    case 'set': value = Reflect[trap_name](entity, 'property', 'value'); break;
    case 'setPrototypeOf': value = Reflect[trap_name](entity, Object); break;
      
    default: assert.fail();
  }
}

function doesSureThatBaseClassProxedActivesTrap(bridge, entity, trap_name){
  activesTrap(entity, trap_name);
  expect(bridge).to.be.an('array').that.include(`called ${trap_name}`);
}



