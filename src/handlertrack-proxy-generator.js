
const ENVIRONMENT = process.env.NODE_ENV;

const assert = require('assert').strict;

const {check, errors} = require('./errors.js');

const NAME = Symbol('NAME');

function generaHandlerForProxyTrack(...callbacks_for_tracker){
  const handler_track = creaSubHandlerTrack();
  checkArgsForGeneraHandlersTrack(...callbacks_for_tracker);
  unisciHandlersRicorsivo(handler_track, ...callbacks_for_tracker);
     
  return handler_track.hds;
}
function creaSubHandlerTrack(){
  return {hds: undefined, cbs: []};
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
        let traps_list = Object.keys(element);
        if(element.FOR !== undefined){
          //if(typeof element.FOR === 'function') throw new Error('ToDevelop');
          let name_FOR_list = Array.isArray(element.FOR)?element.FOR:[element.FOR];
          for(let name_FOR of name_FOR_list){
            //if(typeof name_FOR !== 'string') throw new Error('ToDevelop');
            let rif_handler = insertFORinHandler(handler_track, name_FOR);
            traps_list = traps_list.filter(el => el !== 'FOR');
            for(let name of traps_list){
              insertTrapSubHandler(rif_handler, name);
              unisciHandlersRicorsivo(rif_handler[name], element[name]);
            }
          }
        }
        else{
          if(handler_track.hds === undefined) handler_track.hds = {};
          for(let name of traps_list){
            insertTrapSubHandler(handler_track.hds, name);
            unisciHandlersRicorsivo(handler_track.hds[name], element[name]);
          }
        }
      }

    }
  }
}


function ifElementInvalidThrowError(element){
  assert(     ((typeof element === 'function')
          ||  (typeof element === 'object' && !Array.isArray(element))
          ||   Array.isArray(element)), `ricevuto ${typeof element}. elemento deve essere function, object, o array`);
}
function pushCallback(handler, func){
  handler.cbs.push(func);
}
function insertTrapSubHandler(riferimento, name){
  if(name !== undefined && !(name in riferimento)) riferimento[name] = creaSubHandlerTrack();
}
function insertFORinHandler(handler_track, name){
  check.error(typeof name === 'string', errors.name_for_in_handler_isnt_string(name));
  let rif = insertFORtarget(handler_track, name);
  return rif;
}
function insertFORtarget(riferimento, target){
  assert(typeof target === 'string');
  if(riferimento.FOR === undefined) riferimento.FOR = [];
  return returnRifNAMEInArrayEntered(riferimento.FOR, target);
}
function returnRifNAMEInArrayEntered(array, target){
  for(let el of array){
    if(el[NAME] === target) return el;
  }
  let length = array.push({[NAME]: target});
  return array[length-1];
}



module.exports = generaHandlerForProxyTrack;
module.exports.CONST = {NAME};
