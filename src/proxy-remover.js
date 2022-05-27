/* global Reflect */

const symb_remover = Symbol('REMOVER');
const symb_origin = Symbol('ORIGIN');

function trapRemover(handler, origin_entity){
  addGetTrapIfAbsent(handler);
  const handler_with_remover = Object.assign({}, handler);
  handler_with_remover.get = function(target, prop, receiver){
    if(prop === symb_origin)
      return origin_entity;
    else
      return handler.get(target, prop, receiver);
  };  
  return handler_with_remover;
}

function addGetTrapIfAbsent(handler){
  if(handler.get === undefined){
    handler.get = function(t,p,r){return Reflect.get(t,p,r);}
  }
}

module.exports.symbols = {REMOVER: symb_remover, ORIGIN: symb_origin};
module.exports.trapRemover = trapRemover;
