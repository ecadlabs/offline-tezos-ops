import {Tx} from '../main';
import { Tezos, ForgeParams, Signer } from '@taquito/taquito'
import { OperationContentsTransaction } from '@taquito/rpc'
import { Estimate } from '@taquito/taquito/dist/types/contract/estimate';
import * as sodium from 'libsodium-wrappers';
import { b58cencode, b58cdecode, prefix,   } from '@taquito/utils'

class NoSecretsSigner implements Signer {

    constructor(private _publicKey) {}

    sign(op: {}, magicByte?: Uint8Array | undefined): Promise<{ bytes: string; sig: string; prefixSig: string; sbytes: string; }> {
        throw new Error("Method not implemented.");
    }
    async publicKey(): Promise<string> {
        return this._publicKey;
    }
    async publicKeyHash(): Promise<string> {
        await sodium.ready
        //TODO: don't hard-code to tz1 address type.
        let decodedPubKey = b58cdecode(this._publicKey, prefix.edpk)
        return b58cencode(sodium.crypto_generichash(20, decodedPubKey), prefix.tz1);
    }
    secretKey(): Promise<string | undefined> {
        throw new Error("Method not implemented.");
    }
}


export let prepare = async (publicKey: string, input: Tx[]): Promise<ForgeParams> => {

    Tezos.setProvider({rpc: 'https://api.tez.ie/rpc/babylonnet', signer: new NoSecretsSigner(publicKey)})

    // we need the public key and pkh of sender
    // we need to inject a custom signer 
    let pkh = await Tezos.signer.publicKeyHash()

    //Get counter for source address
    let {counter} = (await Tezos.rpc.getContract(pkh))

    if (!counter) {
        throw new Error(`Got undefined counter for source address ${pkh}`)
    }

    // Get latest block hash (aka branch id)
    let hash = (await Tezos.rpc.getBlockHeader()).hash

    let count = Number.parseInt(counter, 10)
    let transactions: OperationContentsTransaction[] = []

    for (const tx of input) {

        let est = await Tezos.estimate.transfer({amount: tx.amount, to: tx.dst, source: pkh })

        const result: OperationContentsTransaction = {
            kind: 'transaction',
            source: pkh,
            amount: tx.amount.toString(),
            destination: tx.dst,
            counter: (++count).toString(),
            gas_limit: est.gasLimit.toString(),
            fee: est.suggestedFeeMutez.toString(),
            storage_limit: est.storageLimit.toString(),
        }
        transactions.push(result)
    }
    
    return {
        branch: hash,
        //TODO pending refactor of types
        contents: transactions as any
    }
}

