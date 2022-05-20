# Index
- [Purpose](#purpose)
- [Utilization](#utilization)

## Purpose
This repository is born to give the chance to separate application logic from error checking and logging, as PragmaticProgrammer and CleanCode practices.

### What bases ProxyTracker on and its power
It bases on Javascript `Proxy`. But for the classic Proxy, writing handler for trap function is uncomfortale.

### with JS Proxy, the use of handler is heavy.
For example, if you want implements a trap for constructor (`new class`) and some traps for called functions into the istance, you should write this:
```js
const callback_check_error = function(...args){/* body */}
const callback_spy1 = function(...args){/* body */}
const callbacl_logger = function(...args){/* body */}
const callback_spy2 = function(...args){/* body */}
const handler_apply = {apply(target, thisArg, body){
    callback_logger(...arguments);
    return target.apply(thisArg, args);
}}
const hanler_get = {get(target, prop, receiver){
    let value = Reflect.get(...arguments);
    if(isValueValidForProxy(value) return new Proxy(valye, handler_apply)
    else return value;
}}
const handler = {construct(target, args){
    callback_spy1(...args)
    callback_check_error(...args)
    callback_logger(...arguments)
    const instance = new target(...args)
    return new Proxy(instance, handler_get)
},
get(target, prop, receiver){
    callback_spy2(property);
    let value = Reflect.get(...arguments);
    if(isValueValidForProxy(value) return new Proxy(value, handler_apply)
    else return value;
}
}
```
### With ProxyTracker
it's enougth to write this:
```js
const handler = [{construct: [callback_spy1, callback_logger, callback_check_error], get: callback_spy2},
```    
Stop. Only this.

## Utilization
### creation of Proxy
`entity_to_track`: Object | Class | Instance | Array | Function
`handler_track`: Object
Return: same type of entity_to_track, as workd [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy)
`handler_track` has keys named in the traps list of [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy), and each value is a function, an array of function and Object, or an Object recursively

```js
const {ProxyTracker} = require('proxy-tracker')
const entity_tracked = new ProxyTracker(entity_to_track, handler_track)
```

### example of logging and check error for a class
```js
const checkErrorConstruct = function(target, [first_arg, second_arg]){assert(typeof fist_arg === 'number' && typeof second_arg === 'number')}
const checkErrorMethod = function(target, thisArg, args){if(target.name === 'sum') assert(typeof args[0] === 'number')}
const logger = console.log;
const entity_to_track = class {
    static staticMethod(arg){return arg}
    constructor(first, second){
        this.value = first + second // it's only ad example
    }
    sum(add){
        this.value += add
        return this.value
    }
}
const handler_track = {apply: logger, construct: [checkErrorConstruct, logger, {get: {apply: [checkErrorMethod, logger]}}]}

const entity_tracked = new ProxyTracker(entity_to_track, handler_track)

// example of use
new entity_tracked('string') // --> assert error
const instance = new entity_tracked(5,8) // --> console.log(entity_tracked, [5,8])
instance.sum('string') // --> assert error
instance.sum(4) // --> console.log([Function sum], thisArg, [4])
```
