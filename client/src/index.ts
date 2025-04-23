import algosdk, {
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
} from "algosdk";
import * as algokit from "@algorandfoundation/algokit-utils";
import { SMART_CONTRACT_ARC_32 } from "./client";
import { AppClient } from "@algorandfoundation/algokit-utils/types/app-client";

const APP_ID = 0;
const ASA_ID = 0;

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
  const account = client.account.fromMnemonic();

  return account;
}

async function buyAsset() {
  // Your logic goes here
}

async function main() {
  console.log("Buying asset");
  await buyAsset()
  console.log("Asset bought successfully");
}

main();
