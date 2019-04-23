import {GET, Path, PathParam} from 'typescript-rest';
import {Inject} from 'typescript-ioc';
import {HelloWorldApi} from '../services';

export class HelloWorldController {
  @Inject
  service: HelloWorldApi;

  @Path('/hello')
  @GET
  async sayHelloToUnknownUser(): Promise<string> {
    return this.service.greeting();
  }

  @Path('/hello/:name')
  @GET
  async sayHello(@PathParam('name') name: string): Promise<string> {
    return this.service.greeting(name);
  }
}
