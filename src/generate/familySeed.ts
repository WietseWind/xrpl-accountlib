"use strict";

import Keypairs from "ripple-keypairs";

import Account from "../schema/Account";

import { Algorithms } from "../types";

type Options = {
  algorithm?: Algorithms;
};

const familySeed = (options: Options = {}): Account => {
  const algorithm = options.algorithm === "ed25519" ? "ed25519" : "secp256k1";
  const Familyseed = Keypairs.generateSeed({ algorithm: algorithm });
  const Keypair = Keypairs.deriveKeypair(Familyseed);
  const Address = Keypairs.deriveAddress(Keypair.publicKey);
  return new Account({
    algorithm: algorithm,
    address: Address,
    familySeed: Familyseed,
    keypair: Keypair
  });
};

export default familySeed;
