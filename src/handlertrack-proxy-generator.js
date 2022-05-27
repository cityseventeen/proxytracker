const assert = require('assert').strict;

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
        insertSubHandler(handler_track);
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
  if(name !== undefined && !(name in riferimento.hds)) riferimento.hds[name] = creaRiferimento();
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

module.exports = generaHandlerForProxyTrack;