import fixtures from "./fixtures/api.json";
import { derive, sign } from "../src";
import { XrplDefinitions, decode } from "ripple-binary-codec";

const defs = require("./fixtures/customDefinitions.json");

const definitions = new XrplDefinitions(defs);

describe("Api", () => {
  /* Custom Definitions ========================================================= */
  describe("Alternative native asset", () => {
    test("One account using secp256k1", () => {
      const result = sign(
        {
          TransactionType: "TrustSet",
          Account: "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
          LimitAmount: {
            currency: "XRP",
            issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
            value: "100"
          },
      },
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      // console.log(result.signedTransaction)
      // console.log(decode(result.signedTransaction, definitions))
    });
  });

  // The end
});
