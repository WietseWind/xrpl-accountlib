import fixtures from "./fixtures/api.json";
import * as utils from "../src/utils";

describe("Utils", () => {
  it("hexToBytes - zero", () => {
    expect(utils.hexToBytes("000000")).toEqual([0, 0, 0]);
  });

  it("hexToBytes - DEADBEEF", () => {
    expect(utils.hexToBytes("DEADBEEF")).toEqual([222, 173, 190, 239]);
  });

  it("compresses an uncompressed pubkey", () => {
    expect(utils.compressPubKey(fixtures.utils.PubKeyUncompressed))
      .toEqual(fixtures.utils.PubKeyCompressed);
  });

  it("derives account from compressed pubkey", () => {
    expect(utils.deriveAddress(fixtures.utils.PubKeyCompressed))
      .toEqual(fixtures.utils.PubKeyAccount);
  });
});
