import { Tezos } from "@taquito/taquito";

Tezos.setProvider({ rpc: "https://api.tez.ie/rpc/carthagenet" });

export let inject = async (ops: string) => {
  let opHash = await Tezos.rpc.injectOperation(ops).catch((e) => {
    console.error(e);
  });

  return opHash;
};
