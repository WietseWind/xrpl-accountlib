import fixtures from "./fixtures/api.json";
import { derive, sign } from "../src";
import { XrplDefinitions } from "xrpl-binary-codec-prerelease";

const defs = require("./fixtures/customDefinitions.json");
const definitions = new XrplDefinitions(defs);

const baseTxXrp = {
  TransactionType: "TrustSet",
  Account: "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
  LimitAmount: {
    currency: "XRP",
    issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
    value: "100",
  },
  NetworkID: 0,
};

const baseTxXah = {
  TransactionType: "TrustSet",
  Account: "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
  LimitAmount: {
    currency: "XAH",
    issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
    value: "100",
  },
  NetworkID: 0,
};

describe("Native asset encoding", function () {
  it("XRP as native to be native", function () {
    expect(
      sign(
        Object.assign({}, { ...baseTxXrp, NetworkID: 1 }),
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      ).signedTransaction.slice(34, 74)
    ).toEqual("0000000000000000000000000000000000000000");
  });
  it("XRP as non-native to be non-native", function () {
    expect(
      sign(
        Object.assign({}, { ...baseTxXrp, NetworkID: 21337 }),
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      ).signedTransaction.slice(34, 74)
    ).toEqual("0000000000000000000000005852500000000000");
  });
  it("XAH as native to be native", function () {
    expect(
      sign(
        Object.assign({}, { ...baseTxXah, NetworkID: 21337 }),
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      ).signedTransaction.slice(34, 74)
    ).toEqual("0000000000000000000000000000000000000000");
  });
  it("XRP as non-native to be non-native", function () {
    expect(
      sign(
        Object.assign({}, { ...baseTxXah, NetworkID: 1 }),
        derive.familySeed(fixtures.familySeed.secp256k1.seed),
        definitions
      ).signedTransaction.slice(34, 74)
    ).toEqual("0000000000000000000000005841480000000000");
  });
});
