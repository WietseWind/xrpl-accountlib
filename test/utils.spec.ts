import * as utils from "../src/utils";

describe("Utils", () => {
  it("hexToBytes - zero", () => {
    expect(utils.hexToBytes("000000")).toEqual([0, 0, 0]);
  });

  it("hexToBytes - DEADBEEF", () => {
    expect(utils.hexToBytes("DEADBEEF")).toEqual([222, 173, 190, 239]);
  });
});
