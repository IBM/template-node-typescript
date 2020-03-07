import {ContainerConfiguration, Scope} from 'typescript-ioc';
import {HelloWorldApi} from './hello-world.api';
import {HelloWorldService} from './hello-world.service';

const config: ContainerConfiguration[] = [
  {
    bind: HelloWorldApi,
    to: HelloWorldService,
    scope: Scope.Singleton
  }
];

export default config;