"use strict";

import BN from "bn.js";
import * as AddressCodec from "ripple-address-codec";
import Bip39 from "bip39";
import * as elliptic from 'elliptic'
import {verify, deriveAddress} from 'ripple-keypairs'
import assert from 'assert'
import hashjs from 'hash.js'
import {encode, encodeForSigning, encodeForMultisigning} from 'ripple-binary-codec'

// Ugly, but no definitions when directly loading the lib file, and Signature() not exported in lib
const Signature = require('elliptic/lib/elliptic/ec/signature')

function bytesToHex(a: number[]): string {
  return a
    .map(function(byteValue) {
      const hex = byteValue.toString(16).toUpperCase();
      return hex.length > 1 ? hex : "0" + hex;
    })
    .join("");
}

function hexToBytes(a: string): number[] {
  return new BN(a, 16).toArray(undefined, a.length / 2);
}

function bufferToHext(buffer: Buffer): string {
  return buffer.toString("hex").toUpperCase();
}

function getAlgorithmFromKey(key: string) {
  const bytes = hexToBytes(key);
  return bytes.length === 33 && bytes[0] === 0xed ? "ed25519" : "secp256k1";
}

function isValidClassicAddress(address: string): boolean {
  return AddressCodec.isValidClassicAddress(address);
}

function isValidAddress(address: string): boolean {
  return isValidClassicAddress(address);
}

function isValidSeed(seed: string): boolean {
  return AddressCodec.isValidSeed(seed);
}

function isValidMnemnic(words: string): boolean {
  return Bip39.validateMnemonic(words);
}

function compressPubKey(uncompressedPubKey: string, curve = 'secp256k1'): string {  
  // Only secp256k1 for now, possibly (future) eg. 'curve25519', 'ed25519', ...
  const validCurves = ['secp256k1']
  assert(validCurves.indexOf(curve) > -1, 'Unsupported curve')
  assert(typeof uncompressedPubKey === 'string', 'Uncompressed PubKey: not hex string')
  assert(uncompressedPubKey.length === 130, 'Uncompressed pubkey: not 1+32+32 length')

  // @ts-ignore
  const c = elliptic.curves[curve].curve
  const p = c.point(uncompressedPubKey.slice(2, 66), uncompressedPubKey.slice(66))

  const compressedPubKey = p.encodeCompressed('hex').toUpperCase()
  
  const algo = getAlgorithmFromKey(compressedPubKey)
  assert(algo === 'secp256k1', 'Unsupported curve: ' + algo)

  return compressedPubKey
}

function hash(hex: string): number[] {
  return hashjs
    .sha512()
    .update(hexToBytes(hex))
    .digest()
    .slice(0, 32)
}

function encodeTransaction(TxJson: Record<string, unknown>, MultiSignAccount?: string): string {
  const Transaction = Object.assign({}, TxJson)
  if (typeof MultiSignAccount !== 'undefined') {
    Object.assign(Transaction, {SigningPubKey: ''})
    return encodeForMultisigning(Transaction, MultiSignAccount)
  } else if (typeof Transaction.TxnSignature === 'undefined' && typeof Transaction.Signers === 'undefined') {
    // Regular TX signing
    return encodeForSigning(Transaction)
  } else {
    // Signed TX (tx_blob)
    return encode(Transaction)
  }
}

function secp256k1_p1363ToFullyCanonicalDerSignature(p1363Signature: string): string {
  const rs = {
    n: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141',
    r: p1363Signature.slice(0, 64),
    s: p1363Signature.slice(64)
  }
  
  const bn = {
    n: new BN(rs.n, 16),
    s: new BN(rs.s, 16)
  }

  const nMinusS = bn.n.sub(bn.s)
  rs.s = (nMinusS.lt(bn.s) ? nMinusS : bn.s).toString(16).toUpperCase()  
  
  const nonCanonicalDer = new Signature(rs).toDER()
  return Buffer.from(nonCanonicalDer).toString('hex').toUpperCase()
}

export {
  bytesToHex,
  hexToBytes,
  bufferToHext,
  getAlgorithmFromKey,
  isValidAddress,
  isValidClassicAddress,
  isValidSeed,
  isValidMnemnic,
  deriveAddress,
  compressPubKey,
  hash,
  encodeTransaction,
  secp256k1_p1363ToFullyCanonicalDerSignature,
  verify as verifySignature
};
