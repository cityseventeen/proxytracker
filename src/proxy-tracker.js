/* global Reflect, Function */

const assert = require('assert').strict;

const generaHandlerForProxyTrack = require('./handlertrack-proxy-generator.js');
const generaHandlerForProxy = require('./handler-proxy-generator.js');
const {trapRemover, removerProxyForExtends} = require('./proxy-remover.js');



function ProxyTracker(target, ...callbacks_for_tracker){
  checkProxyTracker(target, callbacks_for_tracker);
  const handler_tipo_tracker = generaHandlerForProxyTrack(...callbacks_for_tracker);
  const handler = generaHandlerForProxy(handler_tipo_tracker, target, modifiesHandler);
  return new Proxy(target, handler);
}
function checkProxyTracker(target, callbacks_for_tracker){
  /*assert( typeof target === 'object' ||
          typeof target === 'function' ||
          Array.isArray(target), 'target deve essere object, function o array');*/ // this check will did by ProxyJS
  assert(Array.isArray(callbacks_for_tracker), 'callbacks_for_tracker non è un array');
}
function modifiesHandler(handler, entity){
  let handler_with_trap_remover = trapRemover(handler, entity);
  handler_with_trap_remover = removerProxyForExtends(handler_with_trap_remover);
  return handler_with_trap_remover;
}

module.exports.ProxyTracker = ProxyTracker;
