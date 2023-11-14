import {
  derive,
  utils,
  signAndSubmit,
} from "../dist/index.js"; // require('xrpl-accountlib') after `npm install xrpl-accountlib` in prod.

console.log("Sign & Submit (Custom Definitions)");
console.log();

const wss = 'wss://hooks-testnet-v3.xrpl-labs.com/'
const account = derive.familySeed("ssi4moYHYkWs2RPzRvrXzMrbpxqAJ")

const networkInfo = await utils.txNetworkAndAccountValues(wss, account)

console.log(networkInfo)
console.log()

const tx = {
  TransactionType: "SetHook",
  Hooks: [ { Hook: {
    CreateCode: "0061736D01000000011C0460057F7F7F7F7F017E60037F7F7E017E60027F7F017F60017F017E02230303656E76057472616365000003656E7606616363657074000103656E76025F670002030201030503010002062B077F0141B088040B7F004180080B7F0041A6080B7F004180080B7F0041B088040B7F0041000B7F0041010B07080104686F6F6B00030AC4800001C0800001017F230041106B220124002001200036020C41920841134180084112410010001A410022002000420010011A41012200200010021A200141106A240042000B0B2C01004180080B254163636570742E633A2043616C6C65642E00224163636570742E633A2043616C6C65642E22",
    Flags: 1,
    HookApiVersion: 0,
    HookNamespace: "F".repeat(64),
    HookOn: "F".repeat(58) + "BFFFFE",
  }
  }],
};

/**
 * Note: the code above and `signAndSubmit` results in automatically fetching and setting Sequence, Account, LastLedgerSequence, Fee for you.
 * If you want to check the fee for min/max/..., get your own fee (string in drops) using:
 *    utils.networkTxFee(wss, tx)
 * 
 * e.g.
 *    const Fee = await utils.networkTxFee(wss, tx)
 *    assert(Number(Fee) < 50_000, "Auto fee above 50k drops, abort")
 *    Object.assign(tx, { Fee, })
 */

const submitted = await signAndSubmit(tx, wss, account)

console.log(submitted);
console.log();
