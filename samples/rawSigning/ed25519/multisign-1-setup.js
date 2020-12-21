const lib = require("../../../dist/");
const {accounts} = require('./fixtures')

const SignerListSetupTx = {
  Flags: 0,
  TransactionType: 'SignerListSet',
  Account: accounts.wietse.accountAddress,
  Sequence: 13371003,
  Fee: "12",
  SignerQuorum: 2,
  SignerEntries: [
    { SignerEntry: { Account: accounts.ali     .accountAddress, SignerWeight: 1 } },
    { SignerEntry: { Account: accounts.tristan .accountAddress, SignerWeight: 1 } }
  ]
}

console.log("XRPL-AccountLib - rawSigning MultiSign - ed25519")
console.log()

const PreparedSignerListSetupTx = lib.rawSigning.prepare(SignerListSetupTx, accounts.wietse.uncompressedPubKey)
console.log({PreparedSignerListSetupTx})

const SetupSignature = '381C32A2AFF9E43616FAF5B6DA93ADEB9F0613594EC19811C35E78CF72DF4F35C296E2BF240065BA6BA43FE541AD17BCCE3970BD91F9B486C7C64226030FD100'
const CompletedSignerListSetup = lib.rawSigning.complete(PreparedSignerListSetupTx, SetupSignature)
console.log({CompletedSignerListSetup})
// Now submit to XRPL:
//  b=XXXXXX (CompletedSignerListSetup.TxBlob)
//  wscat -c wss://testnet.xrpl-labs.com -w 10 -x '{"command":"submit","tx_blob":"'$b'"}'
//  CompletedSignerListSetup.TxBlob (if CompletedSignerListSetup.SignatureVerifies === true)

console.log()
