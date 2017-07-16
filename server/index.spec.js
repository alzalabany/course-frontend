const request = require('supertest');
const assert = require('assert');
const app = require('./index.js');
// const url = 'http://localhost:8000/';

function count(main_str, sub_str) {
  return (String(main_str).toLowerCase().match(new RegExp(String(sub_str).toLowerCase(), 'gi')) || []).length
}
const dbShape = [ 'forms', 'companies', 'groups', 'ingredients', 'sizes', 'drugs' ];

describe('Dawaya Server Tests', function () {

  describe('/Download route', function () {
    
    it('respond with json object', function(done) {
        request(app)
        .get('/download')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect(200,done)
    }); 
    it('respond is a true object', function(done) {
      request(app)
        .get('/download')
        .set('Accept', 'application/json')
        .end(function(err, response){
          assert.ok(!err);
          assert.ok(typeof response.body === 'object');
          assert.ok(Array.isArray(response.body) === false);
          return done();
        });
    }); 
    
    
      it('it should have all 5 keys in repsonse', function(done) {
        
        request(app)
        .get('/download')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, response){
          let keys = Object.keys(response.body);
          // all 6 eys exists
          assert.ok(keys.length===5);
          // make sure all keys exists
          assert.ok( dbShape.filter(i=>keys.indexOf(i)===-1).length===1);

          return done();
        });
      });
    
  })

  describe('/ route', function () {
    it('return json with code 200', function(done) {
      request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect(200, done);
    }); 
    it('respond is a object with daways db shape', function(done) {
      request(app)
        .get('/')
        .set('Accept', 'application/json')
        .end(function(err, response){
          assert.ok(!err);
          assert.ok(typeof response.body === 'object');
          assert.equal(Object.keys(response.body.drugs).length, 100);
          return done();
        });
    }); 
    it('it should return 20 drug', function(done) {
      request(app)
      .get('/')
      .query({ count: 20 })
      .set('Accept', 'application/json')
      .end(function(err, response){
        assert.strictEqual(Object.keys(response.body.drugs).length, 20);
        return done();
      });
    }); 
  }); 
})