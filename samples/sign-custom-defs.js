const lib = require("../");

const defs = require("../test/fixtures/customDefinitions.json");
const definitions = new lib.XrplDefinitions(defs);

console.log("XRPL-AccountLib (with Custom Definitions");
console.log();

/**
 * You can try this at TestNet,
 *    https://developers.ripple.com/xrp-test-net-faucet.html
 * Using:
 *    https://xrp.fans/ (Click the "Switch to TESTNET" button)
 */

const Tx = {
  TransactionType: 'ClaimReward',
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
);

console.log();
