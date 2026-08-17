"use strict";

import { generateSeed, deriveKeypair, deriveAddress, } from "ripple-keypairs";

import Account, { Algorithms } from "../schema/Account";
import { normalizeAlgorithm } from "../utils/algorithm";

type Options = {
  algorithm?: Algorithms;
  entropy?: Buffer | Uint8Array;
};

const familySeed = (options: Options = {}): Account => {
  options = Object.assign(options, {
    algorithm: normalizeAlgorithm(options.algorithm, "secp256k1")
  })
  const Familyseed = generateSeed(options);
  const Keypair = deriveKeypair(Familyseed);
  const Address = deriveAddress(Keypair.publicKey);
  return new Account({
    algorithm: options.algorithm,
    address: Address,
    familySeed: Familyseed,
    keypair: Keypair
  });
};

export default familySeed;
