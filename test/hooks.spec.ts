import fixtures from "./fixtures/api.json";
import { derive, sign } from "../src";
import { XrplDefinitions, decode } from "ripple-binary-codec";

const defs = require("./fixtures/customDefinitions.json");

defs.FIELDS.push([
  'NewFieldArray',
  {
    nth: 100,
    isVLEncoded: false,
    isSerialized: true,
    isSigningField: true,
    type: 'STArray',
  },
])

defs.FIELDS.push([
  'NewField',
  {
    nth: 101,
    isVLEncoded: false,
    isSerialized: true,
    isSigningField: true,
    type: 'STObject',
  },
])

defs.FIELDS.push([
  'NewFieldValue',
  {
    nth: 102,
    isVLEncoded: false,
    isSerialized: true,
    isSigningField: true,
    type: 'UInt32',
  },
]);

const definitions = new XrplDefinitions(defs);

describe("Api", () => {
  /* Custom Definitions ========================================================= */
  describe("Sign STObject STArray nested", () => {
    test("One account using secp256k1", () => {
      const result = sign(
        {
          ...fixtures.customTx,
          NewFieldArray: [
            {
              NewField: {
                NewFieldValue: 10,
              },
            },
          ],
        },
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      expect((decode(result.signedTransaction, definitions)?.NewFieldArray as any)?.[0]?.NewField?.NewFieldValue).toEqual(10);
    });
  });

  // The end
});
