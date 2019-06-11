const lib = require("../");

console.log("XRPL-AccountLib");
console.log();

/**
 * You can try this at TestNet,
 *    https://developers.ripple.com/xrp-test-net-faucet.html
 * Using:
 *    https://xrp.fans/ (Click the "Switch to TESTNET" button)
 */

const Tx = {
  TransactionType: "Payment",
  Account: "rPdvC6ccq8hCdPKSPJkPmyZ4Mi1oG2FFkT",
  Fee: "1000",
  Destination: "rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY",
  Amount: "133701337",
  DestinationTag: 495,
  Sequence: 4
};

console.log(
  "Sign: one account",
  lib.sign(Tx, lib.derive.familySeed("shqNUmrgnkBmK9iCijrtid2Ua4uHd"))
);
console.log();

console.log("Sign: multiSign");
console.dir(
  lib.sign(Tx, [
    lib.derive.familySeed("sp5mkm12oJj3t8fFRiaMNrDbc73N2"),
    lib.derive.familySeed("shqNUmrgnkBmK9iCijrtid2Ua4uHd")
  ]),
  { depth: null }
);
console.log();

console.log("Sign: multiSign");
console.dir(
  lib.sign(Tx, [
    lib.derive.familySeed("sp5mkm12oJj3t8fFRiaMNrDbc73N2"),
    lib.derive
      .familySeed("snYHBZDJ51PPSuzWYVhEh1kb9zvEU")
      .signAs("rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY")
  ]),
  { depth: null }
);
console.log();
