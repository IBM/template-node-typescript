import {HelloWorldService} from '../../src/services';

describe('Hello World service', () =>{

  let service: HelloWorldService;
  beforeAll(() => {
    service = new HelloWorldService();
  });

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  describe('Given greeting()', () => {
    describe('when "Juan" provided', () => {
      const name = 'Juan';
      test('then return "Hello, Juan!"', () => {
        expect(service.greeting(name)).toEqual(`Hello, ${name}!`);
      });
    });

    describe('when no name provided', () => {
      test('then return "Hello, World!"', () => {
        expect(service.greeting()).toEqual('Hello, World!');
      });
    })
  });

});
