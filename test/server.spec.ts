import {ApiServer} from '../src/server';
import {Application} from 'express';
import * as http from 'http';
import Mock = jest.Mock;

describe('server', () => {
  test('canary verifies test infrastructure', () => {
      expect(true).toEqual(true);
  });

  describe('given ApiServer', () => {
    describe('given constructor', () => {
      const apiContext = '/api';
      let apiServer: ApiServer;
      beforeEach(() => {
        apiServer = buildApiServer(apiContext);
      });

      context('when apiContext provided', () => {
        test('then pass apiContext to use()', () => {
          const useMock = apiServer.getApp().use as Mock;

          expect(useMock.mock.calls[1][0]).toEqual(apiContext);
        });
      });
    });

    describe('given start()', () => {
      let apiServer: ApiServer;
      beforeEach(() => {
        apiServer = buildApiServer();
      });

      context('when error during startup', () => {
        test('then throw err', () => {
          const server: http.Server = {
            address: jest.fn(),
          } as any;

          const expectedError = new Error('error starting');
          (apiServer.getApp().listen as Mock).mockImplementation((port: number, callback: (err?) => void) => {
            setTimeout(() => {
              callback(expectedError);
            }, 2);

            return server;
          });
          (server.address as Mock).mockReturnValue({
            address: 'localhost', port: 1234
          });

          return apiServer.start()
            .then(data => fail('should throw error'))
            .catch(err => {
              expect(err).toEqual(expectedError);
              return;
            });
        });
      });

      context('when address is "::"', () => {
        test('then display localhost', async () => {
          const server: http.Server = {
            address: jest.fn(),
          } as any;

          (apiServer.getApp().listen as Mock).mockImplementation((port: number, callback: (err?) => void) => {
            setTimeout(() => {
              callback();
            }, 2);

            return server;
          });
          (server.address as Mock).mockReturnValue({
            address: '::', port: 1234
          });

          expect(await apiServer.start()).toBe(apiServer);
        });
      });
    });

    describe('given stop()', () => {
      let apiServer: ApiServer;
      beforeEach(() => {
        apiServer = buildApiServer();
      });

      context('when called if server is not started', () => {
        test('then return immediately', async () => {
          const apiServer = new ApiServer();

          expect(await apiServer.stop()).toEqual(false);
        });
      });

      context('when called after server is started', () => {
        test('then close the server', async () => {
          const server: http.Server = {
            close: jest.fn(),
            address: jest.fn(),
          } as any;

          (apiServer.getApp().listen as Mock).mockImplementation((port: number, callback: (err?) => void) => {
            setTimeout(() => {
              callback();
            }, 2);

            return server;
          });
          (server.address as Mock).mockReturnValue({
            address: 'localhost', port: 1234
          });
          (server.close as Mock).mockImplementation((callback: () => void) => {
            callback();
          });

          await apiServer.start();

          expect(await apiServer.stop()).toEqual(true);

          expect(server.close).toHaveBeenCalled();
        });
      });
    });
  });
});

function buildApiServer(apiContext?: string) {
  const app: Application = {
    use: jest.fn(),
    listen: jest.fn(),
  } as any;

  return new ApiServer(app, apiContext);
}
