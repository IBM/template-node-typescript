import {Application} from 'express';
import * as request from 'supertest';

import {buildApiServer} from '../helper';

describe('health.controller', () => {

  let app: Application;

  beforeEach(() => {
    const apiServer = buildApiServer();

    app = apiServer.getApp();
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given /health', () => {
    test('should return 200 status', () => {
      return request(app).get('/health').expect(200);
    });

    test('should return {status: "UP:}', () => {
      return request(app).get('/health').expect({status: 'UP'});
    });
  });

});
