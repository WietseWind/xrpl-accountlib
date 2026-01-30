import fixtures from "./fixtures/api.json";
import {
  derive,
  generate,
  sign,
  rawSigning,
  utils,
  prefilledSignAndSubmit,
} from "../src";
// import { XrplDefinitions } from "xrpl-binary-codec-prerelease";

describe("Api", () => {
  /* Derive ==================================================================== */

  describe("Derive", () => {
    test("Family seed (default)", () => {
      const account = derive.familySeed(fixtures.familySeed.secp256k1.seed);
      expect(account.accountType).toBe("familySeed");
      expect(account.address).toBe(fixtures.familySeed.secp256k1.address);
      expect(account.keypair).toEqual(fixtures.familySeed.secp256k1.keypair);
    });

    test("Family seed (algorithm: ed25519)", () => {
      const account = derive.familySeed(fixtures.familySeed.ed25519.seed);
      expect(account.accountType).toBe("familySeed");
      expect(account.address).toBe(fixtures.familySeed.ed25519.address);
      expect(account.keypair).toEqual(fixtures.familySeed.ed25519.keypair);
    });

    test("Secret Numbers", () => {
      const account = derive.secretNumbers(fixtures.secretNumbers.seed);
      expect(account.accountType).toBe("secretNumbers");
      expect(account.address).toBe(fixtures.secretNumbers.address);
      expect(account.secret.familySeed).toBe(fixtures.secretNumbers.familySeed);
      expect(account.keypair).toEqual(fixtures.secretNumbers.keypair);
    });

    test("Secret Numbers without checksum", () => {
      const account = derive.secretNumbers(
        fixtures.secretNumbers.seedNoChecksum,
        true,
      );
      expect(account.accountType).toBe("secretNumbers");
      expect(account.address).toBe(fixtures.secretNumbers.address);
      expect(account.secret.familySeed).toBe(fixtures.secretNumbers.familySeed);
      expect(account.keypair).toEqual(fixtures.secretNumbers.keypair);
    });

    test("Mnemonic", () => {
      const account = derive.mnemonic(fixtures.mnemonic.mnemonic, {
        passphrase: fixtures.mnemonic.passphrase,
      });
      expect(account.accountType).toBe("mnemonic");
      expect(account.address).toBe(fixtures.mnemonic.address);
      expect(account.keypair).toEqual(fixtures.mnemonic.keypair);
    });

    test("Mnemonic [lowercase]", () => {
      const account = derive.mnemonic(fixtures.mnemonic.mnemonic.toLowerCase());
      expect(account.accountType).toBe("mnemonic");
      expect(account.address).toBe(fixtures.mnemonic.addressLower);
      expect(account.keypair).toEqual(fixtures.mnemonic.keypairLower);
    });

    test("Mnemonic [uppercase]", () => {
      const account = derive.mnemonic(fixtures.mnemonic.mnemonic.toUpperCase());
      expect(account.accountType).toBe("mnemonic");
      expect(account.address).toBe(fixtures.mnemonic.addressUpper);
      expect(account.keypair).toEqual(fixtures.mnemonic.keypairUpper);
    });

    test("PrivateKey (HEX)", () => {
      const account = derive.privatekey(fixtures.privatekey.privatekey);
      expect(account.accountType).toBe("hex");
      expect(account.address).toBe(fixtures.privatekey.address);
      expect(account.keypair).toEqual(fixtures.privatekey.keypair);
    });

    test("Passphrase", () => {
      const account = derive.passphrase(fixtures.passphrase.passphrase);
      expect(account.accountType).toBe("familySeed");
      expect(account.address).toBe(fixtures.passphrase.address);
      expect(account.secret.familySeed).toBe(fixtures.passphrase.familySeed);
      expect(account.keypair).toEqual(fixtures.passphrase.keypair);
    });
  });

  /* Generate ==================================================================== */

  describe("Generate", () => {
    test("Family seed (default)", () => {
      const account = generate.familySeed();
      expect(account.secret.familySeed).toBeDefined();
      expect(account.accountType).toBe("familySeed");
      expect(account.keypair.algorithm).toBe("secp256k1");
    });

    test("Family seed (algorithm: ed25519)", () => {
      const account = generate.familySeed({ algorithm: "ed25519" });
      expect(account.accountType).toBe("familySeed");
      expect(account.secret.familySeed).toBeDefined();
      expect(account.keypair.algorithm).toBe("ed25519");
    });

    test("Mnemonic", () => {
      const account = generate.mnemonic({
        wordlist: "english",
        passphrase: "Hello World!",
      });
      expect(account.accountType).toBe("mnemonic");
      expect(account.secret.familySeed).toBe(null);
      expect(account.secret.mnemonic).toBeDefined();
    });
  });

  /* Verify ==================================================================== */

  describe("Verify seed validity", () => {
    test("Family secp seed valid", () => {
      const account = generate.familySeed();
      expect(utils.isValidSeed(account.secret.familySeed || "")).toBeTruthy();
    });

    test("Family ed seed valid", () => {
      const account = generate.familySeed({ algorithm: "ed25519" });
      expect(utils.isValidSeed(account.secret.familySeed || "")).toBeTruthy();
    });

    test("Secret Numbers valid", () => {
      const account = derive.secretNumbers(fixtures.secretNumbers.seed);
      expect(utils.isValidSeed(account.secret.familySeed || "")).toBeTruthy();
    });

    test("Mnemonic valid", () => {
      const account = generate.mnemonic({
        wordlist: "english",
        passphrase: "Hello World!",
      });
      expect(utils.isValidMnemnic(account.secret.mnemonic || "")).toBeTruthy();
    });

    test("Family seed invalid", () => {
      expect(utils.isValidSeed("sthiswillneverwork")).toBeFalsy();
    });

    test("Mnemonic invalid", () => {
      expect(utils.isValidMnemnic("car car car car car car")).toBeFalsy();
    });
  });

  /* Sign ==================================================================== */

  describe("Sign", () => {
    test("One account using secp256k1", () => {
      const result = sign(
        fixtures.tx,
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("One account using mnemonic", () => {
      const result = sign(
        fixtures.tx,
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("SignIn PseudoTransaction using secp256k1", () => {
      const result = sign(
        fixtures.txPseudo,
        derive.mnemonic(fixtures.mnemonic.mnemonic),
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("SignIn PseudoTransaction using mnemonic", () => {
      const result = sign(
        fixtures.txPseudo,
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("NFT tx using mnemonic", () => {
      const result = sign(
        fixtures.txNft,
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("One account (SignAs)", () => {
      const result = sign(
        fixtures.tx,
        derive
          .familySeed(fixtures.familySeed.secp256k1.seed)
          .signAs("rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY"),
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("MultiSign", () => {
      const result = sign(fixtures.tx, [
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        derive.familySeed(fixtures.familySeed.ed25519.seed),
        derive.mnemonic(fixtures.mnemonic.mnemonic),
      ]);

      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signers.length).toBe(3);
    });

    test("MultiSign Pseudo Transaction (SignIn)", () => {
      const result = sign(fixtures.txPseudo, [
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        derive.familySeed(fixtures.familySeed.ed25519.seed),
        derive.mnemonic(fixtures.mnemonic.mnemonic),
      ]);

      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signers.length).toBe(3);
    });

    test("MultiSign (SignAs)", () => {
      const result = sign(fixtures.tx, [
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        derive
          .familySeed(fixtures.familySeed.ed25519.seed)
          .signAs("rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY"),
      ]);

      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signers.length).toBe(2);
    });
  });

  /* Combine ==================================================================== */

  describe("rawSigning", () => {
    test("Basic secp256k1 - uncompressed", () => {
      const preparedTx = rawSigning.prepare(
        fixtures.rawSigning.tx,
        fixtures.rawSigning.accounts.ali.uncompressedPubKey,
      );

      expect(preparedTx.multiSign).toBe(false);
      expect(preparedTx.hashToSign).toBeDefined();
      expect(preparedTx.message).toBeDefined();
      expect(preparedTx.signingPubKey).toBe(
        fixtures.rawSigning.accounts.ali.pubKeyCompressed,
      );
      expect(preparedTx.transaction).toMatchObject(
        Object.assign(
          {},
          {
            ...fixtures.rawSigning.tx,
            SigningPubKey: fixtures.rawSigning.accounts.ali.pubKeyCompressed,
          },
        ),
      );

      const signedObject = rawSigning.complete(
        preparedTx,
        fixtures.rawSigning.accounts.ali.signature,
      );

      expect(signedObject.type).toBe("SignedTx");
      expect(signedObject.txnSignature).not.toBe("");
      expect(signedObject.signatureVerifies).toBe(true);
      expect(signedObject.txJson).toMatchObject(
        Object.assign(
          {},
          {
            ...fixtures.rawSigning.tx,
            SigningPubKey: fixtures.rawSigning.accounts.ali.pubKeyCompressed,
            TxnSignature: signedObject.txnSignature,
          },
        ),
      );
      expect(signedObject.signedTransaction).not.toBe("");
      expect(signedObject.id).not.toBe("");
    });

    test("Basic secp256k1 - compressed", () => {
      const preparedTx = rawSigning.prepare(
        fixtures.rawSigning.tx,
        fixtures.rawSigning.accounts.ali.pubKeyCompressed,
      );

      expect(preparedTx.multiSign).toBe(false);
      expect(preparedTx.hashToSign).toBeDefined();
      expect(preparedTx.message).toBeDefined();
      expect(preparedTx.signingPubKey).toBe(
        fixtures.rawSigning.accounts.ali.pubKeyCompressed,
      );
      expect(preparedTx.transaction).toMatchObject(
        Object.assign(
          {},
          {
            ...fixtures.rawSigning.tx,
            SigningPubKey: fixtures.rawSigning.accounts.ali.pubKeyCompressed,
          },
        ),
      );

      const signedObject = rawSigning.complete(
        preparedTx,
        fixtures.rawSigning.accounts.ali.signature,
      );

      expect(signedObject.type).toBe("SignedTx");
      expect(signedObject.txnSignature).not.toBe("");
      expect(signedObject.signatureVerifies).toBe(true);
      expect(signedObject.txJson).toMatchObject(
        Object.assign(
          {},
          {
            ...fixtures.rawSigning.tx,
            SigningPubKey: fixtures.rawSigning.accounts.ali.pubKeyCompressed,
            TxnSignature: signedObject.txnSignature,
          },
        ),
      );
      expect(signedObject.signedTransaction).not.toBe("");
      expect(signedObject.id).not.toBe("");
    });

    test("MultiSigned secp256k1 - uncompressed", () => {
      const signedByTristan = rawSigning.prepare(
        fixtures.rawSigning.tx,
        fixtures.rawSigning.accounts.tristan.uncompressedPubKey,
        true,
      );
      const signedByAli = rawSigning.prepare(
        fixtures.rawSigning.tx,
        fixtures.rawSigning.accounts.ali.uncompressedPubKey,
        true,
      );

      expect(signedByTristan.multiSign).toBe(true);
      expect(signedByTristan.hashToSign).toBeDefined();
      expect(signedByTristan.message).toBeDefined();
      expect(signedByTristan.signingPubKey).toBe(
        fixtures.rawSigning.accounts.tristan.pubKeyCompressed,
      );
      expect(signedByTristan.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.tx, { SigningPubKey: "" }),
      );

      expect(signedByAli.multiSign).toBe(true);
      expect(signedByAli.hashToSign).toBeDefined();
      expect(signedByAli.message).toBeDefined();
      expect(signedByAli.signingPubKey).toBe(
        fixtures.rawSigning.accounts.ali.pubKeyCompressed,
      );
      expect(signedByAli.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.tx, { SigningPubKey: "" }),
      );

      const signatures = [
        {
          pubKey: fixtures.rawSigning.accounts.ali.uncompressedPubKey,
          signature: fixtures.rawSigning.accounts.ali.signatureMS,
        },
        {
          pubKey: fixtures.rawSigning.accounts.tristan.uncompressedPubKey,
          signature: fixtures.rawSigning.accounts.tristan.signatureMS,
        },
      ];

      const signedObject = rawSigning.completeMultiSigned(
        fixtures.rawSigning.tx,
        signatures,
      );

      expect(signedObject.type).toBe("MultiSignedTx");
      expect(signedObject.txnSignature).toBe("");
      expect(signedObject.signatureVerifies).toBe(true);
      // @ts-ignore
      expect(signedObject.txJson.Signers.length).toBe(2);
      expect(signedObject.signedTransaction).not.toBe("");
      expect(signedObject.id).not.toBe("");
    });

    test("MultiSigned secp256k1 - compressed", () => {
      const signedByTristan = rawSigning.prepare(
        fixtures.rawSigning.tx,
        fixtures.rawSigning.accounts.tristan.pubKeyCompressed,
        true,
      );
      const signedByAli = rawSigning.prepare(
        fixtures.rawSigning.tx,
        fixtures.rawSigning.accounts.ali.pubKeyCompressed,
        true,
      );

      expect(signedByTristan.multiSign).toBe(true);
      expect(signedByTristan.hashToSign).toBeDefined();
      expect(signedByTristan.message).toBeDefined();
      expect(signedByTristan.signingPubKey).toBe(
        fixtures.rawSigning.accounts.tristan.pubKeyCompressed,
      );
      expect(signedByTristan.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.tx, { SigningPubKey: "" }),
      );

      expect(signedByAli.multiSign).toBe(true);
      expect(signedByAli.hashToSign).toBeDefined();
      expect(signedByAli.message).toBeDefined();
      expect(signedByAli.signingPubKey).toBe(
        fixtures.rawSigning.accounts.ali.pubKeyCompressed,
      );
      expect(signedByAli.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.tx, { SigningPubKey: "" }),
      );

      const signatures = [
        {
          pubKey: fixtures.rawSigning.accounts.ali.pubKeyCompressed,
          signature: fixtures.rawSigning.accounts.ali.signatureMS,
        },
        {
          pubKey: fixtures.rawSigning.accounts.tristan.pubKeyCompressed,
          signature: fixtures.rawSigning.accounts.tristan.signatureMS,
        },
      ];

      const signedObject = rawSigning.completeMultiSigned(
        fixtures.rawSigning.tx,
        signatures,
      );

      expect(signedObject.type).toBe("MultiSignedTx");
      expect(signedObject.txnSignature).toBe("");
      expect(signedObject.signatureVerifies).toBe(true);
      // @ts-ignore
      expect(signedObject.txJson.Signers.length).toBe(2);
      expect(signedObject.signedTransaction).not.toBe("");
      expect(signedObject.id).not.toBe("");
    });

    it("get Hash (message) to sign, ed25519", () => {
      const unsignedTx = {
        TransactionType: "Payment",
        Sequence: 13371002,
        Fee: "12",
        Amount: "5000000",
        Account: "rBkiQiQAkmiTidSofBqpVbBxu9PhbyZsdW",
        Destination: "rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ",
      };
      expect(
        rawSigning.prepare(unsignedTx, fixtures.utils.edPubKeyCompressed)
          .hashToSign,
      ).toEqual(fixtures.rawSigning.edMessageToSign);
    });

    test("MultiSigned ed25519 - uncompressed", () => {
      const signedByTristan = rawSigning.prepare(
        fixtures.rawSigning.txEd,
        fixtures.rawSigning.accounts.tristan.uncompressedPubKeyEd,
        true,
      );
      const signedByAli = rawSigning.prepare(
        fixtures.rawSigning.txEd,
        fixtures.rawSigning.accounts.ali.uncompressedPubKeyEd,
        true,
      );

      expect(signedByTristan.multiSign).toBe(true);
      expect(signedByTristan.hashToSign).toBeDefined();
      expect(signedByTristan.message).toBeDefined();
      expect(signedByTristan.signingPubKey).toBe(
        fixtures.rawSigning.accounts.tristan.pubKeyCompressedEd,
      );
      expect(signedByTristan.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.txEd, { SigningPubKey: "" }),
      );

      expect(signedByAli.multiSign).toBe(true);
      expect(signedByAli.hashToSign).toBeDefined();
      expect(signedByAli.message).toBeDefined();
      expect(signedByAli.signingPubKey).toBe(
        fixtures.rawSigning.accounts.ali.pubKeyCompressedEd,
      );
      expect(signedByAli.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.txEd, { SigningPubKey: "" }),
      );

      const signatures = [
        {
          pubKey: fixtures.rawSigning.accounts.ali.uncompressedPubKeyEd,
          signature: fixtures.rawSigning.accounts.ali.signatureMSEd,
        },
        {
          pubKey: fixtures.rawSigning.accounts.tristan.uncompressedPubKeyEd,
          signature: fixtures.rawSigning.accounts.tristan.signatureMSEd,
        },
      ];

      const signedObject = rawSigning.completeMultiSigned(
        fixtures.rawSigning.txEd,
        signatures,
      );

      expect(signedObject.type).toBe("MultiSignedTx");
      expect(signedObject.txnSignature).toBe("");
      expect(signedObject.signatureVerifies).toBe(true);
      // @ts-ignore
      expect(signedObject.txJson.Signers.length).toBe(2);
      expect(signedObject.signedTransaction).not.toBe("");
      expect(signedObject.id).not.toBe("");
    });

    test("MultiSigned ed25519 - compressed", () => {
      const signedByTristan = rawSigning.prepare(
        fixtures.rawSigning.txEd,
        fixtures.rawSigning.accounts.tristan.pubKeyCompressedEd,
        true,
      );
      const signedByAli = rawSigning.prepare(
        fixtures.rawSigning.txEd,
        fixtures.rawSigning.accounts.ali.pubKeyCompressedEd,
        true,
      );

      expect(signedByTristan.multiSign).toBe(true);
      expect(signedByTristan.hashToSign).toBeDefined();
      expect(signedByTristan.message).toBeDefined();
      expect(signedByTristan.signingPubKey).toBe(
        fixtures.rawSigning.accounts.tristan.pubKeyCompressedEd,
      );
      expect(signedByTristan.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.txEd, { SigningPubKey: "" }),
      );

      expect(signedByAli.multiSign).toBe(true);
      expect(signedByAli.hashToSign).toBeDefined();
      expect(signedByAli.message).toBeDefined();
      expect(signedByAli.signingPubKey).toBe(
        fixtures.rawSigning.accounts.ali.pubKeyCompressedEd,
      );
      expect(signedByAli.transaction).toMatchObject(
        Object.assign(fixtures.rawSigning.txEd, { SigningPubKey: "" }),
      );

      const signatures = [
        {
          pubKey: fixtures.rawSigning.accounts.ali.pubKeyCompressedEd,
          signature: fixtures.rawSigning.accounts.ali.signatureMSEd,
        },
        {
          pubKey: fixtures.rawSigning.accounts.tristan.pubKeyCompressedEd,
          signature: fixtures.rawSigning.accounts.tristan.signatureMSEd,
        },
      ];

      const signedObject = rawSigning.completeMultiSigned(
        fixtures.rawSigning.txEd,
        signatures,
      );

      expect(signedObject.type).toBe("MultiSignedTx");
      expect(signedObject.txnSignature).toBe("");
      expect(signedObject.signatureVerifies).toBe(true);
      // @ts-ignore
      expect(signedObject.txJson.Signers.length).toBe(2);
      expect(signedObject.signedTransaction).not.toBe("");
      expect(signedObject.id).not.toBe("");
    });
  });

  /* Combine ==================================================================== */

  describe("Combine", () => {
    test("Text HEX", () => {
      const result = sign(fixtures.multisignedHex);
      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction.length).toBeGreaterThan(10);
    });

    test("Object HEX", () => {
      const result = sign(
        fixtures.multisignedHex.map((r: string) => {
          return { signedTransaction: r };
        }),
      );
      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction.length).toBeGreaterThan(10);
    });
  });

  // The end
});
