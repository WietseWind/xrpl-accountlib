"use strict";

/**
 * SLIP-0010 ed25519 key derivation (https://github.com/satoshilabs/slips/blob/master/slip-0010.md)
 * BIP32 only defines derivation for secp256k1, ed25519 derivation follows
 * SLIP-0010, which only supports hardened path segments.
 */

import { createHmac } from "crypto";
import * as Elliptic from "elliptic";

const Ed25519 = new Elliptic.eddsa("ed25519");

const ED25519_CURVE = "ed25519 seed";
const HARDENED_OFFSET = 0x80000000;

export type Keys = {
  key: Buffer;
  chainCode: Buffer;
};

const getMasterKeyFromSeed = (seed: Buffer): Keys => {
  const I = createHmac("sha512", ED25519_CURVE).update(seed).digest();
  return {
    key: I.slice(0, 32),
    chainCode: I.slice(32),
  };
};

const childKeyDerivation = (parent: Keys, index: number): Keys => {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32BE(index, 0);

  const data = Buffer.concat([Buffer.alloc(1, 0), parent.key, indexBuffer]);
  const I = createHmac("sha512", parent.chainCode).update(data).digest();

  return {
    key: I.slice(0, 32),
    chainCode: I.slice(32),
  };
};

const isValidPath = (path: string): boolean => {
  if (!/^m(\/\d+')*$/.test(path)) {
    return false;
  }

  return path
    .split("/")
    .slice(1)
    .map((segment) => parseInt(segment, 10))
    .every((segment) => !isNaN(segment) && segment < HARDENED_OFFSET);
};

const derivePath = (path: string, seed: Buffer): Keys => {
  if (!isValidPath(path)) {
    throw new Error(
      "Invalid ed25519 derivation path: SLIP-0010 only supports hardened " +
        "path segments, e.g. m/44'/144'/0'/0'/0'"
    );
  }

  return path
    .split("/")
    .slice(1)
    .map((segment) => parseInt(segment, 10))
    .reduce(
      (parent, segment) => childKeyDerivation(parent, segment + HARDENED_OFFSET),
      getMasterKeyFromSeed(seed)
    );
};

const getPublicKey = (key: Buffer): Buffer => {
  // @ts-ignore
  return Buffer.from(Ed25519.keyFromSecret(key.toString("hex")).pubBytes());
};

export { getMasterKeyFromSeed, derivePath, getPublicKey, isValidPath };
