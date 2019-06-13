import {Inject, Provides, Singleton} from 'typescript-ioc';
import * as request from 'superagent';
import {HelloWorldApi} from './hello-world.api';
import {LoggerApi} from '../logger';
import {HelloWorldRandomConfig} from "../config/hello-world.random.config";

class RandomUserResponse {
  results: RandomUser[];
}

class RandomUser {
  name: {
    title: string;
    first: string;
    last: string;
  }
}

@Singleton
export class HelloWorldRandomService implements HelloWorldApi {
  logger: LoggerApi;

  constructor(
    @Inject
    logger: LoggerApi,
    @Inject
    private config: HelloWorldRandomConfig = {hostname: 'https://randomuser.me'}
  ) {
    this.logger = logger.child('HelloWorldRandomService');
  }

  async greeting(name?: string): Promise<string> {
    if (name) {
      this.logger.info(`Generating greeting for ${name}`);
      return `Hello, ${name}!`;
    }

    this.logger.info(`Generating random greeting`);
    console.log('making request');
    const {first, last} = await request
      .get(`${this.config.hostname}/api`)
      .type('application/json')
      .accept('application/json')
      .then((value: request.Response) => {
        console.log('Response status', value.status);
        const result: RandomUserResponse = value.body;
        console.log('Got result', result);
        return result.results[0].name;
      })
      .catch(err => {
        console.log('Error getting data', err);
        return Promise.reject(new Error('Unable to generate name'));
      });

    return `Hello, ${first} ${last}!`;
  }
}
