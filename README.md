# Offline Tezos Ops

This tool illustrates how to forge and sign a list of transactions in an offline/air-gapped environment.

The tool supports transfers of Tezos tokens from a single sender address. Support for transfers of asset contracts will be added.

Let's assume we have two environments, an on-line environment that has access to an active Tezos node, and an offline/air-gapped environment. We will assume that this utility is installed and operable on *both* environments.

Pre-requests for operation:

* A JSON file containing the desired transactions. See `sample-input.json`
* The public key (not the public key *hash*) of the sending wallet
* The private key of the sending wallet (presumed to be located on the air-gapped system and handled securely)

## Step 1

Run the 'prepare' step.

```sh
npm start -- prepare \
        -s edpktsCY33e4Jd2N7zjLaGQDPADB6hpyxWZtVEPUYeFNSQr88wbPvY \
        -i ./sample-input.json \
        -o txs_for_secure_environment.json
```

This step prepares your transactions, and estimated each one using the Tezos RPC node. It writes the prepared transactions to a file.

## Step 2

Securely copy the prepared transactions JSON file to the secured/air-gapped environment.

## Step 3

Run the `sign` step

```sh
npm start -- sign \
        -k edskRjrfTNP8uVfRa6BuyTZWFeW3uXhyR6grKJq5NzuXnC96R26Z9HBhNU5NgqJpX8Zyn8v8dRsvDZJcve9LYC5Qf7BJQwBA4C \
        -i ./txs_for_secure_environment.json 
        -o signed_bytes.txt
```

This step takes your private key, and your prepared transactions. It forged the transactions into a single operation and then signs that operation with your private key.

## Step 4

Securely copy the `signed_bytes.txt` file from the secured/air-gapped system to the online environment.

## Step 5

```sh
$ npm start -- inject -i ./signed_bytes.txt


https://carthage.tzkt.io/ooVNm7p52GJCS1bDMQaNuKoQspG3ravtyKnZajayd6q61bGYFzk
```
