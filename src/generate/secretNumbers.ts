"use strict";

import * as XrplSecretNumbers from "xrpl-secret-numbers";
import * as Utils from "../utils";

import Account from "../schema/Account";

const secretNumbers = (): Account => {
  const secretNumbersAccount = new XrplSecretNumbers.Account() 
  const keypair = secretNumbersAccount.getKeypair()
  return new Account({
    algorithm: Utils.getAlgorithmFromKey(keypair.privateKey),
    address: secretNumbersAccount.getAddress(),
    familySeed: secretNumbersAccount.getFamilySeed(),
    keypair: keypair,
    secretNumbers: secretNumbersAccount.getSecret()
  });
};

export default secretNumbers;
