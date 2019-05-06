export abstract class HelloWorldApi {
  abstract async greeting(name?: string): Promise<string>;
}
