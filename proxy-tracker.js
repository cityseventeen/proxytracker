/* global process */

const ProxyExtension = require('./src/proxy-extension.js');
const {ProxyTracker} = require('./src/proxy-tracker.js');
const {ProxyRemover} = require('./src/proxy-remover.js');
const generaHandlerForProxy = require('./src/handler-proxy-generator.js');
const generaHandlerForProxyTrack = require('./src/handlertrack-proxy-generator.js');

module.exports.ProxyExtension = ProxyExtension;
module.exports.ProxyTracker = ProxyTracker;
module.exports.ProxyRemover = ProxyRemover;
if(process.env.NODE_ENV === 'dev'){
  module.exports.test = {generaHandlerForProxyTrack ,generaHandlerForProxy};
}
