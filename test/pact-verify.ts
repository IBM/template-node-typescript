import * as path from 'path';
import {Verifier, VerifierOptions} from '@pact-foundation/pact';
import * as yargs from 'yargs';
import {buildApiServer} from "./helper";
import * as config from '../package.json';
import {ApiServer} from "../src/server";

const provider = config.config;
const opts: VerifierOptions = config.pact as any;

const argv = yargs.options({
    providerBaseUrl: {
        alias: 'p',
        default: `${provider.protocol}://${provider.host}:${provider.port}${provider.contextRoot}`
    }
}).argv;

function buildOptions(): VerifierOptions {
    const options: VerifierOptions = Object.assign(
        {},
        opts,
        argv,
        opts.pactBrokerUrl
            ? {}
            : {pactUrls: [path.join(process.cwd(), 'pacts/hello-consumer-typescript-template.json')]},
        opts.provider
            ? {}
            : {provider: config.name}
    );

    console.log('Pact verification options', options);

    return options;
}

async function verifyPact() {
    console.log('Starting server');
    const server: ApiServer = await buildApiServer().start();

    try {
        await new Verifier().verifyProvider(buildOptions());
    } finally {
        await server.stop();
    }
}

verifyPact().catch(err => {
    console.log('Error verifying provider', err);
});
