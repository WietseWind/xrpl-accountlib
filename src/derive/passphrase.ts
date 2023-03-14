"use strict";

import hashjs from "hash.js";
import { encodeHex } from "ripple-secret-codec";
import { deriveKeypair, deriveAddress, } from "ripple-keypairs";

import Account from "../schema/Account";

const passphrase = (phrase: string): Account => {
  const hash = hashjs
    .sha512()
    .update(phrase)
    .digest("hex")
    .toUpperCase();
  const hexSeed = hash.substring(0, 32);
  const familySeed = encodeHex(hexSeed).secret_b58;
  const keypair = deriveKeypair(familySeed);
  const address = deriveAddress(keypair.publicKey);

  return new Account({
    familySeed: familySeed,
    address: address,
    passphrase: phrase,
    keypair: keypair
  });
};

export default passphrase;
