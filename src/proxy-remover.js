/* global Reflect */
const {types} = require('util');
const symb_remover = Symbol('REMOVER');
const symb_origin = Symbol('ORIGIN');
const symb_marking = Symbol('PROXYTRACKER_MARKING');

function trapRemover(handler, origin_entity){
  addGetTrapIfAbsent(handler);
  const handler_with_remover = Object.assign({}, handler);
  handler_with_remover.get = function(target, prop, receiver){
    if(prop === symb_marking)
      return true;
    else if(prop === symb_origin)
      return origin_entity;
    else
      return handler.get(target, prop, receiver);
  };  
  return handler_with_remover;
}

function addGetTrapIfAbsent(handler){
  if(handler.get === undefined){
    handler.get = function(t,p,r){return Reflect.get(t,p,r);};
  }
}
function ProxyRemover(entity_proxy){
  checkProxyRemover(entity_proxy);
  return entity_proxy[symb_origin];
}

function checkProxyRemover(entity_proxy){
  if(!types.isProxy(entity_proxy)) throw new Error('the argument must to be a proxy');
  if(!isProxyTracker(entity_proxy)) throw new Error('the argument must to be a proxy created by ProxyTracker');
}
function isProxyTracker(entity_proxy){
  return entity_proxy[symb_marking] === true;
}

function removerProxyForExtends(handler){
  addGetTrapIfAbsent(handler);
  const handler_with_remover = Object.assign({}, handler);
  handler_with_remover.get = function(target, prop, receiver){
     if(isExtendsCalled(prop)){
      let origin_entity;
      if(isProxyTracker(target))
        origin_entity = ProxyRemover(target);
      else origin_entity = target;
      return Reflect.get(origin_entity, prop, receiver);
    }
    else
      return handler.get(target, prop, receiver);
  };  
  return handler_with_remover;
}

function isExtendsCalled(prop){
  return prop === 'prototype';
}

module.exports.symbols = {REMOVER: symb_remover, ORIGIN: symb_origin};
module.exports.trapRemover = trapRemover;
module.exports.ProxyRemover = ProxyRemover;
module.exports.removerProxyForExtends = removerProxyForExtends;
