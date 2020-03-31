export * from './logger.api';
export * from './logger-noop.service';
export * from './logger-pino.service';

import { Container } from "typescript-ioc";
import config from './ioc.config';

Container.configure(...config);