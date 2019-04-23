class HelloWorldService {
  greeting(name: string): string {
    return `Hello, ${name}!`;
  }
}

describe('Hello World service', () =>{
  test('canary test verifies test infrastructure', () => {
    expect(true).toBe(true);
  });

  let service: HelloWorldService;
  beforeAll(() => {
    service = new HelloWorldService();
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
        expect(service.greeting()).toEqual('Hello, World!!');
      });
    })
  });

});
