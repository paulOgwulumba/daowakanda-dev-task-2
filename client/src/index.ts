import algosdk, {
  AtomicTransactionComposer,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk";
import * as algokit from "@algorandfoundation/algokit-utils";
import { MNEMONIC_KEY } from './constant';
import { SMART_CONTRACT_ARC_32 } from "./client";
import { AppClient } from "@algorandfoundation/algokit-utils/types/app-client";

// Add your wallet address here -- 
const APP_ID = 2948568810;
const ASA_ID = 2948546348;

async function loadClient() {
  const client = algokit.AlgorandClient.fromConfig({
    algodConfig: {
      server: "https://mainnet-api.algonode.cloud",
    },
    indexerConfig: {
      server: "https://mainnet-idx.algonode.cloud",
    },
  });

  return client;
}

async function loadAccount() {
  const client = await loadClient();

  // Do not push your mnemonic key to GitHub
  const account = client.account.fromMnemonic(MNEMONIC_KEY);

  return account;
}

async function buyAsset() {
  const account = await loadAccount();
  const client = await loadClient();

  const appClient = new AppClient({
    appId: BigInt(APP_ID),
    appSpec: JSON.stringify(SMART_CONTRACT_ARC_32),
    algorand: client,
  });

  const suggestedParams = await client.client.algod.getTransactionParams().do();

  const assetOptinTxn = makeAssetTransferTxnWithSuggestedParamsFromObject({
    amount: 0,
    from: account.addr,
    to: account.addr,
    suggestedParams,
    assetIndex: ASA_ID,
  });

  const fundTxn = makePaymentTxnWithSuggestedParamsFromObject({
      amount: 2_000,
      from: account.addr,
      to: 'ZSHM55LX3DA4XDFBC7HHWHAAXQUEDTEM22ZQBG6WISOADFSRKS3NQW6WAY',
      suggestedParams: {
        ...suggestedParams,
        fee: 2_000,
        flatFee: true,
      },
  });

  const atc = new algosdk.AtomicTransactionComposer();

  atc.addTransaction({ txn: assetOptinTxn, signer: account.signer })

  atc.addMethodCall({
    appID: APP_ID,
    sender: account.addr,
    signer: account.signer,
    method: appClient.getABIMethod('buyListing'),
    appForeignAssets: [ASA_ID],
    methodArgs: [{ txn: fundTxn, signer: account.signer }],
    suggestedParams: {
      ...suggestedParams,
      fee: 2_000,
      flatFee: true,
    }
  })

  const response = await atc.execute(client.client.algod, 8);
  console.log(response);
}

async function main() {
  console.log("Buying asset");
  await buyAsset()
  console.log("Asset bought successfully");
}

main();
