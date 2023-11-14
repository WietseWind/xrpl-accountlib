const lib = require("../");

const defs = require("../test/fixtures/customDefinitions.json");
const definitions = new lib.XrplDefinitions(defs);

console.log("XRPL-AccountLib (with Custom Definitions");
console.log();

/**
 * You can try this at TestNet,
 *    https://xrpl.org/xrp-testnet-faucet.html
 * Using:
 *    https://xrp.fans/ (Click the "Switch to TESTNET" button)
 */

const Tx = {
  TransactionType: "SetHook",
  Hooks: [ { Hook: {
    CreateCode: "0061736D01000000011C0460057F7F7F7F7F017E60037F7F7E017E60027F7F017F60017F017E02230303656E76057472616365000003656E7606616363657074000103656E76025F670002030201030503010002062B077F0141B088040B7F004180080B7F0041A6080B7F004180080B7F0041B088040B7F0041000B7F0041010B07080104686F6F6B00030AC4800001C0800001017F230041106B220124002001200036020C41920841134180084112410010001A410022002000420010011A41012200200010021A200141106A240042000B0B2C01004180080B254163636570742E633A2043616C6C65642E00224163636570742E633A2043616C6C65642E22",
    Flags: 1,
    HookApiVersion: 0,
    HookNamespace: "F".repeat(64),
    HookOn: "F".repeat(58) + "BFFFFE",
  } } ],
  Account: 'r39H43VR9VMpbh8X153a7WYnnzuuFHnpki',
  Fee: '2000',
  Flags: 0,
  Issuer: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  Sequence: 1283183,
  NetworkID: 21338,
};

console.log(
  "Sign: one account",
  lib.sign(Tx, lib.derive.familySeed("sanqPBhfFDmR4RjXpa33Qamx27Ea4"), definitions)
  // ^^ No bounty, this is a test key
);

console.log();
