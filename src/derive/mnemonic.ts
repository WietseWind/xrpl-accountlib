"use strict";

import { deriveAddress } from "ripple-keypairs";

import Account from "../schema/Account";

import mnemonicKeypair, {
  MnemonicDerivationOptions,
} from "../utils/mnemonicKeypair";

const mnemonic = (words: string, options: MnemonicDerivationOptions = {}) => {
  const passphrase = options.passphrase ? options.passphrase : undefined;

  const { algorithm, path, keypair } = mnemonicKeypair(words, options);
  const Address = deriveAddress(keypair.publicKey);

  return new Account({
    algorithm,
    address: Address,
    mnemonic: words,
    passphrase: passphrase,
    keypair: keypair,
    path: path
  });
};

export default mnemonic;
