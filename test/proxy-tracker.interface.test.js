/* global Promise, describe, it, __dirname, process, Reflect*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyExtension, ProxyTracker} = require(`../proxy-tracker.js`);

const t = {};
Object.freeze(t);

describe('ProxyTracker - Interfaccia argomenti errati o giusti', () => {
  let classe;
  beforeEach(()=>{
    classe = class{
      constructor(arg){this.argomenti = arg; this.constr = 5;}
      met1(){this.uno = 1; return 'called';}
      met2(arg){this.due = arg; return 'called';}
    };
  });
  const handler_corretto = {get: function(){}};
  it('ProxyTracker(target, nulla) -> no errore', () => {
    expect(()=>{new ProxyTracker(classe);}).to.not.throw();

  });
  it('ProxyTracker(target, undefined) -> no errore', () => {
    expect(()=>{new ProxyTracker(classe, undefined);}).to.not.throw();
  });
  it('ProxyTracker(target, undefined, {}) -> no errore', () => {
    expect(()=>{new ProxyTracker(classe, undefined, {});}).to.not.throw();
  });
  it('ProxyTracker(target, undefined, handler_corretto) -> no errore', () => {
    expect(()=>{new ProxyTracker(classe, undefined, handler_corretto);}).to.not.throw();
  });
  it('ProxyTracker(target, handler_corretto, {}) -> no errore', () => {
    expect(()=>{new ProxyTracker(classe, handler_corretto, undefined);}).to.not.throw();
  });
  it('ProxyTracker(target, {}) -> no errore ', () => {
    expect(()=>{new ProxyTracker(classe, handler_corretto, undefined);}).to.not.throw();
  });
  it('ProxyTracker(target, {any_trap: undefined}), ovvero senza callback definite -> no errore ', () => {
    expect(()=>{new ProxyTracker(classe, {construct: undefined});}).to.not.throw();
  });
  
  it('ProxyTracker(target, valore diverso da object) -> errore', () => {
    for(let handler_errato of [5, 0, -8, 'stringa', function Construct(){}, [1,2,3], false, true, [function Construct(){}]])
      expect(()=>{new ProxyTracker(classe, handler_errato);}).to.throw(TypeError, 'handler deve essere un oggetto');
  });
  it('ProxyTracker(target, {callback anonima -> non esiste cb anonima, ma si chiama function } -> errore perché nome non appartiene a nome trappole', () => {
    expect(()=>{new ProxyTracker(classe, {function(){}});}).to.throw('La trappola non è del tipo previsto da Proxy');
  });
  for(let target_wrong of [undefined, 0, -8, 5, true, false, "string"]){
    it(`ProxyTracker(target_wrong, handler corretto) -> errore`, () => {
      expect(()=>{new ProxyTracker(target_wrong, handler_corretto);}).to.throw('Cannot create proxy with a non-object');
    });
  }
  for(let target_corretto of [{}, [], class classe{}, String, Number, Object, Array]){
    expect(()=>{new ProxyTracker(target_corretto, handler_corretto);}).to.not.throw();
  }
});