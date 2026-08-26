import { derive, rawSigning, utils, binary } from "../src";
import fixtures from "./fixtures/api.json";
import * as elliptic from "elliptic";

const dummyInvoiceIdTx = (account: { address?: string | null }) => ({
  Account: account.address,
  InvoiceID: "aa".repeat(32),
});

const secpP1363FromHash = (hashHex: string, privateKey: string): string => {
  const ec = new elliptic.ec("secp256k1");
  const key = ec.keyFromPrivate(privateKey.replace(/^00/, ""), "hex");
  const sig = key.sign(Buffer.from(hashHex, "hex"), { canonical: true });
  const r = sig.r.toString(16).padStart(64, "0");
  const s = sig.s.toString(16).padStart(64, "0");
  return (r + s).toUpperCase();
};

describe("Tangem-style dummy InvoiceID proof (Xaman import)", () => {
  it("secp256k1 prepare/complete verifies a p1363 card signature", () => {
    const account = derive.familySeed(fixtures.familySeed.secp256k1.seed);
    const prepared = rawSigning.prepare(
      dummyInvoiceIdTx(account),
      account.keypair.publicKey!,
    );
    const completed = rawSigning.complete(
      prepared,
      secpP1363FromHash(prepared.hashToSign, account.keypair.privateKey!),
    );

    expect(completed.signatureVerifies).toBe(true);
    expect(completed.txJson.TxnSignature).toBeTruthy();
    expect(completed.signedTransaction).toBeTruthy();
  });

  it("ed25519 prepare/complete verifies a 64-byte card signature", () => {
    const account = derive.familySeed(fixtures.familySeed.ed25519.seed);
    const prepared = rawSigning.prepare(
      dummyInvoiceIdTx(account),
      account.keypair.publicKey!,
    );
    const { sign: rkSign } = require("ripple-keypairs");
    const completed = rawSigning.complete(
      prepared,
      rkSign(prepared.hashToSign, account.keypair.privateKey!),
    );

    expect(completed.signatureVerifies).toBe(true);
    expect(completed.signedTransaction).toBeTruthy();
  });

  it("Xaman re-verify: encodeForSigning(completed txJson) matches the signed message", () => {
    const account = derive.familySeed(fixtures.familySeed.secp256k1.seed);
    const prepared = rawSigning.prepare(
      dummyInvoiceIdTx(account),
      account.keypair.publicKey!,
    );
    const completed = rawSigning.complete(
      prepared,
      secpP1363FromHash(prepared.hashToSign, account.keypair.privateKey!),
    );

    const signingHash = binary.encodeForSigning(completed.txJson as object);
    expect(signingHash.toUpperCase()).toBe(prepared.message.toUpperCase());

    expect(
      utils.verifySignature(
        signingHash,
        completed.txJson.TxnSignature as string,
        prepared.signingPubKey,
      ),
    ).toBe(true);
  });

  it("still verifies on Xahau NetworkID 21338 (native XAH)", () => {
    const account = derive.familySeed(fixtures.familySeed.secp256k1.seed);
    const prepared = rawSigning.prepare(
      { ...dummyInvoiceIdTx(account), NetworkID: 21338 },
      account.keypair.publicKey!,
    );
    const completed = rawSigning.complete(
      prepared,
      secpP1363FromHash(prepared.hashToSign, account.keypair.privateKey!),
    );
    expect(completed.signatureVerifies).toBe(true);
  });

  it("accepts a 0x-prefixed p1363 signature from the card SDK", () => {
    const account = derive.familySeed(fixtures.familySeed.secp256k1.seed);
    const prepared = rawSigning.prepare(
      dummyInvoiceIdTx(account),
      account.keypair.publicKey!,
    );
    const p1363 = secpP1363FromHash(
      prepared.hashToSign,
      account.keypair.privateKey!,
    );
    const completed = rawSigning.complete(prepared, "0x" + p1363);
    expect(completed.signatureVerifies).toBe(true);
  });

  it("survives a broken codec package-root nativeAsset getter (Metro/Hermes)", () => {
    const codec = require("xrpl-binary-codec-prerelease");
    const original = Object.getOwnPropertyDescriptor(codec, "nativeAsset");
    Object.defineProperty(codec, "nativeAsset", {
      configurable: true,
      enumerable: true,
      get: () => undefined,
    });

    try {
      const account = derive.familySeed(fixtures.familySeed.secp256k1.seed);
      const prepared = rawSigning.prepare(
        dummyInvoiceIdTx(account),
        account.keypair.publicKey!,
      );
      const completed = rawSigning.complete(
        prepared,
        secpP1363FromHash(prepared.hashToSign, account.keypair.privateKey!),
      );
      expect(completed.signatureVerifies).toBe(true);
      expect(
        utils.verifySignature(
          binary.encodeForSigning(completed.txJson as object),
          completed.txJson.TxnSignature as string,
          prepared.signingPubKey,
        ),
      ).toBe(true);
    } finally {
      if (original) {
        Object.defineProperty(codec, "nativeAsset", original);
      }
    }
  });
});
