import {ApiServer} from '../src/server';
import {LoggerApi, NoopLoggerService} from '../src/logger';

export function buildApiServer(enableLogging?: boolean): ApiServer {
  const apiServer = new ApiServer();

  if (!enableLogging) {
    apiServer.bind(LoggerApi).to(NoopLoggerService);
  }

  return apiServer;
}
