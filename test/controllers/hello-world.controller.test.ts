import {Application} from 'express';
import * as request from 'supertest';
import {ApiServer} from '../../src/server';

describe('Hello controller', () => {

  let app: Application;

  beforeAll(() => {
    app = new ApiServer().getApp();
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given /hello', () => {
    test('should return 200 status', done => {
      request(app).get('/hello').expect(200, done);
    });

    test('should return "Hello, World!"', done => {
      request(app).get('/hello').expect('Hello, World!', done);
    });
  });

  describe('Given /hello/Johnny', () => {
    const name = 'Johnny';

    test('should return 200 status', done => {
      request(app).get(`/hello/${name}`).expect(200, done);
    });

    test('should return "Hello, Johnny!"', done => {
      request(app).get(`/hello/${name}`).expect(`Hello, ${name}!`, done);
    });
  })

});
