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
    let signAs = {}
    if (typeof accounts[0].signAs === 'string' && accounts[0].signAs !== '') {
      // signAs explicitly set
      signAs = { signAs: accounts[0].signAs }
    }
    const tx = Sign(txJSON, accounts[0].keypair, signAs)
    return {
      type: 'SignedTx',
      id: tx.id,
      signedTransaction: tx.signedTransaction,
      txJson: tx.txJson,
      signers: [ typeof accounts[0].signAs === 'string' ? accounts[0].signAs : accounts[0].address ]
    }
  } else {
    const RippleLibApi = require('ripple-lib').RippleAPI
    const RippleApi = new RippleLibApi()
    const Codec = require('ripple-binary-codec')

    const MultiSignedTransactionBinary = (() => {
      if (Transaction instanceof Object && Array.isArray(Transaction) && typeof Account === 'undefined' && Transaction.length > 0) {
        if (Transaction.length === Transaction.filter(t => { return t instanceof Object && t !== null && typeof t.signedTransaction === 'string' }).length) {
          // MultiSign [ { signedTransaction: ... } , ... ]
          return RippleApi.combine(Transaction.map(t => { 
            return t.signedTransaction 
          }))
        } else if (Transaction.length === Transaction.filter(t => { return typeof t === 'string' && t.toUpperCase().match(/^[A-F0-9]+$/) }).length) {
          // MultiSign [ 'AEF9...', 'C6DA...' ]
          return RippleApi.combine(Transaction.map(t => { 
            return t.toUpperCase() 
          }))
        } else {
          throw new Error('TX Blob for multiSign not an array of { signedTransaction: ... } objects or blob strings')
        }
      } else {
        // MultiSign [ lib.sign(...), lib.sign(...) ]
        return RippleApi.combine(accounts.map(account => {
          return Sign(JSON.stringify(Transaction), account.keypair, { signAs: typeof account.signAs === 'string' ? account.signAs : account.address }).signedTransaction
        }))
      }
    })()

    const txJson = Codec.decode(MultiSignedTransactionBinary.signedTransaction)
    return {
      type: 'MultiSignedTx',
      id: MultiSignedTransactionBinary.id,
      signedTransaction: MultiSignedTransactionBinary.signedTransaction,
      txJson: txJson,
      signers: txJson.Signers
    }
  }
}

module.exports = sign