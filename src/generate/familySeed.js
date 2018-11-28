'use strict'

const Account = require('../../types/XRPL_Account')
const Keypairs = require('ripple-keypairs')

const familySeed = (options = {}) => {
  const algorithm = options.algorithm === 'ed25519' ? 'ed25519' : 'secp256k1'
  const Familyseed = Keypairs.generateSeed({ algorithm: algorithm })
  const Keypair = Keypairs.deriveKeypair(Familyseed)
  const Address = Keypairs.deriveAddress(Keypair.publicKey)
  return new Account({
    algorithm: algorithm,
    address: Address,
    familySeed: Familyseed,
    keypair: Keypair
  })
}

module.exports = familySeed
