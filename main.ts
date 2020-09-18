import * as program from "commander";
import { prepare } from "./cmd/prepare";
import { forge } from "./cmd/forge";
import { inject } from "./cmd/inject";
import { readFileSync } from "fs";

program.version("0.0.1");

export interface Tx {
  dst: string;
  type: TX_TYPE;
  assetContract?: string;
  amount: number;
}

enum TX_TYPE {
  TEZOS,
  // TODO: implement asset contract support
  // FA12,
  // FA2,
}

program
  .command("prepare")
  .description(
    "Takes a list of transactions and prepares them for signing. Requires a synced RPC node"
  )
  .option("-s, --source_key <key>", "The public key of the source address")
  .option("-i, --input <file>", "Input JSON file containing transactions")
  .action(async (command) => {
      //TODO, get src from command line arg
      let input = JSON.parse(readFileSync(command.input).toString("utf-8"));
      let preppedTransactions = await prepare(command.source_key, input);
      console.log(JSON.stringify(preppedTransactions, null, 2));
  });

program
  .command("sign")
  .description("Takes prepared transaction input, forges and signs an operation")
  .option(
    "--signing_key <key>",
    "secret key to sign operations WARNING POC: Handle your keys securely!"
  )
  .option(
    "-i, --input <file>",
    "JSON file of prepared transactions as produced by the `prepare` stage"
  )
  .action(async (command) => {
    let preparedInput = JSON.parse(readFileSync(command.input).toString("utf-8"));
    let signedOps = await forge(preparedInput, command.signing_key);
    console.log(signedOps);
  });

program
  .command("inject <operation_bytes>")
  .description("Taking a signed operation, validate and inject the operation")
  .action(async (content, command) => {
    let opHash = await inject(content);
    console.log(`https://babylon.tzkt.io/${opHash}`);
  });
program.parse(process.argv);
