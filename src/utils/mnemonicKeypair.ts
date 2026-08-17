"use strict";

/**
 * Shared BIP39 mnemonic keypair derivation for derive.mnemonic and
 * generate.mnemonic. Keep this module free of imports from ../utils or
 * ../schema/Account (runtime): they require ../derive and would create a
 * circular dependency.
 */

import { mnemonicToSeedSync } from "bip39";
import * as Bip32 from "bip32";

import type { Algorithms } from "../schema/Account";

import { normalizeAlgorithm } from "./algorithm";
import * as Slip10 from "./slip10";

export type MnemonicDerivationOptions = {
  passphrase?: string;
  accountPath?: string;
  changePath?: string;
  addressIndex?: number;
  algorithm?: Algorithms;
};

export type MnemonicKeypair = {
  algorithm: Algorithms;
  path: string;
  keypair: {
    publicKey: string;
    privateKey: string;
  };
};

const bufferToHext = (buffer: Buffer): string =>
  buffer.toString("hex").toUpperCase();

const mnemonicKeypair = (
  words: string,
  options: MnemonicDerivationOptions = {}
): MnemonicKeypair => {
  const passphrase = options.passphrase ? options.passphrase : undefined;

  const algorithm: Algorithms = normalizeAlgorithm(
    options.algorithm,
    "secp256k1"
  );

  const accountPath =
    options.accountPath && !isNaN(parseInt(options.accountPath))
      ? options.accountPath
      : 0;
  const changePath =
    options.changePath && !isNaN(parseInt(options.changePath))
      ? options.changePath
      : 0;
  const addressIndex =
    options.addressIndex && !isNaN(options.addressIndex)
      ? options.addressIndex
      : 0;

  // ed25519 (SLIP-0010) only supports hardened derivation
  const Path =
    algorithm === "ed25519"
      ? `m/44'/144'/${accountPath}'/${changePath}'/${addressIndex}'`
      : `m/44'/144'/${accountPath}'/${changePath}/${addressIndex}`;

  const Seed = mnemonicToSeedSync(words, passphrase);

  if (algorithm === "ed25519") {
    const Node = Slip10.derivePath(Path, Seed);
    return {
      algorithm,
      path: Path,
      keypair: {
        publicKey: "ED" + bufferToHext(Slip10.getPublicKey(Node.key)),
        privateKey: "ED" + bufferToHext(Node.key),
      },
    };
  }

  const m = Bip32.fromSeed(Seed);
  const Node = m.derivePath(Path);
  const publicKey = bufferToHext(Node.publicKey);
  // @ts-ignore
  const privateKey = bufferToHext(Node.privateKey);

  return {
    algorithm,
    path: Path,
    keypair: {
      publicKey: publicKey,
      privateKey: "00" + privateKey,
    },
  };
};

export default mnemonicKeypair;
