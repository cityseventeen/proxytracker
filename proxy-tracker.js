/*
 * estensione della classe Proxy, che permette di intercettare anche le funzioni e i metodi di classe.
 * *** non più valida questa parte *** ho trovato soluzion emigliore inserendo due handler
 * grazie al contributo di https://gist.github.com/mrharel/592df0228cebc017ca413f2f763acc5f
 * si fa in modo che i get vengano applicati anche ai metodi, oppure introduco nuovo handler.func|applyInto
 *
 * permette anche di inserire callback a inizio dell'intercettazione da eseguire
 */


/* global Function, Reflect */

const assert = require('@decenfreeland/assert');

const err = require('errorC');

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
  const handler_tipo_tracker = generaHandlerForProxyTrack(...callbacks_for_tracker);
  const handler = generaHandlerForProxy(handler_tipo_tracker);
  
  return new Proxy(target, handler);
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
    console.log('return proxy');
    console.dir(value); console.dir(handler); console.dir((value instanceof Function || typeof value === 'object') && typeof handler === 'object');
    if((value instanceof Function || typeof value === 'object') && typeof handler === 'object')
      return new Proxy(value, handler);
    else return value;
  }
}
function template_trap(callbacks, returning){
  return (...args)=>{
    for(let cb of callbacks) cb(...args);
    return returning(...args);
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
    if(!(typeof arg === 'object' && !Array.isArray(arg))) throw new err.ToDevelop(typeof arg);
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
function pushCallback(handler, func){ // da usarquando uniscihandlers permettera di prendere il nome dalle callback
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
if(process.env.NODE_ENV === 'test'){
  module.exports.test = {generaHandlerForProxyTrack ,generaHandlerForProxy};
}
