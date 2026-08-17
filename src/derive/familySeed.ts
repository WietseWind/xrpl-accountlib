"use strict";

import { deriveKeypair, deriveAddress, } from "ripple-keypairs";
import * as Utils from "../utils";
import { normalizeAlgorithm } from "../utils/algorithm";

import Account from "../schema/Account";

const familySeed = (familyseed: string, options?: { algorithm?: string }): Account => {
  // ripple-keypairs honours `algorithm`, overriding the algorithm of the seed:
  // an unrecognized value would silently derive a secp256k1 keypair
  const algorithm = normalizeAlgorithm(options?.algorithm);
  const Keypair = deriveKeypair(
    familyseed,
    algorithm ? Object.assign({}, options, { algorithm }) : options
  );
  const Address = deriveAddress(Keypair.publicKey);
  return new Account({
    algorithm: Utils.getAlgorithmFromKey(Keypair.privateKey),
    address: Address,
    familySeed: familyseed,
    keypair: Keypair
  });
};

export default familySeed;
