import {Container} from 'typescript-ioc';

export * from './tracer.api';

import config from './ioc.config';

Container.configure(...config);