/* global Function, Reflect */

const assert = require('assert');

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
  checkProxyTracker(target, callbacks_for_tracker)
  const handler_tipo_tracker = generaHandlerForProxyTrack(...callbacks_for_tracker);
  const handler = generaHandlerForProxy(handler_tipo_tracker);
  
  return new Proxy(target, handler);
}

function checkProxyTracker(target, callbacks_for_tracker){
  assert( typeof target === 'object' ||
          typeof target === 'function' ||
          Array.isArray(target), 'target deve essere object, function o array');
  assert(Array.isArray(callbacks_for_tracker), 'callbacks_for_tracker non è un array');
  assert(!isArrayEmpty(callbacks_for_tracker), 'deve essere presente un handler');
}
function isArrayEmpty(array){
  return array.length === 0;
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
  const no_alterated_traps_list = {
     apply(target, thisArg, args){return target.apply(thisArg, args);},
     construct(target, args, newtarget){return new target(target, ...args);},
     defineProperty(target, key, descriptor){throw new err.ToDevelop('trappola non sviluppata');},
     deletProperty(target, prop){throw new err.ToDevelop('trappola non sviluppata');},
     get(target, prop, receiver){return Reflect.get(target, prop, receiver);},
     getOwnPropertyDescriptor(target, prop){throw new err.ToDevelop('trappola non sviluppata');},
     getPrototypeOf(target){throw new err.ToDevelop('trappola non sviluppata');},
     has(target, prop){throw new err.ToDevelop('trappola non sviluppata');},
     isExtensible(target){throw new err.ToDevelop('trappola non sviluppata');},
     ownKeys(target){throw new err.ToDevelop('trappola non sviluppata');},
     preventExtensions(target){throw new err.ToDevelop('trappola non sviluppata');},
     set(target, property, value, receiver){throw new err.ToDevelop('trappola non sviluppata');},
     setPrototypeOf(target, prototype){throw new err.ToDevelop('trappola non sviluppata');}
  };
  let trap = no_alterated_traps_list[metodo];
  if(trap === undefined) throw new TypeError(`La trappola non è del tipo previsto da Proxy, ma è ${metodo}`);
  return (...args)=>{let value = trap(...args); return returnProxyOrValue(value, handler);};

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
    if(!(typeof arg === 'object' && !Array.isArray(arg))) throw new TypeError('handler deve essere un oggetto');
  }
}
function unisciHandlersRicorsivo(handler_track, ...elements){
  for(let element of elements){
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
  assert(     ((typeof element === 'function' && !isAnonymousFunction(element))
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
