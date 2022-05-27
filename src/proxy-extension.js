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

module.exports = ProxyExtension;
