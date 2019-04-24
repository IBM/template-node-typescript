import { start } from './start';

start()
  .catch((err) => {
    console.error(`Error starting server: ${err.message}`, err);
    process.exit(-1);
  });
