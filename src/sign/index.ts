"use strict";

import Sign from "ripple-sign-keypairs";
import Account from "../schema/Account";

type SignedObject = {
  type: "SignedTx" | "MultiSignedTx";
  id: string;
  signedTransaction: string;
  txJson: Record<string, unknown>;
  signers: string[];
};

const sign = (
  transaction: Object,
  account?: Account | Account[]
): SignedObject => {
  let accounts = [];
  const Tx: any = Object.assign({}, transaction)

  if (Object.keys(Tx).indexOf('TransactionType') > -1) {
    if (Tx['TransactionType'].toLowerCase() === 'signin') {
      Object.assign(Tx, {
        TransactionType: undefined,
        SignIn: true
      })
    }
  }

  if (account instanceof Object && !Array.isArray(account)) {
    if (account instanceof Account) {
      accounts.push(account);
    } else {
      throw new Error("Account not instanceof XRPL Account");
    }
  } else if (Array.isArray(account)) {
    account.forEach(account => {
      if (account instanceof Account) {
        accounts.push(account);
      } else {
        throw new Error("Account not instanceof XRPL Account");
      }
    });
  }

  if (accounts.length === 1) {
    const txJSON = JSON.stringify(Tx);
    let signAs = {};
    if (typeof accounts[0]._signAs === "string" && accounts[0]._signAs !== "") {
      // signAs explicitly set
      signAs = { signAs: accounts[0]._signAs };
    }
    const tx = Sign(txJSON, accounts[0].keypair, signAs);
    return {
      type: "SignedTx",
      id: tx.id,
      signedTransaction: tx.signedTransaction,
      txJson: tx.txJson,
      signers: [
        // @ts-ignore
        typeof accounts[0]._signAs === "string"
          ? accounts[0]._signAs
          : accounts[0].address
      ]
    };
  } else {
    const RippleLibApi = require("ripple-lib").RippleAPI;
    const RippleApi = new RippleLibApi();
    const Codec = require("ripple-binary-codec");
    
    const MultiSignedTransactionBinary = (() => {
      if (
        transaction instanceof Object &&
        Array.isArray(transaction) &&
        accounts.length === 0 &&
        transaction.length > 0
      ) {
        if (
          transaction.length ===
          transaction.filter(t => {
            return (
              t instanceof Object &&
              t !== null &&
              typeof t.signedTransaction === "string"
            );
          }).length
        ) {
          // MultiSign [ { signedTransaction: ... } , ... ]
          return RippleApi.combine(
            transaction.map(t => {
              return t.signedTransaction.toUpperCase();
            })
          );
        } else if (
          transaction.length ===
          transaction.filter(t => {
            return (
              typeof t === "string" && t.toUpperCase().match(/^[A-F0-9]+$/)
            );
          }).length
        ) {
          // MultiSign [ 'AEF9...', 'C6DA...' ]
          return RippleApi.combine(
            transaction.map(t => {
              return t.toUpperCase();
            })
          );
        } else {
          throw new Error(
            "TX Blob for multiSign not an array of { signedTransaction: ... } objects or blob strings"
          );
        }
      } else {
        // MultiSign [ lib.sign(...), lib.sign(...) ]
        return RippleApi.combine(
          accounts.map(account => {
            return Sign(JSON.stringify(Tx), account.keypair, {
              signAs:
                typeof account._signAs === "string"
                  ? account._signAs
                  : account.address
            }).signedTransaction;
          })
        );
      }
    })();

    const txJson = Codec.decode(MultiSignedTransactionBinary.signedTransaction);
    return {
      type: "MultiSignedTx",
      id: MultiSignedTransactionBinary.id,
      signedTransaction: MultiSignedTransactionBinary.signedTransaction,
      txJson: txJson,
      signers: txJson.Signers
    };
  }
};

export {
  sign
};

export type {
  SignedObject
};

export default sign;
