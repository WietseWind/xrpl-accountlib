import {
  derive,
  utils,
  signAndSubmit,
} from "../dist/index.js"; // require('xrpl-accountlib') after `npm install xrpl-accountlib` in prod.

console.log("Sign & Submit (Custom Definitions)");
console.log();

const wss = 'wss://hooks-testnet-v3.xrpl-labs.com/'
// const wss = 'wss://s.altnet.rippletest.net:51233/'
// const wss = new XrplClient();

const account = derive.familySeed("ssi4moYHYkWs2RPzRvrXzMrbpxqAJ")
// console.log(String(account))

const networkInfo = await utils.accountAndLedgerSequence(wss, account)
// console.log(await networkInfo)

const tx = {
  TransactionType: "Payment",
  Destination: "rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY",
  Amount: "1337",
  ...networkInfo.txValues, // Adds Sequence, Fee, Account, LastLedgerSequence
};

const submitted = await signAndSubmit(tx, wss, account)

console.log(submitted);
console.log();
