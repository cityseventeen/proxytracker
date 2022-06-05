/* global Promise, describe, it, __dirname, process, Reflect, Function*/
const {expect, assert} = require('chai');
const util = require('util');
const ChangeEnv = require('change-env')(require);

const ENVIRONMENT = process.env.NODE_ENV;

const {ProxyTracker, ProxyExtension} = require(`../proxy-tracker.js`);
const errors = require('../src/errors.js').errors.message;

const t = {entity_obj: {prop: {value: 5}, met: function(){return {prop_nested: {value: 'value'}, met_nested: function(){return {prop_nested2: 'value'};}, met_nested2(){return 8;}};},
                                 met_in_FOR: function(){return {prop_nested: {value: 'value'}, met_nested: function(){return {prop_nested2: 'value'};}, met_nested2(){return 8;}};}}};
Object.freeze(t);

function cbs(bridge, trap){
  this.cb_ret = function (...args){bridge.push(`${trap} callback called`); return Reflect[trap](...args);};
  this.cb = function (...args){bridge.push(`${trap} callback called`); let [, ...trap_args] = args; return Reflect[trap](...trap_args);};
  this.cb01 = function cb01(){};
  this.cb02 = function cb02(){};
  return this;
}
describe('disabling proxy feature for trap', () => {
  let bridge;
  beforeEach(()=>{
    bridge = [];
  });
  
  it('ProxyTracker: handler without key FOR doesnt throw error and work normally', () => {
    const handler = {get: {apply: [cbs(bridge, 'apply').cb, {get: cbs(bridge, 'get').cb}]}};
    const proxy_entity = new ProxyTracker(t.entity_obj, handler);
    
    proxy_entity.met; expect(bridge).to.eql([]);
    let value = proxy_entity.met(); expect(bridge).to.eql(['apply callback called']);
    expect(util.types.isProxy(value)).to.be.true;
    let value_nested = value.met_nested; expect(bridge).to.eql(['apply callback called', 'get callback called']);
    expect(util.types.isProxy(value_nested)).to.be.false;
  });
  it('ProxyExtension: handler without key FOR doesnt throw error and work normally', () => {
    const handler = {get: {apply: [cbs(bridge, 'apply').cb_ret, {get: cbs(bridge, 'get').cb_ret}]}};
    const proxy_entity = new ProxyExtension(t.entity_obj, handler);
    
    proxy_entity.met; expect(bridge).to.eql([]);
    let value = proxy_entity.met(); expect(bridge).to.eql(['apply callback called']);
    expect(util.types.isProxy(value)).to.be.true;
    let value_nested = value.met_nested; expect(bridge).to.eql(['apply callback called', 'get callback called']);
    expect(util.types.isProxy(value_nested)).to.be.false;
  });
  it('proxy tracker: handler with key FOR abilits handler only for name prop in FOR', () => {
    const handler = {get: {FOR: 'met_in_FOR', apply: [cbs(bridge, 'apply').cb, {get: cbs(bridge, 'get').cb}]}};
    const proxy_entity = new ProxyTracker(t.entity_obj, handler);
    
    proxy_entity.met; expect(bridge).to.eql([]);
    let value = proxy_entity.met(); expect(bridge).to.eql([]);
    expect(util.types.isProxy(value)).to.be.false;
    let value_nested = value.met_nested; expect(bridge).to.eql([]);
    expect(util.types.isProxy(value_nested)).to.be.false;
    
    proxy_entity.met_in_FOR; expect(bridge).to.eql([]);
    value = proxy_entity.met_in_FOR(); expect(bridge).to.eql(['apply callback called']);
    expect(util.types.isProxy(value)).to.be.true;
    value_nested = value.met_nested; expect(bridge).to.eql(['apply callback called', 'get callback called']);
    expect(util.types.isProxy(value_nested)).to.be.false;
  });
});
describe('internal handler track generator', () => {
  let bridge;
  beforeEach(()=>{
    bridge = [];
  });
  ChangeEnv('dev', ()=>{
    const {generaHandlerForProxyTrack} = require(`../proxy-tracker.js`).test;
    const NAME = generaHandlerForProxyTrack.CONST.NAME;
    it('name: single value return expected', () => {
      const cb01 = cbs(bridge).cb01;
      const cb02 = cbs(bridge).cb02;
      const handler = {get: [cb01, {FOR: 'prop1', get: cb02}]};
      const expected = {get: {cbs: [cb01], hds: undefined, FOR: [{[NAME]: 'prop1', get: {cbs: [cb02], hds: undefined}}]}};
      expect(generaHandlerForProxyTrack(handler)).to.eql(expected);
    });
    it('name: array of value return expected', () => {
      const cb01 = cbs(bridge).cb01;
      const cb02 = cbs(bridge).cb02;
      const handler = {get: [cb01, {FOR: ['prop1', 'prop2'], get: cb02}]};
      const expected = {get: {cbs: [cb01], hds: undefined, FOR: [{[NAME]: 'prop1', get: {cbs: [cb02], hds: undefined}}, {[NAME]: 'prop2', get: {cbs: [cb02], hds: undefined}}]}};
      expect(generaHandlerForProxyTrack(handler)).to.eql(expected);
    });
    it('complex case', () => {
      const cb01 = cbs(bridge).cb01;
      const cb02 = cbs(bridge).cb02;
      const handler =  [{get: [cb01, {FOR: ['prop1', 'prop2'], get: cb02}]},
                        {get: cb02},
                        {get: {FOR: 'prop3', apply: cb02}},
                        {has: [cb01, cb02]},
                        {apply: {FOR: 'prop1', get: cb01}},
                        {get: {FOR: 'prop1', get: cb01, has: cb02}},
                        {get: {FOR: ['prop1', 'prop3'], get: cb01, apply: cb02}},
                        {apply: cb01},
                        {set: {FOR: 'prop1', get: cb01}},
                        {set: {has: cb01}},
                        {trap1: {trap2: [cb01, {trap3: cb02}, {trap3: cb02}, {trap3: {trap4: cb01}}, {trap3: {FOR: 'prop8', trap8: {trap9: cb02}}}]}}
      ];
      const expected = {get: {cbs: [cb01], hds: undefined, FOR: [{[NAME]: 'prop1', get: {cbs: [cb02], hds: undefined}}, {[NAME]: 'prop2', get: {cbs: [cb02], hds: undefined}}]}};
      expected.get.cbs.push(cb02);
      expected.get.FOR.push({[NAME]: 'prop3', apply: {cbs: [cb02], hds: undefined}});
      expected.has = {cbs: [cb01, cb02], hds: undefined};
      expected.apply = {cbs: [], hds: undefined, FOR: [{[NAME]: 'prop1', get: {cbs: [cb01], hds: undefined}}]};
      expected.get.FOR[0].get.cbs.push(cb01); expected.get.FOR[0].has = {cbs: [cb02], hds: undefined};
      expected.get.FOR[0].get.cbs.push(cb01); expected.get.FOR[0].apply = {cbs: [cb02], hds: undefined};
      expected.get.FOR[2].get = {cbs: [cb01], hds: undefined}; expected.get.FOR[2].apply.cbs.push(cb02);
      expected.apply.cbs.push(cb01);
      expected.set = {cbs: [], hds: undefined, FOR: [{[NAME]: 'prop1', get: {cbs: [cb01], hds: undefined}}]};
      expected.set.hds = {has: {cbs: [cb01], hds: undefined}};
      expected.trap1 = {cbs: [], hds: {trap2: {cbs: [cb01], hds: {trap3: {cbs: [cb02, cb02], hds: {trap4: {cbs: [cb01], hds: undefined}},
            FOR: [{[NAME]: 'prop8', trap8: {cbs: [], hds: {trap9:{cbs: [cb02], hds: undefined} } }}]
          }}}}};
      
      expect(generaHandlerForProxyTrack(...handler)).to.eql(expected);
    });
    
    describe('wrong value', () => {
      for(let wrong of [{key: 'value'}, function(){return 'value';}, 0,-8,+5,true, false]){
        it(`name of FOR ${wrong} that isnt string or undefined throws error`, () => {
          const handler = {get: {FOR: wrong, get: function(){}}};
          expect(()=>{generaHandlerForProxyTrack(handler);}).to.throw(errors.name_for_in_handler_isnt_string);
        });
      }
    });
    
  }, `../proxy-tracker.js`);
});

describe('internal handler generator: extractReturningTrapsFromFOR', () => {
  ChangeEnv('dev', ()=>{
    const {generaHandlerForProxy} = require(`../proxy-tracker.js`).test;
    const extractReturningTrapsFromFOR = generaHandlerForProxy.extractReturningTrapsFromFOR;
    const trapList = generaHandlerForProxy.default_trapList;
    const NAME = Symbol('NAME');
    it('return expected', () => {
      const handler_track = {get: {cbs: [], hds: undefined, FOR: [{[NAME]: 'prop1', get: {cbs: [], hds: undefined}}, {[NAME]: 'prop2', apply: {cbs: [], hds: undefined}}]}};
      const handlersListByFOR = extractReturningTrapsFromFOR({NAME}, handler_track.get.FOR, trapList);
      const expected = {prop1: {get: Function}, prop2: {apply: Function}};
      for(let prop in expected){
        expect(handlersListByFOR).to.have.property(prop).that.is.an('object');
        expect(handlersListByFOR[prop]).to.have.all.keys(expected[prop]);
      }
    });
  }, `../proxy-tracker.js`);
});
