import {GET, Path} from 'typescript-rest';

export class HelloWorldController {

  @Path('/hello')
  @GET
  async sayHelloToUnknownUser(): Promise<string> {
    return 'Hello, World!';
  }

  @Path('/hello/:name')
  @GET
  async sayHello(): Promise<string> {
    return '';
  }
}
