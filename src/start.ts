import { ApiServer } from './server';
import {workerManager} from './workers';

export const start = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const apiServer = new ApiServer();

    Promise.all([
      apiServer.start(),
      workerManager.start(),
    ]).then(() => resolve())
      .catch(reject);


    const graceful = () => {
      Promise.all([
        apiServer.stop(),
        workerManager.stop(),
      ]).then(() => process.exit(0));
    };

    // Stop graceful
    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);
  });
};
