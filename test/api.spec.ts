import fixtures from "./fixtures/api.json";
import { derive, generate, sign, rawSecp256k1P1363 } from "../src";

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

    test("Mnemonic", () => {
      const account = derive.mnemonic(fixtures.mnemonic.mnemonic, {
        passphrase: fixtures.mnemonic.passphrase
      });
      expect(account.accountType).toBe("mnemonic");
      expect(account.address).toBe(fixtures.mnemonic.address);
      expect(account.keypair).toEqual(fixtures.mnemonic.keypair);
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
        passphrase: "Hello World!"
      });
      expect(account.accountType).toBe("mnemonic");
      expect(account.secret.familySeed).toBe(null);
      expect(account.secret.mnemonic).toBeDefined();
    });
  });

  /* Sign ==================================================================== */

  describe("Sign", () => {
    test("One account using secp256k1", () => {
      const result = sign(
        fixtures.tx,
        derive.familySeed(fixtures.familySeed.secp256k1.seed)
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("One account using mnemonic", () => {
      const result = sign(
        fixtures.tx,
        derive.familySeed(fixtures.familySeed.secp256k1.seed)
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("SignIn PseudoTransaction using secp256k1", () => {
      const result = sign(
        fixtures.txPseudo,
        derive.mnemonic(fixtures.mnemonic.mnemonic)
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("SignIn PseudoTransaction using mnemonic", () => {
      const result = sign(
        fixtures.txPseudo,
        derive.familySeed(fixtures.familySeed.secp256k1.seed)
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
          .signAs("rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY")
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("MultiSign", () => {
      const result = sign(fixtures.tx, [
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        derive.familySeed(fixtures.familySeed.ed25519.seed),
        derive.mnemonic(fixtures.mnemonic.mnemonic)
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
        derive.mnemonic(fixtures.mnemonic.mnemonic)
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
          .signAs("rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY")
      ]);

      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signers.length).toBe(2);
    });
  });

    /* Combine ==================================================================== */

  describe("RawSecp256k1P1363", () => {
    test("Basic", () => {
      const preparedTx = rawSecp256k1P1363.prepare(fixtures.rawSecp256k1P1363.tx, fixtures.rawSecp256k1P1363.accounts.ali.uncompressedPubKey)

      expect(preparedTx.multiSign).toBe(false)
      expect(preparedTx.hashToSign).toBeDefined()
      expect(preparedTx.message).toBeDefined()
      expect(preparedTx.signingPubKey).toBe(fixtures.rawSecp256k1P1363.accounts.ali.pubKeyCompressed);
      expect(preparedTx.transaction).toMatchObject(Object.assign(fixtures.rawSecp256k1P1363.tx, {SigningPubKey: fixtures.rawSecp256k1P1363.accounts.ali.pubKeyCompressed }))

      const sigendObject = rawSecp256k1P1363.complete(preparedTx, fixtures.rawSecp256k1P1363.accounts.ali.signature)

      expect(sigendObject.type).toBe("SignedTx")
      expect(sigendObject.txnSignature).not.toBe('')
      expect(sigendObject.signatureVerifies).toBe(true)
      expect(sigendObject.txJson).toMatchObject(Object.assign(fixtures.rawSecp256k1P1363.tx, {SigningPubKey: fixtures.rawSecp256k1P1363.accounts.ali.pubKeyCompressed, TxnSignature:  sigendObject.txnSignature}))
      expect(sigendObject.signedTransaction).not.toBe('')
      expect(sigendObject.id).not.toBe('')
    });


    test("MultiSigned", () => {
      const signedByTristan = rawSecp256k1P1363.prepare(fixtures.rawSecp256k1P1363.tx, fixtures.rawSecp256k1P1363.accounts.tristan.uncompressedPubKey, true)
      const signedByAli     = rawSecp256k1P1363.prepare(fixtures.rawSecp256k1P1363.tx, fixtures.rawSecp256k1P1363.accounts.ali.uncompressedPubKey, true)
      
      expect(signedByTristan.multiSign).toBe(true)
      expect(signedByTristan.hashToSign).toBeDefined()
      expect(signedByTristan.message).toBeDefined()
      expect(signedByTristan.signingPubKey).toBe(fixtures.rawSecp256k1P1363.accounts.tristan.pubKeyCompressed);
      expect(signedByTristan.transaction).toMatchObject(Object.assign(fixtures.rawSecp256k1P1363.tx, {SigningPubKey: "" }))

      expect(signedByAli.multiSign).toBe(true)
      expect(signedByAli.hashToSign).toBeDefined()
      expect(signedByAli.message).toBeDefined()
      expect(signedByAli.signingPubKey).toBe(fixtures.rawSecp256k1P1363.accounts.ali.pubKeyCompressed);
      expect(signedByAli.transaction).toMatchObject(Object.assign(fixtures.rawSecp256k1P1363.tx, {SigningPubKey: "" }))

      const signatures = [
        {
          pubKey: fixtures.rawSecp256k1P1363.accounts.ali.uncompressedPubKey,
          signature: fixtures.rawSecp256k1P1363.accounts.ali.signatureMS,
        },
        {
          pubKey: fixtures.rawSecp256k1P1363.accounts.tristan.uncompressedPubKey,
          signature: fixtures.rawSecp256k1P1363.accounts.tristan.signatureMS,
        }
      ]
      
      const sigendObject = rawSecp256k1P1363.completeMultiSigned(fixtures.rawSecp256k1P1363.tx, signatures)

      expect(sigendObject.type).toBe("MultiSignedTx")
      expect(sigendObject.txnSignature).toBe('')
      expect(sigendObject.signatureVerifies).toBe(true)
      // @ts-ignore
      expect(sigendObject.txJson.Signers.length).toBe(2)
      expect(sigendObject.signedTransaction).not.toBe('')
      expect(sigendObject.id).not.toBe('')
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
      const result = sign(fixtures.multisignedHex.map((r: string) => {
        return { signedTransaction: r }
      }));
      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction.length).toBeGreaterThan(10);
    });
  });
});
