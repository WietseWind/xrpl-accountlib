'use strict'

const XRPL_Account = require('../../types/XRPL_Account')
const Sign = require('ripple-sign-keypairs')

const sign = (Transaction, Account) => {
  let accounts = []

  if (Account instanceof Object && !Array.isArray(Account)) {
    if (Account instanceof XRPL_Account) {
      accounts.push(Account)
    } else {
      throw new Error('Account not instanceof XRPL_Account')
    }
  } else if (Array.isArray(Account)) {
    Account.forEach(account => {
      if (account instanceof XRPL_Account) {
        accounts.push(account)
      } else {
        throw new Error('Account not instanceof XRPL_Account')
      }
    })
  }

  if (accounts.length === 1) {
    const txJSON = JSON.stringify(Transaction)
    const tx = Sign(txJSON, accounts[0].keypair)
    return {
      type: 'SignedTx',
      id: tx.id,
      signedTransaction: tx.signedTransaction,
      txJson: tx.txJson,
      signers: [ accounts[0].address ]
    }
  } else {
    const RippleLibApi = require('ripple-lib').RippleAPI
    const RippleApi = new RippleLibApi()
    const Codec = require('ripple-binary-codec')

    const MultiSignedTransactionBinary = RippleApi.combine(accounts.map(account => {
      return Sign(JSON.stringify(Transaction), account.keypair, { signAs: account.address }).signedTransaction
    }))

    return {
      type: 'MultiSignedTx',
      id: MultiSignedTransactionBinary.id,
      signedTransaction: MultiSignedTransactionBinary.signedTransaction,
      txJson: Codec.decode(MultiSignedTransactionBinary.signedTransaction),
      signers: accounts.map(a => { 
        return a.address
      })
    }
  }
}

module.exports = sign