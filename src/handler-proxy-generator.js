/* global Reflect, Function */

const assert = require('assert').strict;

const EACH = Symbol('EACH');

const default_trapList = function returnEndingTrapFromList(metodo){
  const ending_of_trap_list = {
     apply(target, thisArg, args){return Reflect.apply(...arguments);},
     construct(target, args, newtarget){return Reflect.construct(...arguments);},
     defineProperty(target, property, descriptor){return Reflect.defineProperty(...arguments);},
     deleteProperty(target, prop){return Reflect.deleteProperty(...arguments);},
     get(target, prop, receiver){return Reflect.get(...arguments);},
     getOwnPropertyDescriptor(target, prop){return Reflect.getOwnPropertyDescriptor(...arguments);},
     getPrototypeOf(target){return Reflect.getPrototypeOf(...arguments);},
     has(target, prop){return Reflect.has(...arguments);},
     isExtensible(target){return Reflect.isExtensible(...arguments);},
     ownKeys(target){return Reflect.ownKeys(...arguments);},
     preventExtensions(target){return Reflect.preventExtensions(...arguments);},
     set(target, property, value, receiver){return Reflect.set(...arguments);},
     setPrototypeOf(target, prototype){return Reflect.setPrototypeOf(...arguments);}
  };
  let ending_trap = ending_of_trap_list[metodo];
  return ending_trap;
};

function generaHandlerForProxy(handler_of_track_type, {NAME}, entity = undefined, modifiesHandler = undefined, trapList = default_trapList){
  checkHandler({trapList, handler_of_track_type, modifiesHandler, NAME});
  const handler_generato = creaHandlerRicorsivo(handler_of_track_type, trapListWithCheck(trapList), modifiesHandler);

  if(modifiesHandler !== undefined) return modifiesHandler(handler_generato, entity);
  else return handler_generato;
}
function checkHandler({handler_of_track_type, trapList, modifiesHandler, NAME}){
  assert(typeof trapList === 'function', 'traplist must to be a function');
  assert(typeof handler_of_track_type === 'object', 'handler non è stato inserito');
  assert(modifiesHandler === undefined || typeof modifiesHandler === 'function', 'callback for changing handler must to be a function');
  assert(typeof NAME === 'symbol', 'CONST.NAME must to be a Symbol');
}
function trapListWithCheck(trap_list){
  return function(trap_name){
    const returning_value_by_trap_callback = trap_list(trap_name);
    if(returning_value_by_trap_callback === undefined) throw new TypeError(`La trappola non è del tipo previsto da Proxy, ma è ${trap_name}`);
    return returning_value_by_trap_callback;
  };
}
function creaHandlerRicorsivo(handler_of_track_type, trapList, modifiesHandler){
  const handler = {};
  for(let name in handler_of_track_type){
    const {cbs, hds, ret, FOR} = splitCallbackObject(handler_of_track_type[name]);
    let trappola;
    let returning_value_callback = (ret===undefined?trapList(name):ret);
    const sub_handler = {};
    if(typeof hds === 'object'){
      sub_handler.hds = creaHandlerRicorsivo(hds, trapList, modifiesHandler);
    }
    if(Array.isArray(FOR)){
      sub_handler.FOR = extractReturningTrapsFromFOR(FOR, trapList, modifiesHandler);
    }
    const sub_handler_all = Object.assign({}, {[EACH]: sub_handler.hds}, sub_handler.FOR);
    
    let returning = returnEndingTrap(name, returning_value_callback, sub_handler_all, modifiesHandler);
    trappola = template_trap(cbs, returning);

    handler[name] = trappola;
  }
  return handler;
}
function splitCallbackObject(list){
  return {cbs: list.cbs,
          hds: list.hds,
          ret: list.ret,
          FOR: list.FOR};
}
function extractReturningTrapsFromFOR(FOR, trapList, modifiesHandler){
  
  
}
function returnEndingTrap(trap_name, returning_value_callback, handler, modifiesHandler){
  return (...args)=>{ const handler_choosed = chooseHandler(trap_name, args, handler);
                      let value_returned_by_trap = returning_value_callback(...args);
                      let handler_modified = undefined;
                      if(typeof handler_choosed === 'object'){
                        if(typeof modifiesHandler === 'function')
                          handler_modified = modifiesHandler(handler_choosed, value_returned_by_trap);
                        else
                          handler_modified = handler_choosed;
                      }
                      return returnProxyOrValue(value_returned_by_trap, handler_modified);};
}
function chooseHandler(trap_name, args, handler){
  let name_prop = extractPropertyNameFromArgsTrap(trap_name, args);
  if(name_prop === undefined) return handler[EACH];

  if(name_prop in handler)
    return handler[name_prop];
  else
    return handler[EACH];
}
function extractPropertyNameFromArgsTrap(trap_name, args){
  let prop_name;
  switch(trap_name){
    case 'apply': [prop_name] = args; prop_name = prop_name.name; break;
    case 'get': [,prop_name] = args; break;
    case 'defineProperty': [,prop_name] = args; break;
    case 'deleteProperty': [,prop_name] = args; break;
    case 'getOwnPropertyDescriptor': [,prop_name] = args; break;
    case 'has': [,prop_name] = args; break;
    case 'set': [,prop_name] = args; break;
    default: prop_name = undefined;
  }
  
  return prop_name;
}

function returnProxyOrValue(value, handler){
  const logger = require('./logger.js');
  if((value instanceof Function || typeof value === 'object') && typeof handler === 'object'){
    try{
      return new Proxy(value, handler);}
    catch(e){
      logger.error({exception: e, value, handler});
      ifExceptionIsntForValueThenThrow(e);
      return value;
    }
  }
  else return value;
}
function ifExceptionIsntForValueThenThrow(e){
  if(e.message === 'Cannot create proxy with a non-object') throw e;
}
function template_trap(callbacks, returning){
  return (...args)=>{
    let value = returning(...args);
    for(let cb of callbacks) cb(value, ...args);
    return value;
  };
}

module.exports = generaHandlerForProxy;
module.exports.CONST = {EACH: EACH};
