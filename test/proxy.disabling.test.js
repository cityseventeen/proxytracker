/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');
const ChangeEnv = require('change-env')(require);

const ENVIRONMENT = process.env.NODE_ENV;

const {ProxyTracker, ProxyExtension} = require(`../proxy-tracker.js`);
const errors = require('../src/errors.js').errors.message;

const t = {entity_obj: {prop: 5, met: function(){return {prop_nested: 'value', met_nested: function(){return {prop_nested2: 'value'};}};}}};
Object.freeze(t);

function cbs(bridge, trap){
  this.cb_ret = function (...args){bridge.push(`${trap} callback called`); return Reflect[trap](...args);};
  this.cb = function (...args){bridge.push(`${trap} callback called`); let [, ...trap_args] = args; return Reflect[trap](...trap_args);};
  this.cb01 = function(){};
  this.cb02 = function(){};
  return this;
}
describe.only('disabling proxy feature for trap', () => {
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
describe.only('internal handler track generator', () => {
  let bridge;
  beforeEach(()=>{
    bridge = [];
  });
  ChangeEnv('dev', ()=>{
    const {generaHandlerForProxyTrack} = require(`../proxy-tracker.js`).test;
    it('name: single value return expected', () => {
      const cb01 = cbs(bridge).cb01;
      const cb02 = cbs(bridge).cb02;
      const handler = {get: [cb01, {FOR: 'prop1', get: cb02}]};
      const expected = {get: {cbs: [cb01], hds: undefined, FOR: [{NAME: 'prop1', get: {cbs: [cb02], hds: undefined}}]}};
      expect(generaHandlerForProxyTrack(handler)).to.eql(expected);
    });
    
    describe('wrong value', () => {
      for(let wrong of [['array string'], {key: 'value'}, function(){return 'value';}, 0,-8,+5,true, false]){
        it(`name of FOR ${wrong} that isnt string or undefined throws error`, () => {
          const handler = {get: {FOR: wrong, get: function(){}}};
          expect(()=>{generaHandlerForProxyTrack(handler);}).to.throw(errors.name_for_in_handler_isnt_string);
        });
      }
    });
    
  }, `../proxy-tracker.js`);
});
