/* global Promise, describe, it, __dirname, process*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const t = {};
Object.freeze(t);


// test aggiuntivi
  /*    it('handler_track vuoto, {} -> return objec with get trap for remover proxy function', () => {
        expect(generaHandlerForProxy({})).to.be.an('object');
        .that.have.all.keys('get').and.that.have.property('get').that.to.be.a('function');
      });
        it('che ha solo una callback', () => {
          const callback_da_applicare = function(...arg){};
          const handler = {apply: [callback_da_applicare]};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('apply', 'get').and.that.have.property('apply').that.to.be.a('function');
        });
*/

if(ambiente === 'dev'){
  const {generaHandlerForProxyTrack ,generaHandlerForProxy} = require(`../proxy-tracker.js`).test;
  describe('test funzioni interne', () => {
    describe('generaHandler - diverse prove', () => {
      it('handler_track vuoto, {} -> return object {}', () => {
        expect(generaHandlerForProxy({})).to.be.an('object');
      });
      it('handler_track con parametro non incluso nelle trappole di Proxy -> errore', () => {
        const handler = {nonesistenelproxy(arg){}};
        assert.throws(()=>{generaHandlerForProxy(handler);}, TypeError, 'La trappola non è del tipo previsto da Proxy');
      });
      describe('handler_track con solo un parametro ritorna un oggetto con una sola funzione', () => {
        it('che ha solo una callback in get', () => {
          const callback_da_applicare = function(...arg){};
          const handler = {get: [callback_da_applicare]};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('get').and.that.have.property('get').that.to.be.a('function');
        });
        it('che ha solo una callback', () => {
          const callback_da_applicare = function(...arg){};
          const handler = {apply: [callback_da_applicare]};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('apply').and.that.have.property('apply').that.to.be.a('function');
        });
        it('che ha due callback', () => {
          const callback_da_applicare = function(...arg){};
          const handler = {apply: [callback_da_applicare, callback_da_applicare]};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('apply').and.that.have.property('apply').that.to.be.a('function');
        });
        it('che ha una callback e un oggetto tipo handler_track', () => {
          const callback_da_applicare = function(...arg){};
          const handler_track_innestato = {apply: [callback_da_applicare]};
          const handler = {apply: [callback_da_applicare, callback_da_applicare, handler_track_innestato]};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('apply').and.that.have.property('apply').that.to.be.a('function');
        });
        it('senza callback con solo oggetotipo handler_track', () => {
          const callback_da_applicare = function(...arg){};
          const handler_track_innestato = {apply: [callback_da_applicare]};
          const handler = {apply: [handler_track_innestato]};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('apply').and.that.have.property('apply').that.to.be.a('function');
        });
        it('handler_track con trappola senza callback e senza handler', () => {
          const handler = {apply: []};
          expect(generaHandlerForProxy(handler)).to.be.an('object').that.have.all.keys('apply').and.that.have.property('apply').that.to.be.a('function');
        });
      });
      describe('handler_track con più parametri -> ritorna oggetto con più funzioni', () => {
        it('entrambi i parametri hanno callback e handler_innestati', () => {
          const callback_da_applicare = function(...arg){};
          const handler_track_innestato = {get: [callback_da_applicare]};
          const handler_track = {construct: [callback_da_applicare, callback_da_applicare, handler_track_innestato, callback_da_applicare],
                                 apply: [handler_track_innestato, callback_da_applicare]};
          expect(generaHandlerForProxy(handler_track)).to.be.an('object').that.have.all.keys('apply', 'construct')
                  .and.that.have.property('construct').that.to.be.a('function');    
        });
        it('profondità handler innestati maggiore di 2', () => {
          const callback_da_applicare = function(...arg){};
          const handler_track_innestato = {get: [callback_da_applicare]};
          const handler_track_innestato2 = {apply: [callback_da_applicare]};
          const handler_track = {construct: [callback_da_applicare, callback_da_applicare, {get: [handler_track_innestato2]}, callback_da_applicare],
                                 apply: [handler_track_innestato, callback_da_applicare]};
          const handler_generato = generaHandlerForProxy(handler_track);
          expect(handler_generato).to.be.an('object').that.have.all.keys('apply', 'construct');
          expect(handler_generato).have.property('construct').that.to.be.a('function');
          expect(handler_generato).have.property('apply').that.to.be.a('function');
        });
      });
  
    });
    describe('genera handlers track - funzioni non anonime', () => {
      const function_fake_anonymous = function(){};
      const function_that_return_anonymous = function(){return function(){};};
      const function_named_that_return_anonymous = function name_function(){return function(){};};
      
      const handlers = [{type: 'function(){}', handler: {get: function(){}}},
                        {type: 'name_function', handler: {get: function_fake_anonymous}},
                        {type: 'function_that_return_function', handler: {apply: function_that_return_anonymous()}},
                        {type: 'function_that_return_function', handler: {apply: function_named_that_return_anonymous()}}
      ];
      for(let h of handlers){
        it(`{trap: ${h.type}} non è anonima`, () => {
          expectFunctionIsntAnonymous(h.handler);
       });
      }
    });
    function expectFunctionIsntAnonymous(handler){
      assert.doesNotThrow(()=>{generaHandlerForProxyTrack(handler);});
    }
    
    describe('genera handlers track - diverse prove', () => { // la maggior parte di questtest (che sono skip) li faccio quando integro la possibilità di inere anche callbackss sena bisgono di metterle in oun oggetto}
      function cb1(){}
      function cb2(){}
      function cb3(){}
      function cb8(){}
      it('handler = {} -> no error', () => {
        assert.doesNotThrow(()=>{generaHandlerForProxyTrack({});});
      });
      it('handler = undefined -> no error', () => {
        assert.doesNotThrow(()=>{generaHandlerForProxyTrack(undefined);});
      });
      it('handler = nulla -> no error', () => {
        assert.doesNotThrow(()=>{generaHandlerForProxyTrack();});
      });
      for(let handler of [[], [1,2,3], ['nome']/*, null*/, true, false, 0, -8, 5, 'stringa']){
        it(`handler = ${util.inspect(handler)} -> errore`, () => {
          assert.throws(()=>{generaHandlerForProxyTrack(handler);}, 'handler deve essere un oggetto');
        });
      }
      for(let handler of [{construct: 1}, {construct: 0}, {construct: -8}, {construct: true}, {construct: false},
                          {construct: [1,2,3]}, {construct: 'stringa'}, {construct: true}])
      {
        it(`handler = oggetto mal formato ${util.inspect(handler)}-> errore`, () => {
          assert.throws(()=>{generaHandlerForProxyTrack(handler);}, 'elemento deve essere function, object, o array');
        });
      }
      it('handler = nulla -> return expected', () => {
        const handler_track = generaHandlerForProxyTrack();
        const expected = undefined;
        assert.deepEqual(handler_track, expected);
      });
      it('handler = undefined -> return expected', () => {
        const handler = undefined;
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = undefined;
        assert.deepEqual(handler_track, expected);
      });
      it('handler = {} -> return expected', () => {
        const handler = {};
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {};
        assert.deepEqual(handler_track, expected);
      });
      it('handler = {trap es get: {}} -> return expected', () => {
        const handler = {get: {}};
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {}; expected['get'] = {cbs: [], hds: {}};
        console.dir(expected);
        console.dir(handler_track);
        assert.deepEqual(handler_track, expected);
      }); 
      
      it('handler = {callback con NOME} -> return expected', () => {
        const handler = {cb1};
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {}; expected[cb1.name] = {cbs: [cb1], hds: undefined};
        assert.deepEqual(handler_track, expected);
      });
      it('handler = {callback n1, callback n2} -> return expected', () => {
        const handler = {cb1, cb2};
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {}; expected[cb1.name] = {cbs: [cb1], hds: undefined};
                             expected[cb2.name] = {cbs: [cb2], hds: undefined};
        assert.deepEqual(handler_track, expected);
      });
      it('handler = {nome: callback, callback nome2} -> return expected', () => {
        const nome = function(){};
        const nomediverso = function altronome(){};
        const nome5 = function(){};
        const nooome = function NOOOME(){};
        const handler = {nome, nome2: cb1, nome3: nomediverso, nome4: nome5, nooome};
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {}; expected['nome'] = {cbs: [nome], hds: undefined};
                             expected['nome2'] = {cbs: [cb1], hds: undefined};
                             expected['nome3'] = {cbs: [nomediverso], hds: undefined};
                             expected['nome4'] = {cbs: [nome5], hds: undefined};
                             expected['nooome'] = {cbs: [nooome], hds: undefined};
        assert.deepEqual(handler_track, expected);
      });
      it('callback stesso nome vengono messe in stesso array', () => {
        const handler1 = {cb1: cb2};
        const handler2 = {cb1};
        const handler_track = generaHandlerForProxyTrack(handler1, handler2);
        const expected = {}; expected[cb1.name] = {cbs: [cb2, cb1], hds: undefined};
        assert.deepEqual(handler_track, expected);
      });
      it('handler = {nome: [cb1, cb2]} -> return expected', () => {
        const handler = {nome : [cb1, cb2]};
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {}; expected['nome'] = {cbs: [cb1, cb2], hds: undefined};
        assert.deepEqual(handler_track, expected);
      });
      it('handler = {{cb1: {cb2}} -> return expected', () => {
        const handler = [{cb1: {cb2}}];

        const handler_track = generaHandlerForProxyTrack(...handler);
        const expected = {}; expected[cb1.name] = {cbs: [], hds: {'cb2': {cbs: [cb2], hds: undefined}}};
        assert.deepEqual(handler_track, expected);
    
      });
      it('handler = {cb1}, {cb1: {cb2}} -> return expected', () => {
        const handler = [{cb1}, {cb1: {cb2}}];

        const handler_track = generaHandlerForProxyTrack(...handler);
        const expected = {}; expected[cb1.name] = {cbs: [cb1], hds: {cb2: {cbs: [cb2], hds: undefined}}};
        assert.deepEqual(handler_track, expected);
      });
      it('handler caso callback in construct e apply return expected in due handler', () => {
        const handler = [{construct: [cb1, cb3]},
                          {construct: {get: {apply: cb2}}}];
        const handler_track = generaHandlerForProxyTrack(...handler);
        const expected = {}; expected['construct'] = {cbs: [cb1, cb3], hds: {get: {cbs: [], hds: {apply: {cbs: [cb2], hds: undefined}}}}};
        assert.deepEqual(handler_track, expected);
      });
      it('handler caso callback in construct e apply return expected nello stesso handler', () => {
        const handler = {construct: [cb1, cb3, {get: {apply: cb2}}]};
    
        const handler_track = generaHandlerForProxyTrack(handler);
        const expected = {}; expected['construct'] = {cbs: [cb1, cb3], hds: {get: {cbs: [], hds: {apply: {cbs: [cb2], hds: undefined}}}}};
        assert.deepEqual(handler_track, expected);
      });
      it('caso completto riepilogativo -> return expected', () => {
        const handler = [{cb1}, {cb2}, {cb1: {cb2}, cb2: cb1}, {cb2: {cb2}}, {cb3: [cb1, cb2, cb1]}, {cb1, cb2: {cb0: cb8}, cb4: [cb1, {cb2}, {cb3: {cb1: {cb0: cb2}}}]}];

        const handler_track = generaHandlerForProxyTrack(...handler);
        const expected = {'cb1': {cbs: [cb1, cb1],
                                  hds: {'cb2': {cbs: [cb2],
                                                hds: undefined}}
                                 },
                          'cb2': {cbs: [cb2, cb1],
                                  hds: {'cb2': {cbs: [cb2],
                                                hds: undefined},
                                        'cb0': {cbs: [cb8],
                                                hds: undefined}
                                        }  
                                 },
                          'cb3': {cbs: [cb1, cb2, cb1],
                                  hds: undefined
                                 },
                          'cb4': {cbs: [cb1],
                                  hds: {'cb2': {cbs: [cb2],
                                                hds: undefined},
                                        'cb3': {cbs: [],
                                                hds: {'cb1': {cbs: [],
                                                              hds: {'cb0': {cbs: [cb2],
                                                                            hds: undefined}
                                                                   }
                                                             }
                                                     }
                                        }
                                  }
                          }
                };
        assert.deepEqual(handler_track, expected);
      });
      
    });
  });
}