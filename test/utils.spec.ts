import fixtures from "./fixtures/api.json";
import * as utils from "../src/utils";

describe("Utils", () => {
  it("hexToBytes - zero", () => {
    expect(utils.hexToBytes("000000")).toEqual([0, 0, 0]);
  });

  it("hexToBytes - DEADBEEF", () => {
    expect(utils.hexToBytes("DEADBEEF")).toEqual([222, 173, 190, 239]);
  });

  it("derives account from compressed pubkey", () => {
    expect(utils.deriveAddress(fixtures.utils.PubKeyCompressed))
      .toEqual(fixtures.utils.PubKeyAccount);
  });
});

describe("Utils - rawSecp256k1P1363", () => {
  it("compresses an uncompressed pubkey", () => {
    expect(utils.compressPubKey(fixtures.utils.PubKeyUncompressed))
      .toEqual(fixtures.utils.PubKeyCompressed);
  });

  it("hash", () => {
    expect(utils.bytesToHex(utils.hash(fixtures.utils.txPreSignMessage)))
      .toEqual(fixtures.utils.txPreSignHash);
  });

  it("encodeTransaction - unsigned", () => {
    const unsignedTx = {
      TransactionType: 'Payment',
      Sequence: 59924898,
      Fee: '12',
      Amount: '2000000',
      Account: 'rG9eprWEMoVyoesnVaouEJ26UEwXszpNJ8',
      Destination: 'rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ',
      SigningPubKey: '03883B808306F84B358FEF891D4614F2303A3B8B15685513FB094D4828EC33A1D6'
    }
    expect(utils.encodeTransaction(unsignedTx)).toEqual(fixtures.utils.txPreSignMessage);
  });

  it("secp256k1_p1363ToFullyCanonicalDerSignature", () => {
    expect(utils.secp256k1_p1363ToFullyCanonicalDerSignature(fixtures.utils.p1363signature))
      .toEqual(fixtures.utils.derSignature);
  });

  it("verifySignature", () => {
    expect(utils.compressPubKey(fixtures.utils.txPrePubUncompressed))
      .toEqual(fixtures.utils.txPrePubCompressed);

    expect(utils.verifySignature(fixtures.utils.txPreSignMessage, fixtures.utils.derSignature, fixtures.utils.txPrePubCompressed))
      .toEqual(true);
  });
});
