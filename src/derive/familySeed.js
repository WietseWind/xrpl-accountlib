'use strict'

const Account = require('../../types/XRPL_Account')
const Keypairs = require('ripple-keypairs')
const Utils = require('../utils')

const familySeed = (familyseed) => {
  const Keypair = Keypairs.deriveKeypair(familyseed)
  const Address = Keypairs.deriveAddress(Keypair.publicKey)
  return new Account({
    algorithm: Utils.getAlgorithmFromKey(Keypair.privateKey),
    address: Address,
    familySeed: familyseed,
    keypair: Keypair
  })
}

module.exports = familySeed
