import * as path from 'path';
import * as fs from 'fs';
import {VerifierOptions} from '@pact-foundation/pact';
import {Publisher, PublisherOptions} from '@pact-foundation/pact-node';

import * as config from '../package.json';

const opts: VerifierOptions = config.pact as any;

const pactBroker = process.env.PACTBROKER_URL || opts.pactBrokerUrl;

async function publishPact(): Promise<void> {

  if (!pactBroker) {
    console.log('No pact broker configured...');
    return;
  }

  const pactFiles: string[] = await listPactFiles(path.join(__dirname, '../pacts'));

  if (pactFiles.length == 0) {
    console.log('No pact files in pact directory: ' + path.join(__dirname, '../pacts'));
    return;
  }

  const options: PublisherOptions = {
    consumerVersion: config.version,
    pactBroker,
    pactFilesOrDirs: pactFiles,
  };

  console.log('Publishing pacts with options:', options);

  await new Publisher(options).publish();
  return;
}

async function listPactFiles(pactDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(pactDir)) {
      resolve([]);
      return;
    }

    fs.readdir(pactDir, (err, items) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(items.map(item => path.join(pactDir, item)));
    });
  });
}

publishPact()
  .catch(err => {
    console.error('Error publishing pact', err);
    process.exit(1);
  });
