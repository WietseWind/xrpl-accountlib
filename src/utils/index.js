'use strict';

const BN = require('bn.js');
const AddressCodec = require('ripple-address-codec');
const Bip39 = require("bip39")

function bytesToHex(a) {
  return a.map(function(byteValue) {
    const hex = byteValue.toString(16).toUpperCase()
    return hex.length > 1 ? hex : '0' + hex
  }).join('')
}

function hexToBytes(a) {
  return (new BN(a, 16)).toArray(null, a.length / 2)
}

function getAlgorithmFromKey(key) {
  const bytes = hexToBytes(key)
  return (bytes.length === 33 && bytes[0] === 0xED) ?
    'ed25519' : 'secp256k1'
}

function isValidAddress(address){
  return AddressCodec.isValidAddress(address)
}


function isValidSeed(seed){
    return AddressCodec.isValidSeed(seed)
}

function isValidMnemnic(words){
  return Bip39.validateMnemonic(words)
}


module.exports = {
  bytesToHex,
  hexToBytes,
  getAlgorithmFromKey,
  isValidAddress,
  isValidSeed,
  isValidMnemnic
};
