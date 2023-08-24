import { Controller, Get } from '@nestjs/common';
import { HelloWorldApi } from '../../services';

@Controller()
export class HelloWorldController {
  constructor(private readonly service: HelloWorldApi) {}

  @Get()
  getHello(): string {
    return this.service.getHello();
  }
}
