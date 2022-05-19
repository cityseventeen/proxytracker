/* global Promise, describe, it, __dirname, process*/
const {expect, assert} = require('chai');
const util = require('util');

const ambiente = process.env.NODE_ENV;

const {ProxyExtension, ProxyTracker} = require(`../proxy-tracker.js`);

const t = {};
Object.freeze(t);

describe('ProxyTracker - errori argomenti errati', () => { // la maggior parte di questtest (che sono skip) li faccio quando integro la possibilità di inere anche callbackss sena bisgono di metterle in oun oggetto}
  let classe;
  beforeEach(()=>{
    classe = class{
      constructor(arg){this.argomenti = arg; this.constr = 5;}
      met1(){this.uno = 1; return 'called'}
      met2(arg){this.due = arg; return 'called'}
    };
  });
  it('ProxyTracker(target, nulla) -> errore ->', () => {
    expect(()=>{new ProxyTracker(classe);}).to.throw();

  });
  it('ProxyTracker(target, undefined) -> errore ->', () => {
    expect(()=>{new ProxyTracker(classe);}).to.throw();

  });
  it('ProxyTracker(target, valore diverso da object) -> errore', () => {
    for(let handler_errato of [5, 0, -8, 'stringa', function Construct(){}, [1,2,3], false, true, [function Construct(){}]])
      expect(()=>{new ProxyTracker(classe, handler_errato);}).to.throw(TypeError, 'handler deve essere un oggetto');
  });
  it('ProxyTracker(target, {callback anonima -> non esiste cb anonima, ma si chiama function } -> errore perché nome non appartiene a nome trappole', () => {
    expect(()=>{new ProxyTracker(classe, {function(){}});}).to.throw('La trappola non è del tipo previsto da Proxy');
  });
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

