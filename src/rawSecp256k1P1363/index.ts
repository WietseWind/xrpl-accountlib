"use strict";

import * as Utils from "../utils";
import {computeBinaryTransactionHash} from 'ripple-hashes'
import assert from 'assert'
import {RippleAPI} from 'ripple-lib'
import {decode} from 'ripple-binary-codec'

type PreparedRawSecp256k1P1363Transaction = {
  UncompressedPubKey: string
  SigningPubKey: string
  MultiSign: boolean
  Transaction: Record<string, unknown>
  Message: string
  HashToSign: string
}

type SignedRawSecp256k1P1363Transaction = {
  TxnSignature: string
  SignatureVerifies: boolean
  TxJson: Record<string, unknown>
  TxBlob: string
  TxId: string
}

type SignerAndSignature = {
  PubKey: string
  Signature: string
}

const assertUncompressedPubKey = (UncompressedPubKey: string): void => {
  assert(typeof UncompressedPubKey === 'string', 'Uncompressed PubKey: string expected')
  assert(UncompressedPubKey.length === 130, 'Uncompressed PubKey: incorrect length')
  assert(UncompressedPubKey.slice(0, 2) === '04', 'Uncompressed PubKey: should start with "04"')
}

/**
 * Prepare a transaction for a RawSecp256k1P1363 card: get Hash to sign
 */
const prepare = (
  TxJson: Record<string, unknown>,
  UncompressedPubKey: string,
  MultiSign = false
): PreparedRawSecp256k1P1363Transaction => {
  assertUncompressedPubKey(UncompressedPubKey)
  
  const SigningPubKey = Utils.compressPubKey(UncompressedPubKey)

  const Transaction = Object.assign({}, TxJson)
  assert(typeof Transaction === 'object' && Transaction !== null, 'Transaction: Object expected')
  if (typeof Transaction.SigningPubKey === 'undefined') {
    Object.assign(Transaction, {SigningPubKey})
  }

  if (MultiSign) {
    Object.assign(Transaction, {SigningPubKey: ''})
  }

  const Message = Utils.encodeTransaction(
    Transaction,
    MultiSign
      ? Utils.deriveAddress(SigningPubKey)
      : undefined
  )
  const HashToSign = Utils.bytesToHex(Utils.hash(Message))

  return {
    UncompressedPubKey,
    SigningPubKey,
    MultiSign,
    Transaction,
    Message,
    HashToSign
  }
}

const complete = (
  Prepared: PreparedRawSecp256k1P1363Transaction,
  Signature: string
): SignedRawSecp256k1P1363Transaction => {
  assertUncompressedPubKey(Prepared.UncompressedPubKey)
  assert(typeof Signature === 'string', 'Signature: string expected')
  assert(Signature.length === 128, 'Signature: incorrect length')

  const TxnSignature = Utils.secp256k1_p1363ToFullyCanonicalDerSignature(Signature)
  const SignatureVerifies = Utils.verifySignature(Prepared.Message, TxnSignature, Prepared.SigningPubKey)

  let TxJson: Record<string, unknown> = {}
  let TxBlob: string = ''
  let TxId: string = ''

  Object.assign(TxJson, Prepared.Transaction)

  if (SignatureVerifies) {
    Object.assign(TxJson, {TxnSignature})
    TxBlob = Utils.encodeTransaction(TxJson)
    TxId = computeBinaryTransactionHash(TxBlob)
  }

  return {
    TxnSignature,
    SignatureVerifies,
    TxJson,
    TxBlob,
    TxId
  }
}

const completeMultiSigned = (
  TxJson: Record<string, unknown>,
  SignersAndSignatures: SignerAndSignature[]
): SignedRawSecp256k1P1363Transaction => {
  assert(Array.isArray(SignersAndSignatures), 'SignersAndSignatures not array')
  assert(SignersAndSignatures.length > 0, 'SignersAndSignatures empty')

  const Transaction = Object.assign({}, TxJson)
  Object.assign(Transaction, {SigningPubKey: ''})
  // const HashToSign = Utils.bytesToHex(Utils.hash(Message))

  const toCombine = SignersAndSignatures.map(SignerAndSignature => {
    const PubKey = SignerAndSignature.PubKey.length === 130
      ? Utils.compressPubKey(SignerAndSignature.PubKey)
      : SignerAndSignature.PubKey
    const SignerAddress = Utils.deriveAddress(PubKey)

    const TxnSignature = Utils.secp256k1_p1363ToFullyCanonicalDerSignature(SignerAndSignature.Signature)
    const Message = Utils.encodeTransaction(Transaction, SignerAddress)

    // console.log({Message, TxnSignature, PubKey})
    const SignatureVerifies = Utils.verifySignature(Message, TxnSignature, PubKey)
    assert(SignatureVerifies, 'Invalid signature by/for ' + SignerAddress)

    Object.assign(Transaction, {
      Signers: [
        {
          Signer: {
            Account: SignerAddress,
            SigningPubKey: PubKey,
            TxnSignature: TxnSignature
          }
        }
      ]
    })
  
    const MultiSignature = {
      SignerAddress,
      signature: SignerAndSignature.Signature,
      verifies: SignatureVerifies,
      Transaction,
      signedTransaction: Utils.encodeTransaction(Transaction)
    }

    return MultiSignature
  })

  // console.dir(toCombine, {depth: null})
  const combined = (new RippleAPI()).combine(toCombine.map(c => c.signedTransaction))
  const TxBlob = String((combined as Record<string, unknown>).signedTransaction || '')

  return {
    TxnSignature: '',
    SignatureVerifies: toCombine.every(s => s.verifies),
    TxJson: decode(TxBlob),
    TxBlob,
    TxId: String((combined as Record<string, unknown>).id || '')
  }
}

const accountAddress = (UncompressedPubKey: string): string => {
  assertUncompressedPubKey(UncompressedPubKey)
  const SigningPubKey = Utils.compressPubKey(UncompressedPubKey)
  return Utils.deriveAddress(SigningPubKey)
}

export {
  accountAddress,
  prepare,
  complete,
  completeMultiSigned
};
