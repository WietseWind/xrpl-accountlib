"use strict";

import BN from "bn.js";
import { flatMap } from "lodash";
import { decodeAccountID } from "ripple-address-codec";
import { Buffer as BufferPf } from "buffer/";
import * as AddressCodec from "ripple-address-codec";
import { validateMnemonic } from "bip39";
import * as elliptic from "elliptic";
import { verify, deriveAddress } from "ripple-keypairs";
import assert from "assert";
import hashjs from "hash.js";
import { HashPrefix } from "xrpl-binary-codec-prerelease/dist/hash-prefixes";
import { sha512Half } from "xrpl-binary-codec-prerelease/dist/hashes";
import {
  encode,
  decode,
  encodeForSigning,
  encodeForMultisigning,
  encodeForSigningClaim,
  XrplDefinitions,
} from "xrpl-binary-codec-prerelease";
import type Account from "../schema/Account";
import { passphrase } from "../derive";
import { sign } from "../sign";
import { XrplClient } from "xrpl-client";
import { setNativeAsset } from "../sign";

// Ugly, but no definitions when directly loading the lib file, and Signature() not exported in lib
const Signature = require("elliptic/lib/elliptic/ec/signature");

function computeBinaryTransactionHash(txBlobHex: string) {
  const prefix = HashPrefix.transactionID.toString("hex").toUpperCase();
  const input = BufferPf.from(prefix + txBlobHex, "hex");
  return sha512Half(input).toString("hex").toUpperCase();
}

function bytesToHex(a: number[]): string {
  return a
    .map(function (byteValue) {
      const hex = byteValue.toString(16).toUpperCase();
      return hex.length > 1 ? hex : "0" + hex;
    })
    .join("");
}

function deriveAddressWithEdPrefixer(publicKey: string) {
  assert(typeof publicKey === "string", "PubKey: not hex string");
  assert(
    publicKey.length === 64 || publicKey.length === 66,
    "PubKey: invalid length"
  );
  assert(
    publicKey.match(/^[a-fA-F0-9]{64,66}$/),
    "PubKey: invalid characters (non HEX)"
  );

  const pubKey =
    publicKey.length === 64 &&
    getAlgorithmFromKey("ED" + publicKey) === "ed25519"
      ? "ED" + publicKey
      : publicKey;

  return deriveAddress(pubKey);
}

function hexToBytes(a: string): number[] {
  return new BN(a, 16).toArray(undefined, a.length / 2);
}

function bufferToHext(buffer: Buffer): string {
  return buffer.toString("hex").toUpperCase();
}

function getAlgorithmFromKey(key: string) {
  const bytes = hexToBytes(key);
  return bytes.length === 33 && bytes[0] === 0xed ? "ed25519" : "secp256k1";
}

function isValidClassicAddress(address: string): boolean {
  return AddressCodec.isValidClassicAddress(address);
}

function isValidAddress(address: string): boolean {
  return isValidClassicAddress(address);
}

function isValidSeed(seed: string): boolean {
  try {
    return !!AddressCodec.decodeSeed(seed);
  } catch (e) {
    return false;
  }
}

function isValidMnemnic(words: string): boolean {
  try {
    return !!validateMnemonic(words);
  } catch (e) {
    return false;
  }
}

function compressPubKey(pubkey: string): string {
  assert(typeof pubkey === "string", "Uncompressed PubKey: not hex string");
  if (pubkey.length === 64) {
    // ed25519
    const edPubKey = "ED" + pubkey;
    assert(
      getAlgorithmFromKey(edPubKey) === "ed25519",
      "Key length ed25519, algo not ed25519"
    );
    return edPubKey;
  } else if (pubkey.length === 66) {
    // Already compressed
    return pubkey;
  } else {
    // secp256k1
    assert(pubkey.length === 130, "Uncompressed pubkey: not 1+32+32 length");
  }

  // @ts-ignore
  const c = elliptic.curves.secp256k1.curve;
  const p = c.point(pubkey.slice(2, 66), pubkey.slice(66));

  const compressedPubKey = p.encodeCompressed("hex").toUpperCase();

  const algo = getAlgorithmFromKey(compressedPubKey);
  assert(algo === "secp256k1", "Unsupported curve: " + algo);

  return compressedPubKey;
}

