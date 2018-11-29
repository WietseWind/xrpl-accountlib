const lib = require('../')

console.log('XRPL-AccountLib')
console.log()

/**
 * You can try this at TestNet,
 *    https://developers.ripple.com/xrp-test-net-faucet.html
 * Using:
 *    https://xrp.fans/ (Click the "Switch to TESTNET" button)
 */

const Tx = {
  TransactionType: 'Payment',
  Account: 'rQQQQQQQ...',
  Fee: '1000',
  Destination: 'rWWWWWWWW...',
  Amount: '133701337',
  Sequence: 4
}

console.log('Sign: one account', lib.sign(Tx, lib.derive.familySeed('sXXXXXXXX...')))
console.log()

console.log('Sign: multiSign', lib.sign(Tx, [
  lib.derive.familySeed('sYYYYYYYY...'),
  lib.derive.familySeed('sZZZZZZZZ...')
]))
console.log()
