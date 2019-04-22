import * as express from 'express';
import {Server} from 'typescript-rest';
import * as http from 'http';
import * as path from 'path';
import * as cors from 'cors';
import {AddressInfo} from 'net';

export class ApiServer {

  private readonly app: express.Application;
  private server: http.Server = null;
  public PORT: number = +process.env.PORT || 3000;

  constructor() {
    this.app = express();

    this.app.use(cors());

    Server.useIoC(true);

    this.app.use(express.static(path.join(__dirname, '../public'), { maxAge: 31557600000 }));

    Server.loadServices(
      this.app,
      [
        'controllers/*',
        'services/*',
      ],
      __dirname,
    );

    Server.swagger(
      this.app,
      {
        filePath: './dist/swagger.json',
        schemes: ['http'],
        host: 'localhost:3000',
        endpoint: '/api-docs'
      },
    );
  }

  /**
   * Start the server
   * @returns {Promise<any>}
   */
  public async start(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.server = this.app.listen(this.PORT, (err: any) => {
        if (err) {
          return reject(err);
        }

        const addressInfo = this.server.address() as AddressInfo;

        const address = addressInfo.address === '::' ? 'localhost' : addressInfo.address;

        // tslint:disable-next-line:no-console
        console.log(`Listening to http://${address}:${addressInfo.port}`);

        return resolve();
      });
    });
  }

  /**
   * Stop the server (if running).
   * @returns {Promise<boolean>}
   */
  public async stop(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        return resolve(true);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
