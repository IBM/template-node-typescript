import { Injectable } from '@nestjs/common';
import {HelloWorldApi} from "./hello-world.api";

@Injectable()
export class HelloWorldService implements HelloWorldApi {
  getHello(): string {
    return 'Hello World!';
  }
}
