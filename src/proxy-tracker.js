const assert = require('assert').strict;
const {ProxyRemover} = require('./proxy-remover.js');

const generaHandlerForProxy = require('./handler-proxy-generator.js');
const generaHandlerForProxyTrack = require('./handlertrack-proxy-generator.js');



function ProxyTracker(target, ...callbacks_for_tracker){
  checkProxyTracker(target, callbacks_for_tracker);
  const handler_tipo_tracker = generaHandlerForProxyTrack(...callbacks_for_tracker);
  const handler = generaHandlerForProxy(handler_tipo_tracker, target);
  return new Proxy(target, handler);
}

function checkProxyTracker(target, callbacks_for_tracker){
  /*assert( typeof target === 'object' ||
          typeof target === 'function' ||
          Array.isArray(target), 'target deve essere object, function o array');*/ // this check will did by ProxyJS
  assert(Array.isArray(callbacks_for_tracker), 'callbacks_for_tracker non è un array');
}

module.exports = {ProxyTracker, ProxyRemover};
