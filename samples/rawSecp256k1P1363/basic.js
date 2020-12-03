const lib = require("../../dist/");
const Fixtures = require('./fixtures').basic

/**
 * This comes from the card, Key (pubkey) upfront,
 * signature after signing.
 */
console.log("XRPL-AccountLib - rawSecp256k1P1363");
console.log();

console.log('rawSecp256k1P1363 card Account address:', lib.rawSecp256k1P1363.accountAddress(Fixtures.Key))
const PreparedTx = lib.rawSecp256k1P1363.prepare(Fixtures.Tx, Fixtures.Key)
// Now send to rawSecp256k1P1363 SDK to sign:
//   PreparedTx.HashToSign

console.log({PreparedTx})

const Completed = lib.rawSecp256k1P1363.complete(PreparedTx, Fixtures.Signature)
console.log({Completed})
// Now submit to XRPL ({"command":"submit","tx_blob":"..."})
//  Completed.TxBlob (if Completed.SignatureVerifies === true)

console.log()
