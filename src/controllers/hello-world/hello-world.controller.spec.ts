import { Test, TestingModule } from '@nestjs/testing';

import { HelloWorldController } from './hello-world.controller';
import { provider as helloWorldProvider } from '../../services/hello-world';

describe('AppController', () => {
  let appController: HelloWorldController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HelloWorldController],
      providers: [helloWorldProvider],
    }).compile();

    appController = app.get<HelloWorldController>(HelloWorldController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
