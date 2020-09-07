import * as program from 'commander';
import { prepare } from './cmd/prepare';
import { forge } from './cmd/forge';
import { inject } from './cmd/inject';
import { readFileSync, writeFileSync } from 'fs';

program.version('0.0.1')

export interface Tx {
    dst: string
    type: TX_TYPE,
    assetContract?: string
    amount: number
}

enum TX_TYPE {
    TEZOS,
    // TODO: implement asset contract support
    // FA12,
    // FA2,
}

program.command("prepare")
    .description("Takes a list of transactions and prepares them for signing. Requires a synced RPC node")
    .option("-s, --source_key <key>", "The public key of the source address")
    .option("-i, --input <file>", "Input JSON file containing transactions")
    .option("-o, --output <file>", "Input desired output file name, containing prepared transactions")
    .action(async (command) => {
        try {
            const input = JSON.parse(readFileSync(command.input).toString('utf-8'));
            const _preppedTransactions = await prepare(command.source_key, input);
            writeFileSync(command.output, JSON.stringify(_preppedTransactions, null, 2));
        } catch (err) {
            console.error(err);
        }
    })

program.command("sign")
    .description("Takes prepared transaction input, forges and signs an operation")
    .option("-k, --signing_key <key>", "secret key to sign operations WARNING POC: Handle your keys securely!")
    .option("-i, --input <file>", "JSON file of prepared transactions as produced by the `prepare` stage")
    .option("-o, --output <file>", "Input desired output file name, containing signed bytes")
    .action(async (command) => {
        try {
            const preparedInput = JSON.parse(readFileSync(command.input).toString('utf-8'));
            const _signedOps = await forge(preparedInput, command.signing_key);
            writeFileSync(command.output, _signedOps);
        } catch (err) {
            console.error(err);
        }

    })

program.command("inject")
    .description("Takes a signed operation, validate and inject the operation")
    .option("-i, --input <file>", "File containing signed bytes")
    .action(async (command) => {
        try {
            const _opHash = await inject(readFileSync(command.input).toString()); // encoding??
            console.log(`https://carthage.tzkt.io/${_opHash}`);
        } catch (err) {
            console.log(err);
        }
    })

program.parse(process.argv)