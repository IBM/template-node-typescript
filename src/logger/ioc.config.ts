import {ContainerConfiguration, Scope} from 'typescript-ioc';
import {LoggerApi} from './logger.api';
import {PinoLoggerService} from './logger-pino.service';

const config: ContainerConfiguration[] = [
  {
    bind: LoggerApi,
    to: PinoLoggerService,
    scope: Scope.Singleton
  }
];

export default config;