"use strict";

import { wordlists, generateMnemonic } from "bip39";
import { deriveAddress } from "ripple-keypairs";
import { randomBytes } from "crypto";

import Account, { Algorithms } from "../schema/Account";

import mnemonicKeypair from "../utils/mnemonicKeypair";

type Options = {
  passphrase?: string;
  strength?: number;
  wordlist?: string;
  accountPath?: string;
  changePath?: string;
  addressIndex?: number;
  algorithm?: Algorithms;
};

const mnemonic = (options: Options = {}): Account => {
  const passphrase = options.passphrase ? options.passphrase : undefined;
  const strength = options.strength ? options.strength : 256;

  const Wordlist =
    options.wordlist && Object.keys(wordlists).indexOf(options.wordlist) > -1
      ? wordlists[options.wordlist as keyof typeof wordlists]
      : undefined;
  const words = generateMnemonic(
    strength,
    (size) => Buffer.from(randomBytes(size)),
    Wordlist
  );

  const { algorithm, path, keypair } = mnemonicKeypair(words, {
    passphrase: options.passphrase,
    accountPath: options.accountPath,
    changePath: options.changePath,
    addressIndex: options.addressIndex,
    algorithm: options.algorithm,
  });
  const Address = deriveAddress(keypair.publicKey);

  return new Account({
    algorithm,
    address: Address,
    mnemonic: words,
    passphrase: passphrase,
    keypair: keypair,
    path: path,
  });
};

export default mnemonic;
