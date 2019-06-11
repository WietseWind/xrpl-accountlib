const lib = require("../");

console.log("XRPL-AccountLib");
console.log();

console.log("Generate: family seed (default)", lib.generate.familySeed());
console.log();

console.log(
  "Generate: family seed (algorithm: ed25519)",
  lib.generate.familySeed({ algorithm: "ed25519" })
);
console.log();

console.log(
  "Generate: mnemonic",
  lib.generate.mnemonic({ wordlist: "english", passphrase: "Hello World!" })
);
console.log();
