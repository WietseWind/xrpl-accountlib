const lib = require("../");
const { verify } = require('ripple-keypairs')

console.log("XRPL-AccountLib");
console.log();

/**
 * Payment Channel Authorization, pseudo TX, three possible notations
 */
const TxFormats = [
  {
    command: 'channel_authorize',
    channel: '5DB01B7FFED6B67E6B0414DED11E051D2EE2B7619CE0EAA6286D67A3A4D5BDB3',
    amount: '1000000',
  },
  {
    TransactionType: 'PaymentChannelAuthorize',
    channel: '5DB01B7FFED6B67E6B0414DED11E051D2EE2B7619CE0EAA6286D67A3A4D5BDB3',
    amount: '1000000',
  },
  {
    channel: '5DB01B7FFED6B67E6B0414DED11E051D2EE2B7619CE0EAA6286D67A3A4D5BDB3',
    amount: '1000000',
  }
];

/**
 * Return secp256k1 & ed25519 authorizations per sample
 */
TxFormats.forEach(Tx => {
  console.log(lib.sign(Tx, lib.derive.familySeed("shNfqQCkKLhfX9DeRY5JVqKyyVgsT")).signedTransaction)
  console.log(lib.sign(Tx, lib.derive.familySeed("sEdSWqTmDGRY1cJS9bFc5DGwMVooThF")).signedTransaction)
})

console.log()
console.log()

/**
 * Raw Signing:
 */
const claim = '434C4D005DB01B7FFED6B67E6B0414DED11E051D2EE2B7619CE0EAA6286D67A3A4D5BDB300000000000F4240'
const rawSigningPubKeys = {
  ed25519: '401D832E50F6927BFF47D98C87B141D8967455B3EBEC00AED2FD419A3DA44855',
  secp256k1: '03C51AA79F37E17495CD59E56B0B57FB77E2B0C12742DD01EDEF2CDEFBB85A7BFF',
}

const rawSignatures = {
  ed25519: '5F14B510506418D1304BB6F0A6A6FBCD75565112E99EFC787BB1459AAD13CA5CB2726FCDA619C7EEDF31A9EDE63735492F2A85691A42D46619000B306AB1860D',
  secp256k1: '7812252DFF5E4440E6BD95511A22B91FF690AA78C833E291183C7029D5439C9C3FD18C024700EFC10BD0574894E31D0ED380AF3F32361A639A9938EEE7FAB98A',
}

TxFormats.forEach(Tx => {
  Object.keys(rawSigningPubKeys).forEach(KeyType => {
    console.log(
      KeyType + ' - rawSigning card Account:',
      lib.rawSigning.accountAddress(rawSigningPubKeys[KeyType])
    )

    const PreparedAuthorization = lib.rawSigning.prepare(Tx, rawSigningPubKeys[KeyType])
    // console.log({PreparedAuthorization})
    console.log(
      PreparedAuthorization.message,
      PreparedAuthorization.hashToSign
    )

    const Completed = lib.rawSigning.complete(PreparedAuthorization, rawSignatures[KeyType])
    console.log(
      Completed.signedTransaction,
      verify(claim, Completed.signedTransaction, (KeyType === 'ed25519' ? 'ED' : '') + rawSigningPubKeys[KeyType])
    )
    
    console.log()    
  })
})
