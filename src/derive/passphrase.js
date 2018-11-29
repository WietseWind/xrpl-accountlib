'use strict'

const Account = require('../../types/XRPL_Account')
const hashjs = require('hash.js')
const SecretCodec = require('ripple-secret-codec')
const Keypairs = require('ripple-keypairs')

const passphrase = (phrase) => {
  const hash = hashjs.sha512().update(phrase).digest('hex').toUpperCase()
  const hexSeed = hash.substring(0, 32)
  const familySeed = SecretCodec.encodeHex(hexSeed).secret_b58
  const keypair = Keypairs.deriveKeypair(familySeed)
  const address = Keypairs.deriveAddress(keypair.publicKey)

  return new Account({
    familySeed: familySeed,
    address: address,
    passphrase: phrase,
    keypair: keypair
  })
}

module.exports = passphrase
