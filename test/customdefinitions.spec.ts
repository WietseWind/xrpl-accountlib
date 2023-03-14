import fixtures from "./fixtures/api.json";
import { derive, generate, sign, rawSigning, utils } from "../src";
import { XrplDefinitions } from "ripple-binary-codec";

const defs = require("./fixtures/customDefinitions.json");
const definitions = new XrplDefinitions(defs);

describe("Api", () => {
  /* Custom Definitions ========================================================= */
  describe("Custom definitions", () => {
    test("One account using secp256k1", () => {
      const result = sign(
        fixtures.customTx,
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
    });

    test("MultiSign Transaction", () => {
      const result = sign(
        fixtures.customTx,
        [
          derive.familySeed(fixtures.familySeed.secp256k1.seed),
          derive.familySeed(fixtures.familySeed.ed25519.seed),
          derive.mnemonic(fixtures.mnemonic.mnemonic),
        ],
        definitions
      );

      expect(result.type).toBe("MultiSignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect(result.signers.length).toBe(3);
    });
  });

  // The end
});
