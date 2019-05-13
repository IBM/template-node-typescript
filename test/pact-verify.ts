import {Verifier, VerifierOptions} from '@pact-foundation/pact';
import * as yargs from 'yargs';
import {buildApiServer} from "./helper";
import * as config from '../package.json';

const opts: VerifierOptions = config.pact as any;

const argv = yargs.options({
    providerBaseUrl: {
        alias: 'p'
    }
}).argv;

function buildOptions(): VerifierOptions {
    return Object.assign({}, opts, argv);
}

async function verifyPact() {
    const server = buildApiServer();
    await server.start();

    try {
        await new Verifier().verifyProvider(buildOptions());
    } finally {
        await server.stop();
    }
}

verifyPact().catch(err => {
    console.log('Error verifying provider', err);
});
