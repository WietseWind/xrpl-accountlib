"use strict";

import * as Utils from "../utils";
import {computeBinaryTransactionHash} from 'ripple-hashes'
import assert from 'assert'
import {RippleAPI} from 'ripple-lib'
import {decode} from 'ripple-binary-codec'

type PreparedRawTransaction = {
  uncompressedPubKey: string
  signingPubKey: string
  multiSign: boolean
  transaction: Record<string, unknown>
  message: string
  hashToSign: string
}

type SignedRawObject = {
  type: "SignedTx" | "MultiSignedTx";
  txnSignature: string
  signatureVerifies: boolean
  txJson: Record<string, unknown>
  signedTransaction: string
  id: string,
}

type SignerAndSignature = {
  pubKey: string
  signature: string
}

const assertUncompressedPubKey = (uncompressedPubKey: string): void => {
  assert(typeof uncompressedPubKey === 'string', 'Uncompressed PubKey: string expected')
  if (uncompressedPubKey.length === 64) {
    assert(Utils.getAlgorithmFromKey('ED' + uncompressedPubKey) === 'ed25519', 'Key length ed25519, algo not ed25519')
  } else {
    assert(uncompressedPubKey.length === 130, 'Uncompressed PubKey: incorrect length')
    assert(uncompressedPubKey.slice(0, 2) === '04', 'Uncompressed PubKey: should start with "04"')
  }
}

/**
 * Prepare a transaction for a Raw card: get Hash to sign
 */
const prepare = (
  txJson: Record<string, unknown>,
  uncompressedPubKey: string,
  multiSign = false
): PreparedRawTransaction => {
  assertUncompressedPubKey(uncompressedPubKey)
  
  const signingPubKey = Utils.compressPubKey(uncompressedPubKey)

  const transaction = Object.assign({}, txJson)
  assert(typeof transaction === 'object' && transaction !== null, 'Transaction: Object expected')
  if (typeof transaction.signingPubKey === 'undefined') {
    Object.assign(transaction, {SigningPubKey: signingPubKey})
  }

  if (multiSign) {
    Object.assign(transaction, {SigningPubKey: ''})
  }

  const message = Utils.encodeTransaction(
    transaction,
    multiSign
      ? Utils.deriveAddress(signingPubKey)
      : undefined
  )

  const hashToSign = Utils.getAlgorithmFromKey(signingPubKey) === 'ed25519'
     ? message
     : Utils.bytesToHex(Utils.hash(message))

  return {
    uncompressedPubKey,
    signingPubKey,
    multiSign,
    transaction,
    message,
    hashToSign
  }
}

const complete = (
  Prepared: PreparedRawTransaction,
  signature: string
): SignedRawObject => {
  assertUncompressedPubKey(Prepared.uncompressedPubKey)
  assert(typeof signature === 'string', 'signature: string expected')
  assert(signature.length === 128, 'signature: incorrect length')

  const txnSignature = Utils.getAlgorithmFromKey(Prepared.signingPubKey) === 'ed25519'
    ? signature
    : Utils.secp256k1_p1363ToFullyCanonicalDerSignature(signature)

  const signatureVerifies = Utils.verifySignature(Prepared.message, txnSignature, Prepared.signingPubKey)

  let txJson: Record<string, unknown> = {}
  let signedTransaction: string = ''
  let id: string = ''

  Object.assign(txJson, Prepared.transaction)

  if (signatureVerifies) {
    Object.assign(txJson, {TxnSignature: txnSignature})
    signedTransaction = Utils.encodeTransaction(txJson)
    id = computeBinaryTransactionHash(signedTransaction)
  }

  return {
    type: 'SignedTx',
    txnSignature,
    signatureVerifies,
    txJson,
    signedTransaction,
    id
  }
}

const completeMultiSigned = (
  txJson: Record<string, unknown>,
  SignersAndSignatures: SignerAndSignature[]
): SignedRawObject => {
  assert(Array.isArray(SignersAndSignatures), 'SignersAndSignatures not array')
  assert(SignersAndSignatures.length > 0, 'SignersAndSignatures empty')

  const transaction = Object.assign({}, txJson)
  Object.assign(transaction, {SigningPubKey: ''})
  // const hashToSign = Utils.bytesToHex(Utils.hash(message))

  const toCombine = SignersAndSignatures.map(SignerAndSignature => {
    const pubKey = SignerAndSignature.pubKey.length === 130
      ? Utils.compressPubKey(SignerAndSignature.pubKey)
      : (SignerAndSignature.pubKey.length === 64
          ? 'ED' + SignerAndSignature.pubKey
          : SignerAndSignature.pubKey)

    const signerAddress = Utils.deriveAddress(pubKey)

    const txnSignature = Utils.getAlgorithmFromKey(pubKey) === 'ed25519'
      ? SignerAndSignature.signature
      : Utils.secp256k1_p1363ToFullyCanonicalDerSignature(SignerAndSignature.signature)

    const message = Utils.encodeTransaction(transaction, signerAddress)

    // console.log({message, txnSignature, pubKey})
    const signatureVerifies = Utils.verifySignature(message, txnSignature, pubKey)
    assert(signatureVerifies, 'Invalid signature by/for ' + signerAddress)

    Object.assign(transaction, {
      Signers: [
        {
          Signer: {
            Account: signerAddress,
            SigningPubKey: pubKey,
            TxnSignature: txnSignature
          }
        }
      ]
    })
  
    const MultiSignature = {
      signerAddress,
      signature: SignerAndSignature.signature,
      verifies: signatureVerifies,
      transaction,
      signedTransaction: Utils.encodeTransaction(transaction)
    }

    return MultiSignature
  })

  // console.dir(toCombine, {depth: null})
  const combined = (new RippleAPI()).combine(toCombine.map(c => c.signedTransaction))
  const signedTransaction = String((combined as Record<string, unknown>).signedTransaction || '')

  return {
    type: "MultiSignedTx",
    txnSignature: '',
    signatureVerifies: toCombine.every(s => s.verifies),
    txJson: decode(signedTransaction),
    signedTransaction,
    id: String((combined as Record<string, unknown>).id || '')
  }
}

const accountAddress = (uncompressedPubKey: string): string => {
  assertUncompressedPubKey(uncompressedPubKey)
  const signingPubKey = Utils.compressPubKey(uncompressedPubKey)
  return Utils.deriveAddress(signingPubKey)
}

export {
  accountAddress,
  prepare,
  complete,
  completeMultiSigned
};
