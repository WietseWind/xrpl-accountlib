'use strict'

const Utils = require('../src/utils')
const Keypairs = require('ripple-keypairs')
const AddressCodec = require('ripple-address-codec')
const Elliptic = require('elliptic')
const Ed25519 = Elliptic.eddsa('ed25519')
const Secp256k1 = Elliptic.ec('secp256k1')

class XRPL_Account {
  constructor (options = {}) {
    /**
     * Define object struct
     */
    this.accountType = null
    this.address = null
    this.secret = {
      familySeed: null,
      mnemonic: null,
      passphrase: null,
      path: null
    }
    this.keypair = {
      algorithm: null,
      publicKey: null,
      privateKey: null
    }

    /**
     * Check & apply address
     */
    if (options.address) {
      if (AddressCodec.isValidAddress(options.address)) {
        this.address = options.address
      }
    }

    /**
     * Check & apply account type [familySeed / mnemonic / passphrase]
     */
    if (options.passphrase) {
      this.accountType = 'passphrase'
      this.secret.passphrase = options.passphrase
    }
    if (options.familySeed) {
      this.accountType = 'familySeed'
      this.secret.familySeed = options.familySeed
    } else if (options.mnemonic) {
      this.accountType = 'mnemonic'
      this.secret.mnemonic = options.mnemonic
      if (options.path) {
        this.secret.path = options.path
      }
    }

    /**
     * Check & apply keypair, derive publicKey if only privateKey is known
     */
    if (options.keypair && options.keypair instanceof Object) {
      if (options.keypair.privateKey) {
        let prefix = ''
        if (options.keypair.privateKey.length === 64) {
          prefix = '00'
        }
        this.keypair.privateKey = prefix + options.keypair.privateKey
        
        if (this.accountType === null) {
          this.accountType = 'hex'
        }
      }
      if (options.keypair.publicKey) {
        this.keypair.publicKey = options.keypair.publicKey
      } else if (this.keypair.privateKey) {
        if (options.keypair.privateKey.slice(0, 2) === 'ED' || (options.algorithm && options.algorithm === 'ed25519')) {
          this.keypair.publicKey = 'ED' + Utils.bytesToHex(Ed25519.keyFromSecret(this.keypair.privateKey.slice(2)).pubBytes())
        } else {
          this.keypair.publicKey = Utils.bytesToHex(Secp256k1.keyFromPrivate(this.keypair.privateKey.slice(2)).getPublic().encodeCompressed())
        }
      }
    }

    /**
     * Check & apply algorithm, or retrieve from private key
     */
    if (options.algorithm) {
      this.keypair.algorithm = options.algorithm
    } else {
      if (this.keypair.privateKey) {
        this.keypair.algorithm = Utils.getAlgorithmFromKey(this.keypair.privateKey)
      }
    }

    /**
     * Derive address from publicKey if address unknown
     */
    if (this.address === null && this.keypair.publicKey !== null) {
      this.address = Keypairs.deriveAddress(this.keypair.publicKey)
    }

    // Object.assign(this, {
    //   SomeMethod () {
    //     return false
    //   }
    // })
  }
  toString () {
    return 'XPRL Account' + (this.address ? ': ' + this.address : '')
  }
}

module.exports = XRPL_Account
