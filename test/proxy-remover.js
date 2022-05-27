/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyTracker, ORIGIN} = require(`../proxy-tracker.js`);
const {createDerivedFromProxy} = require('./test.support.js');

const t = {};
Object.freeze(t);

describe.only('Removing of proxy', () => {
  const cb = function(bridge){return function(){bridge.push('callback called');};};
  let bridge;
  let classe;
  beforeEach(()=>{
    classe =  class {};
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
  it('trap get with symbol const origin return origin entity', () => {
    const proxy = new ProxyTracker(classe, {get: cb(bridge)});
    expect(util.types.isProxy(proxy)).to.be.true;
    const removed_proxy = proxy[ORIGIN];
    expect(bridge).to.be.an('array').that.not.include('callback called');
    expect(util.types.isProxy(removed_proxy)).to.be.false;
    expect(removed_proxy).to.equal(classe);
    
  });
});

describe('removing proxy from entity with non writable descriptor', () => {
  
});
describe('removing proxy with origin handler not writable', () => {
  
});
