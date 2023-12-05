"use strict";

import { encodeForSigningClaim, XrplDefinitions } from "xrpl-binary-codec-prerelease";
import { sign as rk_sign } from "ripple-keypairs";
import Sign from "xrpl-sign-keypairs";
import Account from "../schema/Account";
import { combine, networkTxFee, networkInfo } from "../utils";
import { XrplClient } from "xrpl-client";
import assert from "assert";
import { nativeAsset } from "..";

type SignOptions = {
  [key: string]: any;
};

type SignedObject = {
  type: "SignedTx" | "MultiSignedTx" | "SignedPayChanAuth";
  id: string;
  signedTransaction: string;
  txJson: Record<string, unknown>;
  signers: string[];
};

const setNativeAsset = (Tx: any): void => {
  nativeAsset.set("XRP");

  // Xahau Mainnet, Xahau Testnet
  if ([21337, 21338].indexOf(Tx?.NetworkID) > -1) {
    nativeAsset.set("XAH");
  }

  // console.log(nativeAsset.get())
};

const sign = (
  transaction: Object,
  account?: Account | Account[],
  definitions?: XrplDefinitions
): SignedObject => {
  let accounts = [];
  const Tx: any = Object.assign({}, transaction);

  setNativeAsset(Tx);

  if (Object.keys(Tx).indexOf("TransactionType") > -1) {
    if (Tx?.TransactionType?.toLowerCase() === "signin") {
      Object.assign(Tx, {
        TransactionType: undefined,
        SignIn: true,
      });
    }
  }

  if (account instanceof Object && !Array.isArray(account)) {
    if (account instanceof Account) {
      accounts.push(account);
    } else {
      throw new Error("Account not instanceof XRPL Account");
    }
  } else if (Array.isArray(account)) {
    account.forEach((account) => {
      if (account instanceof Account) {
        accounts.push(account);
      } else {
        throw new Error("Account not instanceof XRPL Account");
      }
    });
  }

  if (
    Tx?.TransactionType?.toLowerCase() === "paymentchannelauthorize" ||
    Tx?.command?.toLowerCase() === "channel_authorize" ||
    (!Tx?.TransactionType &&
      !Tx?.command &&
      ((Tx?.channel && Tx?.amount) || (Tx?.Channel && Tx?.Amount)))
  ) {
    if (accounts.length === 1) {
      if (
        typeof accounts[0]._signAs === "string" &&
        accounts[0]._signAs !== ""
      ) {
        throw new Error("Payment channel authorization: cannot Sign As");
      }

      const claimInput =
        Tx?.channel && Tx?.amount
          ? { channel: Tx.channel, amount: Tx.amount }
          : { channel: Tx.Channel, amount: Tx.Amount };

      const claim = encodeForSigningClaim(claimInput);
      const signed = rk_sign(claim, accounts[0].keypair.privateKey);
      return {
        type: "SignedPayChanAuth",
        id: "",
        signedTransaction: signed,
        txJson: claimInput,
        signers: [accounts[0].address || ""],
      };
    } else {
      throw new Error(
        "Payment channel authorization: multi-signing not supported"
      );
    }
  }

  if (accounts.length === 1) {
    const txJSON = JSON.stringify(Tx);
    let options: SignOptions = { signAs: undefined, definitions };
    if (typeof accounts[0]._signAs === "string" && accounts[0]._signAs !== "") {
      // signAs explicitly set
      options.signAs = accounts[0]._signAs;
    }
    const tx = Sign(txJSON, accounts[0].keypair, options);
    return {
      type: "SignedTx",
      id: tx.id,
      signedTransaction: tx.signedTransaction,
      txJson: tx.txJson,
      signers: [
        typeof accounts[0]._signAs === "string"
          ? accounts[0]._signAs
          : accounts[0].address || "",
      ],
    };
  } else {
    const Codec = require("xrpl-binary-codec-prerelease");

    const MultiSignedTransactionBinary = (() => {
      if (
        transaction instanceof Object &&
        Array.isArray(transaction) &&
        accounts.length === 0 &&
        transaction.length > 0
      ) {
        if (
          transaction.length ===
          transaction.filter((t) => {
            return (
              t instanceof Object &&
              t !== null &&
              typeof t.signedTransaction === "string"
            );
          }).length
        ) {
          // MultiSign [ { signedTransaction: ... } , ... ]
          return combine(
            transaction.map((t) => {
              return t.signedTransaction.toUpperCase();
            }),
            definitions
          );
        } else if (
          transaction.length ===
          transaction.filter((t) => {
            return (
              typeof t === "string" && t.toUpperCase().match(/^[A-F0-9]+$/)
            );
          }).length
        ) {
          // MultiSign [ 'AEF9...', 'C6DA...' ]
          return combine(
            transaction.map((t) => {
              return t.toUpperCase();
            }),
            definitions
          );
        } else {
          throw new Error(
            "TX Blob for multiSign not an array of { signedTransaction: ... } objects or blob strings"
          );
        }
      } else {
        // MultiSign [ lib.sign(...), lib.sign(...) ]
        return combine(
          accounts.map((account) => {
            return Sign(JSON.stringify(Tx), account.keypair, {
              signAs:
                typeof account._signAs === "string"
                  ? account._signAs
                  : account.address,
              definitions,
            }).signedTransaction;
          }),
          definitions
        );
      }
    })();

    const txJson = Codec.decode(
      MultiSignedTransactionBinary.signedTransaction,
      definitions
    );
    return {
      type: "MultiSignedTx",
      id: MultiSignedTransactionBinary.id,
      signedTransaction: MultiSignedTransactionBinary.signedTransaction,
      txJson: txJson,
      signers: txJson.Signers,
    };
  }
};

const signAndSubmit = async (
  transaction: Object,
  client: XrplClient | string,
  account: Account | Account[]
) => {
  assert(
    typeof client !== "undefined",
    "First param. must be XrplClient (npm: xrpl-client) or wss:// node endpoint"
  );

  const connection =
    typeof client === "string" ? new XrplClient(client) : client;

  const definitions = await connection.definitions();
  const network = await networkInfo(connection, true /** keep alive */);

  if (
    network.features.hooks &&
    String(Number((transaction as any)?.Fee)) === "0"
  ) {
    // We're on Hooks network and there is no fee, fetch it
    const Fee = await networkTxFee(connection, transaction);
    Object.assign(transaction, { Fee });
  }

  const { signedTransaction, id } = sign(
    transaction,
    account,
    definitions ? new XrplDefinitions(definitions as any) : undefined
  );

  const submitResponse = await connection.send({
    command: "submit",
    tx_blob: signedTransaction,
  });

  if (typeof client === "string") {
    // If constructed on demand: close
    connection.close();
  }

  return {
    tx_blob: signedTransaction,
    tx_id: id,
    response: submitResponse,
  };
};

export { sign, signAndSubmit, setNativeAsset };

export type { SignedObject };

export default sign;
