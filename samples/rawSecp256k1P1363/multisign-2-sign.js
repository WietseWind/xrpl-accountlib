const lib = require("../../dist/");
const {accounts} = require('./fixtures')

const TxToMultiSign = {
  TransactionType: 'Payment',
  Sequence: 12855634,
  Fee: '500',
  Amount: '1337',
  Account: 'rG9eprWEMoVyoesnVaouEJ26UEwXszpNJ8',
  Destination: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ'
}

console.log("XRPL-AccountLib - rawSecp256k1P1363 MultiSign")
console.log()

const SignedByTristan = lib.rawSecp256k1P1363.prepare(TxToMultiSign, accounts.tristan .uncompressedPubKey, true)
const SignedByAli     = lib.rawSecp256k1P1363.prepare(TxToMultiSign, accounts.ali     .uncompressedPubKey, true)

console.log({SignedByTristan, SignedByAli})

const Signatures = {
  ali: 'F247FD09A57328510BB33AF9BD4821700CDFE48FD0C2FB19D580E7911A3B106CF55837345EE750A1A6D8949D2581B6DC4385C033745FDCBE60EB0F6C5C75087B',
  tristan: 'E0D073C1EE29075A966C60B61B0C2E26E555239CBC797460A8DE77B194EDFC976681692600E690EEB29ABD3123444980772C6D0423B49D695F694745CBB6414C',
}

const MultiSignedTx = lib.rawSecp256k1P1363.completeMultiSigned(TxToMultiSign, Object.keys(Signatures).map(s => {
  return {
    PubKey: accounts[s].uncompressedPubKey,
    Signature: Signatures[s]
  }
}))
console.log({MultiSignedTx})
// Now submit to XRPL:
//  b=XXXXXX (MultiSignedTx.TxBlob)
//  wscat -c wss://testnet.xrpl-labs.com -w 10 -x '{"command":"submit","tx_blob":"'$b'"}'
//  MultiSignedTx.TxBlob (if MultiSignedTx.SignatureVerifies === true)

console.log()
