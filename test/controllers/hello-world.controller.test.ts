import {Application} from 'express';
import * as request from 'supertest';
import {ApiServer} from '../../src/server';
import {HelloWorldService} from '../../src/services';
import {Scope} from 'typescript-ioc';

class MockHelloWorldService implements HelloWorldService {
  greeting = jest.fn().mockName('greeting');
}

describe('Hello controller', () => {

  let apiServer: ApiServer;
  let app: Application;
  let mockGreeting: jest.Mock;

  beforeEach(() => {
    apiServer = new ApiServer();

    app = apiServer.getApp();

    apiServer.bind(HelloWorldService).scope(Scope.Singleton).to(MockHelloWorldService);

    const mockService: HelloWorldService = apiServer.get(HelloWorldService);
    mockGreeting = mockService.greeting as jest.Mock;
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given /hello', () => {
    const expectedResponse = 'Hello there!';

    beforeEach(() => {
      mockGreeting.mockReturnValueOnce(expectedResponse);
    });

    test('should return 200 status', done => {
      request(app).get('/hello').expect(200, done);
    });

    test('should return "Hello, World!"', done => {
      request(app).get('/hello').expect(expectedResponse, done);
    });
  });

  describe('Given /hello/Johnny', () => {
    const name = 'Johnny';

    beforeEach(() => {
      mockGreeting.mockImplementation(name => name);
    });

    test('should return 200 status', done => {
      request(app).get(`/hello/${name}`).expect(200, done);
    });

    test('should return "Hello, Johnny!"', done => {
      request(app).get(`/hello/${name}`).expect(name, done);
    });
  })

});
