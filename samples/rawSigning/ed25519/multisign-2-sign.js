const lib = require("../../../dist/");
const {accounts} = require('./fixtures')

const TxToMultiSign = {
  TransactionType: 'Payment',
  Sequence: 13371004,
  Fee: '500',
  Amount: '1337',
  Account: accounts.wietse.accountAddress,
  Destination: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ'
}

console.log("XRPL-AccountLib - rawSigning MultiSign - ed25519")
console.log()

const SignedByTristan = lib.rawSigning.prepare(TxToMultiSign, accounts.tristan .uncompressedPubKey, true)
const SignedByAli     = lib.rawSigning.prepare(TxToMultiSign, accounts.ali     .uncompressedPubKey, true)

console.log({SignedByTristan, SignedByAli})

const Signatures = {
  ali: '659053A8359356097BD581C40F60A6F1BBE5B2BAB62140199FA0E617A54540981AD2797AFA0598CE28806A9D1DEB8B68AD3074F0AA13AD7CAB47626E647A3B09',
  tristan: '52062E54FB62A63B1C46413137F25F641F06AB9A5A24C1988397ACE61423DBFF6C7CAD28B8BD3F6C2659F601F5AA7056F128361BEF69F13E0E226962FFD10C00',
}

const MappedSignatures = Object.keys(Signatures).map(s => {
  return {
    pubKey: accounts[s].uncompressedPubKey,
    signature: Signatures[s]
  }
})
console.log({MappedSignatures})
const MultiSignedTx = lib.rawSigning.completeMultiSigned(TxToMultiSign, MappedSignatures)
console.log({MultiSignedTx})
// Now submit to XRPL:
//  b=XXXXXX (MultiSignedTx.TxBlob)
//  wscat -c wss://testnet.xrpl-labs.com -w 10 -x '{"command":"submit","tx_blob":"'$b'"}'
//  MultiSignedTx.TxBlob (if MultiSignedTx.SignatureVerifies === true)

console.log()
