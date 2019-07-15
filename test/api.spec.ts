import fixtures from "./fixtures/api.json";
import { derive, generate, sign } from "../src";

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
    test("One account", () => {
      const result = sign(
        fixtures.tx,
        derive.familySeed(fixtures.familySeed.secp256k1.seed)
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("MultiSign", () => {
      const result = sign(fixtures.tx, [
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        derive.familySeed(fixtures.familySeed.ed25519.seed)
      ]);

      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signers.length).toBe(2);
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
});
