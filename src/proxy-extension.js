/* global process */

const assert = require('assert').strict;

const generaHandlerForProxy = require('./handler-proxy-generator.js');
const generaHandlerForProxyTrack = require('./handlertrack-proxy-generator.js');

function ProxyExtension(target, ...handlers){
  checkProxyExtension(target, handlers);
  const handler_tipo_tracker = generaHandlerForProxyTrack(...handlers);
  
  const handle_with_ret_property = copyHandler(handler_tipo_tracker);
  handlerWithLastCallbackSeparedInNewParameter(handle_with_ret_property);
  const handler = generaHandlerForProxy(handle_with_ret_property, target, modifiesHandler);
  return new Proxy(target, handler);
}

function checkProxyExtension(target, handlers){
  assert(Array.isArray(handlers), 'callbacks_for_tracker non è un array');
}
function copyHandler(handler){
  return Object.assign({}, handler);
}
function modifiesHandler(handler, entity){
  const {trapRemover, removerProxyForExtends} = require('./proxy-remover.js');
  let handler_with_trap_remover = trapRemover(handler, entity);
  handler_with_trap_remover = removerProxyForExtends(handler_with_trap_remover);
  return handler_with_trap_remover;
}

function handlerWithLastCallbackSeparedInNewParameter(track_handler){
  if(typeof track_handler !== 'object') return track_handler;
  else{
    for(let trap in track_handler){
      let handler = track_handler[trap];
      createRetProperty(handler);
      let last_callback = extractLastCallback(handler);
      insertCallbackInRetProperty(handler, last_callback);
      if(isThereSubHandler(handler)){
        let sub_handler = returnSubHandler(handler);
        handlerWithLastCallbackSeparedInNewParameter(sub_handler);
      }
    }
  }
}
function createRetProperty(handler){
  handler.ret = undefined;
}
function extractLastCallback(handler){
  assert(Array.isArray(handler.cbs));
  let last_cb = handler.cbs.pop();
  if(handler.cbs === undefined) handler.cbs = [];
  return last_cb;
}
function insertCallbackInRetProperty(handler, callback){
  handler.ret = callback;
}
function isThereSubHandler(handler){
  return typeof handler.hds === 'object';
}
function returnSubHandler(handler){
  return handler.hds;
}

module.exports = ProxyExtension;

if(process.env.NODE_ENV === 'dev')
  module.exports.test = {handlerWithLastCallbackSeparedInNewParameter};
