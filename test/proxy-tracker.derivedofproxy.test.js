/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyTracker} = require(`../proxy-tracker.js`);
const {createDerivedFromProxy} = require('./test.support.js');

const t = { list_all_traps_for_class: ['get', 'defineProperty', 'deleteProperty',
                  'getOwnPropertyDescriptor', 'getPrototypeOf', 'has',
                  'isExtensible', 'ownKeys', 'preventExtensions', 'set',
                  'setPrototypeOf'],
            list_traps_for_derived_that_doesnt_activate_trap: ['defineProperty', 'deleteProperty',
                  'getOwnPropertyDescriptor', 'getPrototypeOf',
                  'isExtensible', 'ownKeys', 'preventExtensions',
                  'setPrototypeOf']};
Object.freeze(t);

describe('derived class of proxy - activation of trap in the derived class', () => {
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
    it(`${trap_name} isnt activated when the method/param is overwrite in derived class`, () => {
      class derived_with_overwrite extends base_proxy{
        constructor(){super();}
        static property = 'value';
        static overwritedMethodFromDerived(){return 'valuemethod';}
      }
      expect(bridge).to.eql([]);
      activesTrap(derived_with_overwrite, trap_name);
      expect(bridge).to.be.an('array').that.not.include(`called ${trap_name}`);
      doesSureThatBaseClassProxedActivesTrap(bridge, base_proxy, trap_name);
    });
  it('metodo sovrascrito in derivata, non attiva trappola di base', () => {
      class derived_with_overwrite extends base_proxy{
        constructor(){super();}
        static property = 'value';
        static overwritedMethodFromDerived(){return 'valuemethod';}
      }
      expect(bridge).to.eql([]);
      derived_with_overwrite.overwritedMethodFromDerived();
      expect(bridge).to.eql([]);
      void function doesSureMethodIsDefinedInBaseClass(){expect(base_proxy.overwritedMethodFromDerived).to.be.not.undefined;}();
  });
  it('metodi non sovrascritti in derivata, attivano la trappola di base', () => {
      derived_class.methodBase();
      expect(bridge).to.be.an('array').that.include(`called apply in get`);
      void function doesSureMethodisDefinedInBaseClass(){expect(base_proxy.methodBase).to.not.be.undefined;}();
  });
  it('parametri non sovrascritti in derivata, attivano la trappola di base', () => {
      derived_class.param_base;
      expect(bridge).to.be.an('array').that.include(`called get`);
      void function doesSureMethodIsDefinedInBaseClass(){expect(base_proxy.param_base).to.be.not.undefined;}();
  });
  it('construct di derivata sovrascritto --> attiva comunque la trappola di base perché chiama super constructor', () => {
      class derived_with_overwrite extends base_proxy{constructor(){super();}}
      expect(bridge).to.eql([]);
      new derived_with_overwrite();
      expect(bridge).to.eql(['called construct']);
  });
  it('construct di derivata non sovrascritto -> attiva comunque la trappola di base perché chiama super constructor', () => {
      class derived_with_overwrite extends base_proxy{}
      expect(bridge).to.eql([]);
      new derived_with_overwrite();
      expect(bridge).to.eql(['called construct']);
  });
  it('get da istanza di derivata da proxy ->', () => {
      class derived_with_overwrite extends base_proxy{constructor(){super();}}
      expect(bridge).to.eql([]);
      let instance = new derived_with_overwrite();
      instance.param_instance;
      expect(bridge).to.eql(['called construct', 'called get in constructor']);
  });
  it.skip('', () => {
    // serie di test se riesco a implementare possibilità di eliminare trappole get apply ecc dopo construct, solo se nella classe derivata.
    // quindi nella classe base ci sono le trappole nella istanza (doo construct), mentre nella derivata c'è solo la trappola construct.
    
    // altra serie di test per verificare cosa succede con proxy della derivata del proxy. ovvero, ci sono due trapoole di construct (una della derivata, e poi quella di base)
    //se vanno in conflitto, quale viene eseguita prima ecc. stessa cosa per get di derivata e get di base, quando si chiamano metodi solo di derivata  o di base, ecc altre trappole
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
    case 'apply': value = Reflect[trap_name](entity, this,[undefined]); break;
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



