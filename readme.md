## Scopo
Questa repository nasce per dare la possibilità di separare la logica dell'applicazione,
dal controllo degli errori e dalle istruzioni di logging,
come da pratiche di PragmaticProgrammer e CleanCode ai quali mi ispiro.

## Su cosa si basa ProxyTracker e punti di forza
Sull'uso di Proxy in Javascript. Ma per il classico Proxy, 
la scrittura dell'handler dove inserire le "funzioni trappola" è piuttosto scomodo.

### con il Proxy di javascript l'uso di handler è pesante
Ne do un esempio. Mettiamo che tu voglia implementare una trappola per new classe,
e per le funzioni chiamata nell'istanza.
Dovresti scrivere per il classico Proxy:
```js
const callback_check_error = function(...args){/* funzione */}
const callback_spia1 = function(...args){/* funzione */}
const callbacl_logger = function(...args){/* funzione */}
const callback_spia2 = function(...args){/* funzione */}
const handler_apply = {apply(target, thisArg, args){
    callback_logger(...arguments);
    return target.apply(thisArg, args);
}}
const hanler_get = {get(target, prop, receiver){
    let valore = Reflect.get(...arguments);
    if(isValoreValidForProxy(valore) return new Proxy(valore, handler_apply)
    else return valore;
}}
const handler = {construct(target, args){
    callback_spia1(...args)
    callback_check_error(...args)
    callback_logger(...arguments)
    const istanza = new target(...args)
    return new Proxy(istanza, handler_get)
},
get(target, prop, receiver){
    callback_spia2(prop);
    let valore = Reflect.get(...arguments);
    if(isValoreValidForProxy(valore) return new Proxy(valore, handler_apply)
    else return valore;
}
}
```

### Con ProxyTrack,
basta scrivere questo:
```js
const handler = [{construct: [callback_spia1, callback_logger, callback_check_error], get: callback_spia2},
                {construct: {get: {apply: callback_logger}}}]
```
Fine. Solo questo.

Non ci sono più scuse per tenere separati logica e logger/controllo.


