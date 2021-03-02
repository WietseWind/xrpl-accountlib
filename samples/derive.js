const lib = require("../");

console.log("XRPL-AccountLib");
console.log();

console.log(
  "Derive: family seed (default)",
  lib.derive.familySeed("sni2chTNGKBHkULN8zcLwELNTUMXS")
);
console.log();

console.log(
  "Derive: family seed (algorithm: ed25519)",
  lib.derive.familySeed("sEd78uLZSTE1eYWoDBHPHQdx3SKwmP5")
);
console.log();

console.log(
  "Derive: Secret Numbers (array)",
  lib.derive.secretNumbers([ "479237", "092066", "138573", "322135", "483860", "006477", "252857", "140146" ]) 
);
console.log();

console.log(
  "Derive: Secret Numbers (string)",
  lib.derive.secretNumbers("479237 092066 138573 322135 483860 006477 252857 140146") 
);
console.log();

console.log(
  "Derive: Secret Numbers without checksum",
  lib.derive.secretNumbers([ "47923", "09206", "13857", "32213", "48386", "00647", "25285", "14014" ], true)
);
console.log();

console.log(
  "Derive: mnemonic",
  lib.derive.mnemonic(
    "lamp elevator orchard music glare night upper race mixture bullet property nasty agent sword blind dynamic gossip life series shrug day ice control reunion",
    { passphrase: "Hello World!" }
  )
);
console.log();

console.log(
  "Derive: privatekey (HEX)",
  lib.derive.privatekey(
    "00B440C4948CD011B94F69839A16B985D23666194529F630781D58A18977F20635"
  )
);
console.log();

console.log("Derive: passphrase", lib.derive.passphrase("masterpassphrase"));
console.log();
