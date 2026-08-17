/**
 * BIP39 Mnemonic: secp256k1 (default, BIP32) vs ed25519 (SLIP-0010)
 *
 * The same 12/24 words yield a DIFFERENT account per algorithm:
 *  - secp256k1: BIP32,     path m/44'/144'/0'/0/0  (default, backwards compatible)
 *  - ed25519:   SLIP-0010, path m/44'/144'/0'/0'/0' (fully hardened)
 *
 * The `algorithm` option is case insensitive ("ed25519" === "ED25519"),
 * anything that is not ed25519/secp256k1 throws.
 */

const lib = require("../");

console.log("XRPL-AccountLib - mnemonic: secp256k1 vs ed25519");
console.log();

/**
 * Generate: a brand new mnemonic per algorithm
 */
const generatedSecp = lib.generate.mnemonic();
console.log("Generate: mnemonic (secp256k1, default)");
console.log("  words:  ", generatedSecp.secret.mnemonic);
console.log("  path:   ", generatedSecp.secret.path);
console.log("  address:", generatedSecp.address);
console.log("  pubkey: ", generatedSecp.keypair.publicKey);
console.log();

const generatedEd = lib.generate.mnemonic({ algorithm: "ed25519" });
console.log("Generate: mnemonic (ed25519, SLIP-0010)");
console.log("  words:  ", generatedEd.secret.mnemonic);
console.log("  path:   ", generatedEd.secret.path);
console.log("  address:", generatedEd.address);
console.log("  pubkey: ", generatedEd.keypair.publicKey, "(ED prefix)");
console.log();

/**
 * Derive (import): the same existing mnemonic, both algorithms
 */
const words =
  "lamp elevator orchard music glare night upper race mixture bullet property nasty agent sword blind dynamic gossip life series shrug day ice control reunion";

const importedSecp = lib.derive.mnemonic(words);
console.log("Derive: existing mnemonic (secp256k1, default)");
console.log("  path:   ", importedSecp.secret.path);
console.log("  address:", importedSecp.address);
console.log();

const importedEd = lib.derive.mnemonic(words, { algorithm: "ed25519" });
console.log("Derive: same mnemonic (ed25519) -> different account");
console.log("  path:   ", importedEd.secret.path);
console.log("  address:", importedEd.address);
console.log();

/**
 * Options combine as usual: passphrase (25th word), account/change/index
 */
const customEd = lib.derive.mnemonic(words, {
  algorithm: "ED25519", // case insensitive
  passphrase: "Hello World!",
  accountPath: "2",
  changePath: "3",
  addressIndex: 1,
});
console.log("Derive: ed25519 + passphrase + custom path (fully hardened)");
console.log("  path:   ", customEd.secret.path);
console.log("  address:", customEd.address);
console.log();

/**
 * Anything else than ed25519/secp256k1 throws (no silent fallback)
 */
try {
  lib.derive.mnemonic(words, { algorithm: "ed25519-please" });
} catch (e) {
  console.log("Derive: invalid algorithm throws:", e.message);
}
