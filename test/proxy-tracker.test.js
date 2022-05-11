/* global Promise, describe, it, __dirname, process*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyExtension, ProxyTracker} = require(`../proxy-tracker.js`);

const t = {};
Object.freeze(t);

describe('ProxyExtension', () => {
  let classe;
  beforeEach(()=>{
    classe = class{
      constructor(arg){this.argomenti = arg; this.constr = 5;}
      met1(){this.uno = 1; return 'called'}
      met2(arg){this.due = arg; return 'called'}
    };
  });
  it('creazione proxy con handler {vuoto} -> no errore', () => {
    expect(()=>{new ProxyExtension(classe, {});}).to.not.throw();
    let proxy = new ProxyExtension(classe, {});
    expect(()=>{new proxy();}).to.not.throw();
  });
  it.skip('creazioen proxy con handler {get} ->', () => {
    // non va bene questo test, ho implmentato diversamente proxy-extension
    const handler = {get: function(target, prop, receiver){
                        return Reflect.get(...arguments);
                        //return 'valore generato da proxy';
                    }};
    let proxy = new ProxyExtension(classe, handler);
    let istanza = new proxy();
    expect(istanza.constr).to.equal(5);
    expect(istanza.parametro).to.equal('valore generato da proxy');
  });
  it('un solo handler = oggetto', () => {
    const bridge = [];
    const handler = {
      construct:  function(target, arg, newtarget){
        bridge.push('construct');
        return  new target(...arg);
      }
    };
    const proxy = new ProxyExtension(classe, handler);
    let istanza;
    expect(()=>{istanza = new proxy(2);}).to.not.throw();
    expect(bridge).to.include.members(['construct']);
    expect(istanza.met2(3)).to.equal('called');
    expect(istanza.due).to.equal(3);
    expect(istanza.constr).to.equal(5);
    expect(istanza.argomenti).to.equal(2);
  });
  it('due handler, primo callback', () => {
    const bridge = [];
    const handler = (handler)=>{return{
      construct:  function(target, arg, newtarget){
        bridge.push('construct');
        return  new Proxy(new target(...arg), handler);
      }
    }};
    const handler_istanza = {
      get(target, prop, receiver){
        bridge.push('get');
        return Reflect.get(...arguments);
      }
    };
    const proxy = new ProxyExtension(classe, handler, handler_istanza);
    let istanza;
    expect(()=>{istanza = new proxy(2);}).to.not.throw();
    expect(istanza.met2(3)).to.equal('called');
    expect(istanza.due).to.equal(3);
    expect(istanza.constr).to.equal(5);
    expect(istanza.argomenti).to.equal(2);
    expect(bridge).to.include.members(['construct', 'get']);
  });
  
});

describe('ProxyTracker', () => { // la maggior parte di questtest (che sono skip) li faccio quando integro la possibilità di inere anche callbackss sena bisgono di metterle in oun oggetto}
  let classe;
  beforeEach(()=>{
    classe = class{
      constructor(arg){this.argomenti = arg; this.constr = 5;}
      met1(){this.uno = 1; return 'called'}
      met2(arg){this.due = arg; return 'called'}
    };
  });
  it('ProxyTracker(target, nulla) -> no errore ->', () => {
    expect(()=>{new ProxyTracker(classe)}).to.not.throw();

  });
  it.skip('ProxyTracker(target, valore diverso da callaback e object) -> errore', () => {
    expect(()=>{new ProxyTracker(classe, 5)}).to.throw(TypeError);
    expect(()=>{new ProxyTracker(classe, 'stringa')}).to.throw(TypeError);
  });
  it.skip('ProxyTracker(target, callback anonima) -> errore', () => {
    expect(()=>{new ProxyTracker(classe, ()=>{/* corpo */})}).to.throw(TypeError);
  });
  it.skip('ProxyTracker(target, callback non anonima, callback anonima) -> errore', () => {
    expect(()=>{new ProxyTracker(classe, function f1(){}, ()=>{/* corpo */})}).to.throw(TypeError);
  });
  it.skip('ProxyTracker(target, callback) -> ', () => {
    
  });
  it.skip('ProxyTracker(target, callback, callback, callback, ...) -> ', () => {
    
  });
  it.skip('ProxyTracker(target, {callback anonima}', () => {
    
  });
  it.skip('ProxyTracker(target, {callback non anonima}', () => {
    
  });
  it.skip('ProxyTracker(target, {callback non anonima, callback anonima}', () => {
    
  });
  it.skip('ProxyTracker(target, {callback non anonima, callback non anonima}', () => {
    
  });
  it.skip('ProxyTracker(target, {callback non anonima}, {callback non anonima}', () => {
    
  });
  it.skip('ProxyTracker(target, {nome: {callback non anonima}}', () => {
    
  });
  it.skip('ProxyTracker(target, {nome: {callback anonima}} -> errore', () => {
    
  });
  it.skip('ProxyTracker(target, {nome: {nome2: {callback non anonima}}}', () => {
    
  });
  it.skip('ProxyTracker(target, {nome: {nome2: callback non anonima}}', () => {
    
  });
  it.skip('ProxyTracker(target, {nome: {nome2: {callback}}}, {nome: {nome3: callback}}', () => {
    
  });
  
  describe('inserimento delle callback', () => {
    describe('in classe', ()=>{
      let classe;
      let bridge;
      function cb1(...args){bridge.push(`callback cb1 chiamata`);}
      function cb2(...args){bridge.push(`callback cb2 chiamata`);}
      function cb3(...args){bridge.push(`callback cb3 chiamata`);}
      
      beforeEach(()=>{
        bridge = [];
        classe = class{
          constructor(arg){this.argomenti = arg; this.constr = 5; this.obj = {}}
          met1(){this.uno = 1; return 'called'}
          met2(arg){this.due = arg; return 'called'}
          static met3(){}
        };
      });
      it('handler = {construct: callback} inserisce la callback in construct', () => {
        const handler = {construct: cb1};
        let track = new ProxyTracker(classe, handler);
        new track(5);
        expect(bridge).to.be.an('array').that.include(`callback cb1 chiamata`);
      });
      it('handler = {construct: {get: {apply}}} inserisce la callback in apply e non in construct o get', () => {
        const handler = {construct: {get: {apply: cb1}}};
        
        const {generaHandlerForProxyTrack} = require(`../proxy-tracker.js`).test;
        let track = new ProxyTracker(classe, handler);
   
        let istanza = new track(5);
        expect(bridge).to.be.an('array').that.not.include(`callback cb1 chiamata`);
        istanza.met1;
        expect(bridge).to.be.an('array').that.not.include(`callback cb1 chiamata`);
        istanza.met1();
        expect(bridge).to.be.an('array').that.include(`callback cb1 chiamata`);
   
      });
      it('handler = {construct: callback}, {get: callback} inserisce la callback in construct, e in get, ma non in apply', () => {
        const handler1 = {construct: cb1};
        const handler2 = {get: cb2};
        let track = new ProxyTracker(classe, handler1, handler2);
        
        track.met3;
        expect(bridge).to.be.an('array').that.include(`callback cb2 chiamata`);
        let istanza = new track(5);
        expect(bridge).to.be.an('array').that.include(`callback cb1 chiamata`);
      });
      it('inserisce 2 callback in construct, e una in get->apply', () => {
        const handler = [{construct: [cb1, cb3]},
                         {construct: {get: {apply: cb2}}}];
    
          
        let track = new ProxyTracker(classe, ...handler);
        
        track.met3;
        expect(bridge).to.eql([]);
        let istanza = new track(5);
        expect(bridge).to.eql([`callback cb1 chiamata`, `callback cb3 chiamata`]);
        expect(istanza.obj).to.satisfy((val)=>util.types.isProxy(val));
        expect(bridge).to.eql([`callback cb1 chiamata`, `callback cb3 chiamata`]);
        expect(istanza.met1).to.satisfy((val)=>util.types.isProxy(val));
        expect(bridge).to.eql([`callback cb1 chiamata`, `callback cb3 chiamata`]);
        expect(istanza.met1(1,2)).to.eql('called');
        expect(bridge).to.eql([`callback cb1 chiamata`, `callback cb3 chiamata`, `callback cb2 chiamata`]);
        expect(istanza.met1(1,2)).to.satisfy((val)=>!util.types.isProxy(val));
      });
    });
  });
});

