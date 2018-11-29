'use strict'

const Account = require('../../types/XRPL_Account')

const privatekey = (hex) => {
  // Account{} will recover required data
  return new Account({
    keypair: { privateKey: hex }
  })
}

module.exports = privatekey
