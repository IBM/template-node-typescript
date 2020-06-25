import {Container} from 'typescript-ioc';

import {ApiServer} from '../src/server';
import {LoggerApi, NoopLoggerService} from '../src/logger';
import noopTracerFactory from '../src/tracer/noop-tracer.factory';
import {TracerApi} from '../src/tracer';

export function buildApiServer(enableLogging?: boolean): ApiServer {
  const apiServer = new ApiServer();

  if (!enableLogging) {
    Container.bind(LoggerApi).to(NoopLoggerService);
  }

  Container.bind(TracerApi).factory(noopTracerFactory);

  return apiServer;
}