if(ambiente === 'test'){
  const {generaHandlerForProxyTrack ,generaHandlerForProxy} = require(`../proxy-tracker.js`).test;
  describe('test funzioni interne', () => {
    describe('generaHandler', () => {
      it('handler_track vuoto, {} -> return {}', () => {
        assert.deepEqual(generaHandlerForProxy(undefined), {});
        assert.deepEqual(generaHandlerForProxy({}), {});
      });
      it('handler_track con parametro non incluso nelle trappole di Proxy -> errore', () => {
        const handler = {nonesistenelproxy(arg){}};
        assert.throws(()=>{generaHandlerForProxy(handler);}, TypeError);
      });
      describe('handler_track con solo un parametro ritorna un oggetto con una sola funzione', () => {
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
          expect(handler_generato).to.be.an('object').that.have.all.keys('apply', 'construct')
          expect(handler_generato).have.property('construct').that.to.be.a('function');
          expect(handler_generato).have.property('apply').that.to.be.a('function');
        });
      });
  
    });
    describe('genera handlers track', () => { // la maggior parte di questtest (che sono skip) li faccio quando integro la possibilità di inere anche callbackss sena bisgono di metterle in oun oggetto}
      function cb1(){}
      function cb2(){}
      function cb3(){}
      function cb8(){}
      it.skip('handler = undefined -> no error', () => {
        assert.doesNotThrow(()=>{generaHandlerForProxyTrack(undefined);});
      });
      it('handler = {} -> no error', () => {
        let handler;
        assert.doesNotThrow(()=>{handler = generaHandlerForProxyTrack({});});
      });
      it.skip('handler = {} o undefined -> return ..', () => {
        
      });
      for(let value of [[], [1,2,3], ['nome']/*, null*/, true, false, 0, -8, 5, 'stringa']){
        it.skip(`handler = ${util.inspect(value)} -> errore`, () => {
          assert.throws(()=>{generaHandlerForProxyTrack(value);}, /elemento deve essere function, object, o array/);
        });
      }
      it.skip('handler = callback anonima -> errore', () => {

      });
      it.skip('handler = callback -> return {callback}', () => {

      });
      it.skip('handler = {callback} -> return {callback}', () => {

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

