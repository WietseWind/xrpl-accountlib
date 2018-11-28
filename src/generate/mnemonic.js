'use strict'

const Account = require('../../types/XRPL_Account')
const Bip39 = require("bip39")
const Bip32 = require("ripple-bip32")
const Keypairs = require('ripple-keypairs')

const mnemonic = (options = {}) => {
  const passphrase = options.passphrase ? options.passphrase : null
  const strength = options.strength ? options.strength : 256
  const Wordlist = options.wordlist && Object.keys(Bip39.wordlists).indexOf(options.wordlist) > -1 ? Bip39.wordlists[options.wordlist] : null
  const words = Bip39.generateMnemonic(strength, null, Wordlist)

  const accountPath = options.accountPath && !isNaN(parseInt(options.accountPath)) ? options.accountPath : 0
  const changePath = options.changePath && !isNaN(parseInt(options.changePath)) ? options.changePath : 0
  const addressIndex = options.addressIndex && !isNaN(parseInt(options.addressIndex)) ? options.addressIndex : 0

  const Path = `m/44'/144'/${accountPath}'/${changePath}/${addressIndex}`

  const Seed = Bip39.mnemonicToSeed(words, passphrase)
  const m = Bip32.fromSeedBuffer(Seed)
  const Keypair = m.derivePath(Path).keyPair.getKeyPairs()
  const Address = Keypairs.deriveAddress(Keypair.publicKey)
  
  return new Account({
    address: Address,
    mnemonic: words,
    passphrase: passphrase,
    keypair: Keypair,
    path: Path
  })
}

module.exports = mnemonic
