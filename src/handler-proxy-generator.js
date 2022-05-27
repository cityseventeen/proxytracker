const logger = require('./logger.js');
const assert = require('assert').strict;

function generaHandlerForProxy(handler_of_track_type){
  assert(typeof handler_of_track_type === 'object', 'handler non è stato inserito');
  const handler_generato = creaHandlerRicorsivo(handler_of_track_type);
  return handler_generato;
}
function creaHandlerRicorsivo(handler_of_track_type){
  const handler = {};
  for(let name in handler_of_track_type){
    const {cbs, hds} = splitCallbackObject(handler_of_track_type[name]);
    let trappola;
    if(typeof hds === 'object'){
      let sub_handler = creaHandlerRicorsivo(hds);
      let returning = returnEndingTrapFromList(name, sub_handler);
      trappola = template_trap(cbs, returning);
    }
    else{
      let returningTrapSimple = returnEndingTrapFromList(name);
      trappola = template_trap(cbs, returningTrapSimple);
    }
    handler[name] = trappola;
  }
  return handler;
}
function splitCallbackObject(list){
  return {cbs: list.cbs,
          hds: list.hds};
}
function returnEndingTrapFromList(metodo, handler){
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
  if(ending_trap === undefined) throw new TypeError(`La trappola non è del tipo previsto da Proxy, ma è ${metodo}`);
  return (...args)=>{let value_returned_by_trap = ending_trap(...args); return returnProxyOrValue(value_returned_by_trap, handler);};

  function returnProxyOrValue(value, handler){
    if((value instanceof Function || typeof value === 'object') && typeof handler === 'object')
      try{
        return new Proxy(value, handler);}
      catch(e){
        logger.error({exception: e, value, handler});
        ifExceptionIsntForValueThenThrow(e);
        return value;
      }
    else return value;
  }
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
