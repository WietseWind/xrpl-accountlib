import fixtures from "./fixtures/api.json";
import { derive, sign } from "../src";
import { XrplDefinitions, nativeAsset } from "ripple-binary-codec";

const defs = require("./fixtures/customDefinitions.json");

const definitions = new XrplDefinitions(defs);

const baseTxXrp = {
  TransactionType: 'TrustSet',
  Account: 'ra5nK24KXen9AHvsdFTKHSANinZseWnPcX',
  LimitAmount: {
    currency: 'XRP',
    issuer: 'rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc',
    value: '100',
  },
}

const baseTxXah = {
  TransactionType: 'TrustSet',
  Account: 'ra5nK24KXen9AHvsdFTKHSANinZseWnPcX',
  LimitAmount: {
    currency: 'XAH',
    issuer: 'rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc',
    value: '100',
  },
}

const account = derive.familySeed(fixtures.familySeed.secp256k1.seed)

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
        account,
        definitions
      );
      expect(result.type).toBe("SignedTx");
      expect(result.id).toBeDefined();
      expect(result.signedTransaction).toBeDefined();
      // console.log(result.signedTransaction)
      // console.log(decode(result.signedTransaction, definitions))
    });
  });
  
  describe('XRP Native asset', function () {
    it('XRP as native to be native', function () {
      nativeAsset.set('XRP')
  
      expect(sign(baseTxXrp, account, definitions).signedTransaction.slice(24, 64)).toEqual(
        '0000000000000000000000000000000000000000',
      )
    })
    it('XRP as non-native to be non-native', function () {
      nativeAsset.set('XAH')
  
      expect(sign(baseTxXrp, account, definitions).signedTransaction.slice(24, 64)).toEqual(
        '0000000000000000000000005852500000000000',
      )
    })
    it('XAH as native to be native', function () {
      nativeAsset.set('XAH')
  
      expect(sign(baseTxXah, account, definitions).signedTransaction.slice(24, 64)).toEqual(
        '0000000000000000000000000000000000000000',
      )
    })
    it('XAH as non-native to be non-native', function () {
      nativeAsset.set('XRP')
  
      expect(sign(baseTxXah, account, definitions).signedTransaction.slice(24, 64)).toEqual(
        '0000000000000000000000005841480000000000',
      )
    })
  })  
  // The end
});
