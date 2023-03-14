"use strict";

import { wordlists, mnemonicToSeedSync, generateMnemonic } from "bip39";
import * as Bip32 from "bip32";
import { deriveAddress } from "ripple-keypairs";

import Account from "../schema/Account";

import * as Utils from "../utils";

type Options = {
  passphrase?: string;
  strength?: number;
  wordlist?: string;
  accountPath?: string;
  changePath?: string;
  addressIndex?: number;
};

const mnemonic = (options: Options = {}): Account => {
  const passphrase = options.passphrase ? options.passphrase : undefined;
  const strength = options.strength ? options.strength : 256;

  const Wordlist =
    options.wordlist && Object.keys(wordlists).indexOf(options.wordlist) > -1
      ? wordlists[options.wordlist as keyof typeof wordlists]
      : undefined;
  const words = generateMnemonic(strength, undefined, Wordlist);

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

  const Path = `m/44'/144'/${accountPath}'/${changePath}/${addressIndex}`;

  const Seed = mnemonicToSeedSync(words, passphrase);
  const m = Bip32.fromSeed(Seed);
  const Node = m.derivePath(Path);
  const publicKey = Utils.bufferToHext(Node.publicKey);
  // @ts-ignore
  const privateKey = Utils.bufferToHext(Node.privateKey);
  const Keypair = {
    publicKey: publicKey,
    privateKey: "00" + privateKey
  };
  const Address = deriveAddress(Keypair.publicKey);

  return new Account({
    address: Address,
    mnemonic: words,
    passphrase: passphrase,
    keypair: Keypair,
    path: Path
  });
};

export default mnemonic;
