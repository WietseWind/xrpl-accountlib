const lib = require("../../dist/");
const {accounts} = require('./fixtures')

const SignerListSetupTx = {
  Flags: 0,
  TransactionType: 'SignerListSet',
  Account: accounts.wietse.accountAddress,
  Sequence: 12855632,
  Fee: "12",
  SignerQuorum: 2,
  SignerEntries: [
    { SignerEntry: { Account: accounts.ali     .accountAddress, SignerWeight: 1 } },
    { SignerEntry: { Account: accounts.tristan .accountAddress, SignerWeight: 1 } }
  ]
}

console.log("XRPL-AccountLib - rawSecp256k1P1363 MultiSign")
console.log()

const PreparedSignerListSetupTx = lib.rawSecp256k1P1363.prepare(SignerListSetupTx, accounts.wietse.uncompressedPubKey)
console.log({PreparedSignerListSetupTx})

const SetupSignature = 'A22D3E9E004A24BAC7CA35F0A7661EBD0DDC856F6AEC91EF1138085A8BF3DCE4C593F0B633DA76B55468E4A184F06F192B1C51B56744B1857FC5DC95CEDDC8BF'
const CompletedSignerListSetup = lib.rawSecp256k1P1363.complete(PreparedSignerListSetupTx, SetupSignature)
console.log({CompletedSignerListSetup})
// Now submit to XRPL:
//  b=XXXXXX (CompletedSignerListSetup.TxBlob)
//  wscat -c wss://testnet.xrpl-labs.com -w 10 -x '{"command":"submit","tx_blob":"'$b'"}'
//  CompletedSignerListSetup.TxBlob (if CompletedSignerListSetup.SignatureVerifies === true)

console.log()
