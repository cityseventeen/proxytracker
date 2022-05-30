/* global Reflect, Function */

const assert = require('assert').strict;

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

function generaHandlerForProxy(handler_of_track_type, entity = undefined, modifiesHandler = undefined, trapList = default_trapList){
  checkHandler({trapList, handler_of_track_type, modifiesHandler});

  const handler_generato = creaHandlerRicorsivo(handler_of_track_type, trapList, modifiesHandler);

  if(modifiesHandler !== undefined) return modifiesHandler(handler_generato, entity);
  else return handler_generato;
}
function checkHandler({trapList, handler_of_track_type, modifiesHandler}){
  assert(typeof trapList === 'function', 'traplist must to be a function');
  assert(typeof handler_of_track_type === 'object', 'handler non è stato inserito');
  assert(modifiesHandler === undefined || typeof modifiesHandler === 'function', 'callback for changing handler must to be a function');
}
function creaHandlerRicorsivo(handler_of_track_type, trapList, modifiesHandler){
  const handler = {};
  for(let name in handler_of_track_type){
    const {cbs, hds} = splitCallbackObject(handler_of_track_type[name]);
    let trappola;
    if(typeof hds === 'object'){
      let sub_handler = creaHandlerRicorsivo(hds, trapList, modifiesHandler);
      let returning = returnEndingTrap(name, trapList, sub_handler, modifiesHandler);
      trappola = template_trap(cbs, returning);
    }
    else{
      let returningTrapWithoutProxy = returnEndingTrap(name, trapList);
      trappola = template_trap(cbs, returningTrapWithoutProxy);
    }
    handler[name] = trappola;
  }
  return handler;
}
function splitCallbackObject(list){
  return {cbs: list.cbs,
          hds: list.hds};
}
function returnEndingTrap(trap_name, trap_list, handler, modifiesHandler){
  let function_for_returning_value_by_trap = trap_list(trap_name);
  if(function_for_returning_value_by_trap === undefined) throw new TypeError(`La trappola non è del tipo previsto da Proxy, ma è ${trap_name}`);
  return (...args)=>{ let value_returned_by_trap = function_for_returning_value_by_trap(...args);
                      let handler_modified;
                      if(typeof modifiesHandler === 'function')
                        handler_modified = modifiesHandler(handler, value_returned_by_trap);
                      return returnProxyOrValue(value_returned_by_trap, handler_modified);};
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
