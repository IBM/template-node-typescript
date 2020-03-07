export * from './hello-world.api';
export * from './hello-world.service';

import { Container } from "typescript-ioc";
import config from './ioc.config';

Container.configure(...config);