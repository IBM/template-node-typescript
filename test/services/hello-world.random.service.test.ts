import {Matchers, Pact} from "@pact-foundation/pact";
import {HelloWorldRandomService} from '../../src/services';
import {ApiServer} from '../../src/server';
import {buildApiServer} from '../helper';
import * as npmPackage from '../../package.json';
import {HelloWorldRandomConfig} from "../../src/config/hello-world.random.config";
import {Provider} from "typescript-ioc";

const configProvider: Provider = {
  get: () => {
    return {
      hostname: 'http://localhost:1235'
    }
  }
};

describe('HelloWorldRandomService', () => {

  let app: ApiServer;
  let service: HelloWorldRandomService;
  beforeAll(() => {
    app = buildApiServer();

    app.bind(HelloWorldRandomConfig).provider(configProvider);

    service = app.get(HelloWorldRandomService);
  });

  let pactServer: Pact;
  beforeAll(() => {
    pactServer = new Pact({
      consumer: npmPackage.name,
      provider: 'randomuser.me',
      host: '127.0.0.1',
      port: 1235,
      pactfileWriteMode: 'update',
      cors: true,
      spec: 2,
      logLevel: 'trace'
    });

    return pactServer.setup();
  });

  afterAll(() => {
    return pactServer.finalize();
  });

  describe('Given greeting()', () => {
    context('when name given', () => {
      test('then return `Hello, {name}!`', async () => {
        const name = 'Juan';
        expect(await service.greeting(name)).toEqual(`Hello, ${name}!`);
      });
    });

    context('when no name given', () => {
      const title = 'mrs';
      const firstName = 'rolf';
      const lastName = 'hegdal';

      beforeEach(() => {
        return pactServer.addInteraction({
          state: 'base state',
          uponReceiving: 'a request for a random name',
          withRequest: {
            method: 'GET',
            path: '/api',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': Matchers.regex({
                generate: 'application/json',
                matcher: 'application/json.*'
              })
            },
            body: {
              results: [{
                name: {
                  title: title,
                  first: firstName,
                  last: lastName
                }
              }]
            }
          }
        });
      });

      test('should return random name', async () => {
        expect(await service.greeting()).toEqual(`Hello, ${firstName} ${lastName}!`);
      });
    });
  });
});
