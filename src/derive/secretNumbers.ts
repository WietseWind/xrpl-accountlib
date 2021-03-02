"use strict";

import * as XrplSecretNumbers from "xrpl-secret-numbers";
import * as Utils from "../utils";

import Account from "../schema/Account";

const secretNumbers = (numbers: string | string[], skipChecksum = false): Account => {
  let secretNumbers = numbers

  if (skipChecksum) {
    const notChecksummed = Array.isArray(numbers)
      ? numbers
      : numbers.split(' ') 
    if (notChecksummed.every(c => String(c).length === 5 || String(c).length === 6)) {
      secretNumbers = notChecksummed.map((n, i) => {
        const s = String(n).slice(0, 5)
        return s + XrplSecretNumbers.Utils.calculateChecksum(i, Number(s))
      })
    }
  }

  const secretNumbersAccount = new XrplSecretNumbers.Account(secretNumbers)
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
