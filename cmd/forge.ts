import { Tx } from "../main";
import { Tezos, ForgeParams, Signer } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { localForger } from "@taquito/local-forging";

Tezos.setProvider({ rpc: "https://NOHOST" });

export let forge = async (txs: ForgeParams, privateKey: string) => {
  let forgedBytes = await localForger.forge(txs);
  //sign
  let signer = new InMemorySigner(privateKey);
  //Kludge to get libsodium loaded
  await signer.publicKeyHash();
  return (await signer.sign(forgedBytes, new Uint8Array([0x03]))).sbytes;
};
