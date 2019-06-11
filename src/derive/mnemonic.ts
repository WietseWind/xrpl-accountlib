"use strict";

import Bip39 from "bip39";
import Bip32 from "ripple-bip32";
import Keypairs from "ripple-keypairs";

import Account from "../schema/Account";

type options = {
  passphrase?: string;
  accountPath?: string;
  changePath?: string;
  addressIndex?: number;
};
const mnemonic = (words: string, options: options = {}) => {
  const passphrase = options.passphrase ? options.passphrase : undefined;

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

  const Seed = Bip39.mnemonicToSeed(words, passphrase);
  const m = Bip32.fromSeedBuffer(Seed);
  const Keypair = m.derivePath(Path).keyPair.getKeyPairs();
  const Address = Keypairs.deriveAddress(Keypair.publicKey);

  return new Account({
    address: Address,
    mnemonic: words,
    passphrase: passphrase,
    keypair: Keypair,
    path: Path
  });
};

export default mnemonic;