function hash(hex: string): number[] {
  return hashjs.sha512().update(hexToBytes(hex)).digest().slice(0, 32);
}

function encodeTransaction(
  TxJson: Record<string, unknown>,
  MultiSignAccount?: string,
  definitions?: XrplDefinitions
): string {
  const Transaction = Object.assign({}, TxJson);
  setNativeAsset(Transaction);

  if (typeof MultiSignAccount !== "undefined") {
    Object.assign(Transaction, { SigningPubKey: "" });
    return encodeForMultisigning(Transaction, MultiSignAccount, definitions);
  } else if (
    typeof Transaction.TxnSignature === "undefined" &&
    typeof Transaction.Signers === "undefined"
  ) {
    if (
      !Transaction?.TransactionType &&
      !Transaction?.command &&
      ((Transaction?.channel && Transaction?.amount) ||
        (Transaction?.Channel && Transaction?.Amount))
    ) {
      // Payment Channel Authorization
      return encodeForSigningClaim({
        channel: Transaction?.channel || Transaction?.Channel,
        amount: Transaction?.amount || Transaction?.Amount,
      });
    }

    // Regular TX signing
    return encodeForSigning(Transaction, definitions);
  } else {
    // Signed TX (tx_blob)
    return encode(Transaction, definitions);
  }
}

function secp256k1_p1363ToFullyCanonicalDerSignature(
  p1363Signature: string
): string {
  const rs = {
    n: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
    r: p1363Signature.slice(0, 64),
    s: p1363Signature.slice(64),
  };

  const bn = {
    n: new BN(rs.n, 16),
    s: new BN(rs.s, 16),
  };

  const nMinusS = bn.n.sub(bn.s);
  rs.s = (nMinusS.lt(bn.s) ? nMinusS : bn.s).toString(16).toUpperCase();

  const nonCanonicalDer = new Signature(rs).toDER();
  return Buffer.from(nonCanonicalDer).toString("hex").toUpperCase();
}

function addressToBigNumber(address: string) {
  const hex = Buffer.from(decodeAccountID(address)).toString("hex");
  return new BN(hex, 16);
}

function compareSigners(left: any, right: any): number {
  return addressToBigNumber(left.Signer.Account).cmp(
    addressToBigNumber(right.Signer.Account)
  );
}

function combine(multiSignedTxHex: string[], definitions?: XrplDefinitions) {
  // Signers must be sorted in the combined transaction - See compareSigners' documentation for more details
  const multiSignedTx = multiSignedTxHex.map((encoded) =>
    decode(encoded, definitions)
  );

  const sortedSigners = flatMap(
    multiSignedTx,
    (tx: any) => tx.Signers ?? []
  ).sort(compareSigners);

  const signedTransaction = encode(
    { ...multiSignedTx[0], Signers: sortedSigners },
    definitions
  );

  return {
    id: computeBinaryTransactionHash(signedTransaction),
    signedTransaction,
  };
}

const networkInfo = async (
  client: XrplClient | string,
  keepCreatedConnectionAlive = false
) => {
  assert(
    typeof client !== "undefined",
    "First param. must be XrplClient (npm: xrpl-client) or wss:// node endpoint"
  );

  const connection =
    typeof client === "string" ? new XrplClient(client) : client;

  const ledger = await connection.send({
    command: "ledger",
  });

  const amendments = (
    await connection.send({
      command: "ledger_entry",
      index: "7DB0788C020F02780A673DC74757F23823FA3014C1866E72CC4CD8B226CD6EF4",
      validated: true,
    })
  )?.node?.Amendments;

  if (typeof client === "string" && !keepCreatedConnectionAlive) {
    // If constructed on demand: close
    connection.close();
  }

  const endpoint = connection.getState().server.uri;
  const networkId = connection.getState().server.networkId;
  const ledgerSequence = Number(
    connection.getState().ledger?.last || ledger?.closed?.ledger?.seqNum || 0
  );

  return {
    endpoint,
    networkId,
    ledgerSequence,
    ledger,
    amendments,
    features: {
      hooks:
        amendments.indexOf(
          "ECE6819DBA5DB528F1A241695F5A9811EF99467CDE22510954FD357780BBD078"
        ) > -1,
    },
    connection: keepCreatedConnectionAlive ? connection : null,
  };
};

