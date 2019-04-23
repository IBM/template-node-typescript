import {GET, Path, PathParam} from 'typescript-rest';

export class HelloWorldController {

  @Path('/hello')
  @GET
  async sayHelloToUnknownUser(): Promise<string> {
    return 'Hello, World!';
  }

  @Path('/hello/:name')
  @GET
  async sayHello(@PathParam('name') name: string): Promise<string> {
    return `Hello, ${name}!`;
  }
}
