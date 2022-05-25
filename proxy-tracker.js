/* global Function, Reflect, process */

const assert = require('assert').strict;

const err = require('./lib/errorC.js');

//// invece di usare solo due argomenti, implementare come ho fatto per ProxyTracker con generaHandler
function ProxyExtension(target, handler_for_proxy, handler_annidato){
  let proxy;
  if(typeof handler_for_proxy === 'object')
    proxy = new Proxy(target, handler_for_proxy);
  else if(typeof handler_for_proxy === 'function'){
   proxy = new Proxy(target, handler_for_proxy(handler_annidato));
  }
  else throw new Error();

  return proxy;
}

function ProxyTracker(target, ...callbacks_for_tracker){
  checkProxyTracker(target, callbacks_for_tracker);
  const handler_tipo_tracker = generaHandlerForProxyTrack(...callbacks_for_tracker);
  const handler = generaHandlerForProxy(handler_tipo_tracker);
  
  return new Proxy(target, handler);
}

function checkProxyTracker(target, callbacks_for_tracker){
  /*assert( typeof target === 'object' ||
          typeof target === 'function' ||
          Array.isArray(target), 'target deve essere object, function o array');*/ // this check will did by ProxyJS
  assert(Array.isArray(callbacks_for_tracker), 'callbacks_for_tracker non è un array');
}


function generaHandlerForProxy(handler_of_track_type){
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
      return new Proxy(value, handler);
    else return value;
  }
}
function template_trap(callbacks, returning){
  return (...args)=>{
    let value = returning(...args);
    for(let cb of callbacks) cb(value, ...args);
    return value;
  };
}


//// candidati per modulo a parte, quando creo package separato per ProxyTracker
function generaHandlerForProxyTrack(...callbacks_for_tracker){
  const handler_track = creaRiferimento();
  checkArgsForGeneraHandlersTrack(...callbacks_for_tracker);
  unisciHandlersRicorsivo(handler_track, ...callbacks_for_tracker);
     
  return puntatoreRiferimento(handler_track);
}
function creaRiferimento(){
  return {hds: undefined, cbs: []};
}
function puntatoreRiferimento(riferimento, name){
  if(typeof name === 'string') return riferimento.hds[name];
  else return riferimento.hds;
}
function checkArgsForGeneraHandlersTrack(...args){
  for(let arg of args){
    if(!((typeof arg === 'object' && !Array.isArray(arg)) || arg === undefined)) throw new TypeError('handler deve essere un oggetto');
  }
}
function unisciHandlersRicorsivo(handler_track, ...elements){
  for(let element of elements){
    if(element === undefined) continue;
    ifElementInvalidThrowError(element);
    if(typeof element === 'function'){
      pushCallback(handler_track, element);
    }
    else{
      if(Array.isArray(element)) unisciHandlersRicorsivo(handler_track, ...element);
      else{
        for(let name in element){
          insertSubHandler(handler_track, name);
          unisciHandlersRicorsivo(puntatoreRiferimento(handler_track, name), element[name]);
        }
      }
    }
  }
  
}
function pushCallback(handler, func){
  handler.cbs.push(func);
}
function insertSubHandler(riferimento, name){
  if(riferimento.hds === undefined) riferimento.hds = {};
  if(!(name in riferimento.hds)) riferimento.hds[name] = creaRiferimento();
}

function ifElementInvalidThrowError(element){
  assert(     ((typeof element === 'function')
          ||  (typeof element === 'object' && !Array.isArray(element))
          ||   Array.isArray(element)), `ricevuto ${typeof element}. elemento deve essere function, object, o array`);
}
function isAnonymousFunction(func){
  if(func.name === '') return true;
  else return false;
}
function* scorriElementiGenerator(target){
  if(typeof target === 'object' && !Array.isArray(target))
    for(let elem in target) yield elem;
  else if(Array.isArray(target))
    for(let elem of target){
      let obj = {}; obj[elem] = target[elem];
      yield obj;
    }
  else yield target;
}

module.exports.ProxyExtension = ProxyExtension;
module.exports.ProxyTracker = ProxyTracker;
if(process.env.NODE_ENV === 'dev'){
  module.exports.test = {generaHandlerForProxyTrack ,generaHandlerForProxy};
}
