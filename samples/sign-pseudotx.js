const lib = require("../");

console.log("XRPL-AccountLib");
console.log();

/**
 * Non-standard pseudo-tx eg. XUMM sign in
 */

const Tx = {
  TransactionType: "SignIn"
};

console.log(
  "Sign pseudo-tx: one account",
  lib.sign(Tx, lib.derive.familySeed("shqNUmrgnkBmK9iCijrtid2Ua4uHd"))
);
console.log();