const networkTxFee = async (
  client: XrplClient | string,
  tx?: string | Object,
  keepCreatedConnectionAlive = false
) => {
  /**
   * TX can be string (expect BLOB) or TX Object
   */
  const { features, connection } = await networkInfo(
    client,
    true // keep alive
  );

  const getHooksTxFee = async (tx?: string | Object) => {
    assert(
      typeof tx === "string" || (typeof tx === "object" && tx !== null),
      "Network fee calculation on Hooks enabled networks requires a TX to calculate the fee for"
    );

    const definitions = new XrplDefinitions(
      (await connection?.definitions()) as any
    );

    const transaction = Object.assign(
      {},
      {
        ...(typeof tx === "object"
          ? Object.assign({}, tx)
          : decode(tx, definitions)),
        Fee: "0",
        SigningPubKey: "",
      }
    );

    if (
      (transaction as any)?.TransactionType === "Import" &&
      (transaction as any)?.Sequence === 0
    ) {
      // New account, import, fee will be zero
      return "0";
    }

    const tx_blob = sign(
      transaction,
      passphrase(""),
      definitions
    ).signedTransaction;

    const fee = await connection?.send({ command: "fee", tx_blob });

    assert(
      typeof fee?.error === "undefined",
      "Could not get fee for tx blob from network"
    );

    return fee?.drops?.base_fee || null;
  };

  const fee = features.hooks
    ? tx
      ? await getHooksTxFee(tx)
      : null
    : Math.min(
        (connection?.getState().fee.avg ||
          connection?.getState().fee.last ||
          50_000) + 8, // Beat the queue.
        50_000 // Absurd.
      );

  if (typeof client === "string" && !keepCreatedConnectionAlive) {
    // If constructed on demand: close
    connection?.close();
  }

  return String(Number(fee));
};

const accountAndLedgerSequence = async (
  client: XrplClient | string,
  account: string | Account
) => {
  assert(
    typeof client !== "undefined",
    "First param. must be XrplClient (npm: xrpl-client) or wss:// node endpoint"
  );

  const accountAddress =
    typeof account === "string" ? account : account.address;

  const { endpoint, networkId, ledgerSequence, features, connection } =
    await networkInfo(
      client,
      true // keep alive
    );

  const accountInfo = await connection?.send({
    command: "account_info",
    account: accountAddress,
  });

  const fee = await networkTxFee(
    connection ? connection : client,
    undefined,
    true // keep alive
  );

  if (typeof client === "string") {
    // If constructed on demand: close
    connection?.close();
  }

  const accountSequence = Number(accountInfo?.account_data?.Sequence || 0);

  return {
    networkInfo: {
      ledgerSequence: ledgerSequence > 0 ? ledgerSequence : null,
      accountSequence: accountSequence > 0 ? accountSequence : null,
      endpoint,
      networkId,
      features,
    },
    txValues: {
      Account: accountAddress,
      NetworkID: networkId,
      Sequence: accountSequence,
      LastLedgerSequence: ledgerSequence > 0 ? ledgerSequence + 20 : undefined,
      Fee: String(Number(fee)),
    },
  };
};

export {
  bytesToHex,
  hexToBytes,
  bufferToHext,
  getAlgorithmFromKey,
  isValidAddress,
  isValidClassicAddress,
  isValidSeed,
  isValidMnemnic,
  deriveAddressWithEdPrefixer as deriveAddress,
  compressPubKey,
  hash,
  encodeTransaction,
  secp256k1_p1363ToFullyCanonicalDerSignature,
  verify as verifySignature,
  computeBinaryTransactionHash,
  combine,
  accountAndLedgerSequence,
  accountAndLedgerSequence as txNetworkAndAccountValues,
  networkInfo,
  networkTxFee,
};
