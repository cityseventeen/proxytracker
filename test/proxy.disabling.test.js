/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');
const ChangeEnv = require('change-env')(require);

const ENVIRONMENT = process.env.NODE_ENV;

const {ProxyTracker, ProxyExtension} = require(`../proxy-tracker.js`);

const t = {entity_obj: {prop: 5, met: function(){return {prop_nested: 'value', met_nested: function(){return {prop_nested2: 'value'};}};}}};
Object.freeze(t);

describe.only('disabling proxy feature for trap', () => {
  function cbs(bridge, trap){
    this.cb_ret = function (...args){bridge.push(`${trap} callback called`); return Reflect[trap](...args);};
    this.cb = function (...args){bridge.push(`${trap} callback called`); let [, ...trap_args] = args; return Reflect[trap](...trap_args);};
    return this;}
  let bridge;
  beforeEach(()=>{
    bridge = [];
  });
  
  it('ProxyTracker: handler without dis_key doesnt throw error and work normally', () => {
    const handler = {get: {apply: [cbs(bridge, 'apply').cb, {get: cbs(bridge, 'get').cb}]}};
    const proxy_entity = new ProxyTracker(t.entity_obj, handler);
    
    proxy_entity.met; expect(bridge).to.eql([]);
    let value = proxy_entity.met(); expect(bridge).to.eql(['apply callback called']);
    expect(util.types.isProxy(value)).to.be.true;
    let value_nested = value.met_nested; expect(bridge).to.eql(['apply callback called', 'get callback called']);
    expect(util.types.isProxy(value_nested)).to.be.false;
  });
  it('ProxyExtension: handler without dis_key doesnt throw error and work normally', () => {
    const handler = {get: {apply: [cbs(bridge, 'apply').cb_ret, {get: cbs(bridge, 'get').cb_ret}]}};
    const proxy_entity = new ProxyExtension(t.entity_obj, handler);
    
    proxy_entity.met; expect(bridge).to.eql([]);
    let value = proxy_entity.met(); expect(bridge).to.eql(['apply callback called']);
    expect(util.types.isProxy(value)).to.be.true;
    let value_nested = value.met_nested; expect(bridge).to.eql(['apply callback called', 'get callback called']);
    expect(util.types.isProxy(value_nested)).to.be.false;
  });
});
