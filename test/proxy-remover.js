/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyTracker, ProxyRemover} = require(`../proxy-tracker.js`);
const {createDerivedFromProxy} = require('./test.support.js');

const t = {};
Object.freeze(t);

describe('Removing of proxy', () => {
  const cb = function(bridge){return function(){bridge.push('callback called');};};
  let bridge;
  let classe;
  beforeEach(()=>{
    classe =  class {static proxyReturn(){return {param: 'value'}}};
    bridge = [];  
  });
  
  it('any trap different from get is called', () => {
    const any_parameter = 'prop';
    const proxy = new ProxyTracker(classe, {construct: cb(bridge)});
    
    expect(util.types.isProxy(proxy)).to.be.true;
    new proxy();
    expect(bridge).to.be.an('array').that.include('callback called');
  });
  it('get trap absent doesnt throw error', () => {
    const any_parameter = 'prop';
    const proxy = new ProxyTracker(classe, {});
    
    expect(util.types.isProxy(proxy)).to.be.true;
    expect(()=>{proxy[any_parameter]}).to.not.throw();
  });
  it('trap get without symbol const origin is called', () => {
    const any_parameter = 'prop';
    const proxy = new ProxyTracker(classe, {get: cb(bridge)});
    proxy[any_parameter];
    expect(util.types.isProxy(proxy)).to.be.true;
    expect(bridge).to.be.an('array').that.include('callback called');
  });
  it('removin proxy from entity with trap get', () => {
    const proxy = new ProxyTracker(classe, {get: cb(bridge)});
    expect(util.types.isProxy(proxy)).to.be.true;
    
    proxy['any_param'];
    expect(bridge).to.be.an('array').that.include('callback called');
    bridge.pop();
    
    const removed_proxy = ProxyRemover(proxy);
    expect(util.types.isProxy(removed_proxy)).to.be.false;
    expect(bridge).to.be.an('array').that.not.include('callback called');
    expect(removed_proxy).to.equal(classe);
  });
  it('removin proxy from entity that hasnt trap get', () => {
    const proxy = new ProxyTracker(classe, {set: cb(bridge)});
    expect(util.types.isProxy(proxy)).to.be.true;
    
    proxy['any_param'] = 'value';
    expect(bridge).to.be.an('array').that.include('callback called');
    bridge.pop();
    
    const removed_proxy = ProxyRemover(proxy);
    expect(util.types.isProxy(removed_proxy)).to.be.false;
    expect(bridge).to.be.an('array').that.not.include('callback called');
    expect(removed_proxy).to.equal(classe);
  });
  it('removing proxy from proxy returned by trap', () => {
    const proxy = new ProxyTracker(classe, {get: {apply: {get: cb(bridge)}}});
    expect(util.types.isProxy(proxy)).to.be.true;
    const value_proxy_returned_by_trap = proxy.proxyReturn();
    expect(util.types.isProxy(value_proxy_returned_by_trap)).to.be.true;
    
    value_proxy_returned_by_trap['any_param'];
    expect(bridge).to.be.an('array').that.include('callback called');
    bridge.pop();
    
    const removed_proxy = ProxyRemover(value_proxy_returned_by_trap);
    expect(util.types.isProxy(removed_proxy)).to.be.false;
    expect(bridge).to.be.an('array').that.not.include('callback called');
  });
  it.skip('remover to non proxy throws error', () => {
    
  });
  it.skip('remover to proxy that isnt created by ProxyTracker throws error', () => {
    
  });
});

describe('removing proxy from entity with non writable descriptor', () => {
  
});
describe('removing proxy with origin handler not writable', () => {
  
});
