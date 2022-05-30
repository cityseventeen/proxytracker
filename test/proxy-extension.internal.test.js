/* global Promise, describe, it, __dirname, process*/
const {expect, assert} = require('chai');
const util = require('util');

const ENVIRONMENT = process.env.NODE_ENV;

const t = { args_for_testing_traplist: [{}, undefined, undefined],
            args_for_testing_modifiesHandler: [{}, undefined],
            cb1: function cb1(){},
            cb2: function cb2(){}};
Object.freeze(t);


if(ENVIRONMENT === 'dev'){
  const {handlerWithLastCallbackSeparedInNewParameter} = require(`../src/proxy-extension.js`).test;
  describe('Internal function Proxy Extension', function () {
    it('handlerWithLastCallbackSeparedInNewParameter is a function', () => {
      expect(handlerWithLastCallbackSeparedInNewParameter).to.be.a('function');
    });
    it('if cbs = array of one element, cbs will [] and ret will have this element', () => {
      const handler = {trap: {cbs: [t.cb1], hds: undefined}};
      handlerWithLastCallbackSeparedInNewParameter(handler);
      expect(handler.trap.ret).to.eql(t.cb1);
      expect(handler.trap.cbs).to.eql([]);
    });
    it('if cbs = array of zero element, cbs will [] and ret will have undefined', () => {
      const handler = {trap: {cbs: [], hds: undefined}};
      handlerWithLastCallbackSeparedInNewParameter(handler);
      expect(handler.trap.ret).to.eql(undefined);
      expect(handler.trap.cbs).to.eql([]);
    });
    it('if cbs = array of two elements, cbs will [first element] and ret will have the second element', () => {
      const handler = {trap: {cbs: [t.cb1, t.cb2], hds: undefined}};
      handlerWithLastCallbackSeparedInNewParameter(handler);
      expect(handler.trap.ret).to.eql(t.cb2);
      expect(handler.trap.cbs).to.eql([t.cb1]);
    });
    it('trappole innestate, expected complesso', () => {
      const handler = {trap: {cbs: [t.cb1, t.cb2], hds: undefined}, trap2: {cbs: [t.cb1], hds:{
                                                                                                trap1: {cbs: [t.cb1, t.cb2], hds: undefined}
                                                                                              }
                                                                           },
                                                                    trap3: {cbs: [], hds:{
                                                                                         trap1: {cbs: [t.cb1],
                                                                                                 hds: {trap4: {cbs: [t.cb1, t.cb2], hds: undefined}}
                                                                                                }
                                                                                        }
                                                                            }
                      };
      handlerWithLastCallbackSeparedInNewParameter(handler);
      expect(handler.trap.ret).to.eql(t.cb2);
      expect(handler.trap.cbs).to.eql([t.cb1]);
      
      expect(handler.trap2.ret).to.eql(t.cb1);
      expect(handler.trap2.cbs).to.eql([]);
      
      expect(handler.trap2.hds.trap1.ret).to.eql(t.cb2);
      expect(handler.trap2.hds.trap1.cbs).to.eql([t.cb1]);
      
      expect(handler.trap3.ret).to.eql(undefined);
      expect(handler.trap3.cbs).to.eql([]);
      
      expect(handler.trap3.hds.trap1.ret).to.eql(t.cb1);
      expect(handler.trap3.hds.trap1.cbs).to.eql([]);
      
      expect(handler.trap3.hds.trap1.hds.trap4.ret).to.eql(t.cb2);
      expect(handler.trap3.hds.trap1.hds.trap4.cbs).to.eql([t.cb1]);
    });
  });
  
}