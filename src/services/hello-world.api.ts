export abstract class HelloWorldApi {
  abstract greeting(name?: string): Promise<string>;
}
