const lib = require("../../../dist/");
const Fixtures = require('./fixtures').basic

/**
 * This comes from the card, Key (pubkey) upfront,
 * signature after signing.
 */
console.log("XRPL-AccountLib - rawSigning - secp256k1");
console.log();

console.log('rawSigning - secp256k1 card Account address:', lib.rawSigning.accountAddress(Fixtures.Key))
const PreparedTx = lib.rawSigning.prepare(Fixtures.Tx, Fixtures.Key)
// Now send to rawSigning SDK to sign:
//   PreparedTx.HashToSign

console.log({PreparedTx})

const Completed = lib.rawSigning.complete(PreparedTx, Fixtures.Signature)
console.log({Completed})
// Now submit to XRPL ({"command":"submit","tx_blob":"..."})
//  Completed.TxBlob (if Completed.SignatureVerifies === true)

console.log()
