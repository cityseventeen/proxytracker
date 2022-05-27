const assert = require('assert');

function createDerivedFromProxy(bridge, ProxyTracker){
  const callback_returns_trap_name_inserting_bridge = function (bridge){return function(trap){return function(...args){bridge.push(`called ${trap}`);};};};
  const callback_returns_trap_name = callback_returns_trap_name_inserting_bridge(bridge);
  const handler_with_all_traps = generateHandlerWithThisTrap(
                ['apply', 'construct', 'defineProperty', 'deleteProperty', 'get',
                'getOwnPropertyDescriptor', 'getPrototypeOf', 'has',
                'isExtensible', 'ownKeys', 'preventExtensions', 'set',
                'setPrototypeOf'], callback_returns_trap_name);
  class base{
    constructor(arg){this.base = arg;}
  }
  const base_proxy = new ProxyTracker(base, handler_with_all_traps);
  const derived_class = class extends base_proxy{
    constructor(arg){super(arg); this.derivata = arg + 100;}
    metodo_derivata(){this.metodo = 8; return 'qualcosa';}
    static oggetto = {}
  };
  return {derived_class, base_proxy};
}

function generateHandlerWithThisTrap(trap_list, callback){
  assert(Array.isArray(trap_list));
  const handler = {};
  for(let trap of trap_list){
    handler[trap] = callback(trap);
  }
  return handler;
}

module.exports.createDerivedFromProxy = createDerivedFromProxy;