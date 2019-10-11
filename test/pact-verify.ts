import * as path from 'path';
import fs = require('fs');
import {Verifier, VerifierOptions} from '@pact-foundation/pact';
import * as yargs from 'yargs';

import {buildApiServer} from "./helper";
import * as config from '../package.json';
import {ApiServer} from "../src/server";
import superagent = require('superagent');

const provider = config.config;
const opts: VerifierOptions = config.pact as any;

const argv = yargs.options({
    providerBaseUrl: {
        alias: 'p',
        default: `${provider.protocol}://${provider.host}:${provider.port}${provider.contextRoot}`
    }
}).argv;

const pactBrokerUrl = process.env.PACTBROKER_URL || opts.pactBrokerUrl;

async function buildOptions(): Promise<VerifierOptions> {

    const pactUrls = await listPactFiles(path.join(process.cwd(), 'pacts'));
    if (!pactBrokerUrl && pactUrls.length === 0) {
        console.log('Nothing to test. Pact Broker url not set and no pact files found');
        return undefined;
    }

    const options: VerifierOptions = Object.assign(
      {},
      opts,
      argv,
      pactBrokerUrl
        ? {pactBrokerUrl}
        : {pactUrls},
      {
          provider: config.name,
          providerVersion: config.version,
          publishVerificationResult: true,
      },
    );

    console.log('Pact verification options', options);

    return options;
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

            if (!items || items.length == 0) {
                reject(new Error('no pact files found'));
                return;
            }

            resolve(items.map(item => path.join(pactDir, item)));
        });
    });
}

async function verifyPact() {
    const options: VerifierOptions = await buildOptions().catch(err => {
        console.log('Error building pact options: ' + err.message);
        return null;
    });

    if (!options) {
        return;
    }

    if (options.pactBrokerUrl) {
        const url = `${options.pactBrokerUrl}/pacts/provider/${options.provider}/latest`;
        try {
            await superagent.get(url);
        } catch (err) {
            if (err.status === 404) {
                console.log('No pacts found for provider in pact broker: ' + options.provider);
                return;
            }
        }
    }

    console.log('Starting server');
    const server: ApiServer = await buildApiServer().start();

    try {
        await new Verifier(options).verifyProvider();
    } finally {
        await server.stop();
    }
}

verifyPact().catch(err => {
    console.log('Error verifying provider', err);
    process.exit(1);
});
