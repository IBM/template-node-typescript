import {HelloWorldApi} from './hello-world.api';
import {Provides} from 'typescript-ioc';

@Provides(HelloWorldApi)
export class HelloWorldService implements HelloWorldApi {
  greeting(name: string = 'World'): string {
    return `Hello, ${name}!`;
  }
}
