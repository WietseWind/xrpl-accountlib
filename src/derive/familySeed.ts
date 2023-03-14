"use strict";

import { deriveKeypair, deriveAddress, } from "ripple-keypairs";
import * as Utils from "../utils";

import Account from "../schema/Account";

const familySeed = (familyseed: string): Account => {
  const Keypair = deriveKeypair(familyseed);
  const Address = deriveAddress(Keypair.publicKey);
  return new Account({
    algorithm: Utils.getAlgorithmFromKey(Keypair.privateKey),
    address: Address,
    familySeed: familyseed,
    keypair: Keypair
  });
};

export default familySeed;
