import { Module } from '@nestjs/common';

import { controllers } from './controllers';
import { providers } from './services';

@Module({
  imports: [],
  controllers,
  providers,
})
export class AppModule {}
