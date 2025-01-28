import fixtures from "./fixtures/api.json";
import * as utils from "../src/utils";

describe("Utils", () => {
  it("computeBinaryTransactionHash", () => {
    const blob = "120000210000535A242F2C21EB2E00000000201B013F8B6F6140000000000F424068400000000000000C7321027A5D6C217B333E26A2520233896D4A578755E89A1F781E51F962A24C74A6D4FE74463044022078CDE6CD9EC23F7C6790D803F050E02FFD610E0049C9C500E2B1088770BA43FB02202F33DF0EC7677490A627D921514F70ACFD71F8A812045F36AAE4445BD198B02C811465BB283B4ABDED015498CC5A2665D09DBA26586283146C1D22888CF2CC88579D71FE0BE6890FE2268BF3";
    expect(utils.computeBinaryTransactionHash(blob))
      .toEqual('1479E092BA3F6B9C3C537B1FCA2F9E60875AE17B78C384B597851518C62ACE13');
  });

  it("hexToBytes - zero", () => {
    expect(utils.hexToBytes("000000")).toEqual([0, 0, 0]);
  });

  it("hexToBytes - DEADBEEF", () => {
    expect(utils.hexToBytes("DEADBEEF")).toEqual([222, 173, 190, 239]);
  });

  it("derives account from secp256k1 compressed pubkey", () => {
    expect(utils.deriveAddress(fixtures.utils.PubKeyCompressed)).toEqual(
      fixtures.utils.PubKeyAccount
    );
  });

  it("derives account from ed25519 pubkey", () => {
    expect(utils.deriveAddress(fixtures.utils.edPubKeyCompressed)).toEqual(
      fixtures.utils.edPubKeyAccount
    );
  });
});

describe("Utils - rawSigning", () => {
  it("compresses an uncompressed secp256k1 pubkey", () => {
    expect(utils.compressPubKey(fixtures.utils.PubKeyUncompressed)).toEqual(
      fixtures.utils.PubKeyCompressed
    );
  });

  it("doesn't touch an already compressed secp256k1 pubkey", () => {
    expect(
      utils.compressPubKey(fixtures.rawSigning.accounts.ali.pubKeyCompressed)
    ).toEqual(fixtures.rawSigning.accounts.ali.pubKeyCompressed);
  });

  it("hash", () => {
    expect(
      utils.bytesToHex(utils.hash(fixtures.utils.txPreSignMessage))
    ).toEqual(fixtures.utils.txPreSignHash);
  });

  it("encodeTransaction - unsigned, secp256k1", () => {
    const unsignedTx = {
      TransactionType: "Payment",
      Sequence: 59924898,
      Fee: "12",
      Amount: "2000000",
      Account: "rG9eprWEMoVyoesnVaouEJ26UEwXszpNJ8",
      Destination: "rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ",
      SigningPubKey:
        "03883B808306F84B358FEF891D4614F2303A3B8B15685513FB094D4828EC33A1D6",
    };
    expect(utils.encodeTransaction(unsignedTx)).toEqual(
      fixtures.utils.txPreSignMessage
    );
  });

  it("encodeTransaction - unsigned, secp256k1 - XRPL + Native Asset", () => {
    const unsignedTx = {
      TransactionType: "TrustSet",
      NetworkID: 21336,
      LimitAmount: {
        currency: "XRP",
        value: "100",
        issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
      },
    };
    expect(utils.encodeTransaction(unsignedTx)).toEqual(
      "53545800120014210000535863D5038D7EA4C6800000000000000000000000000000000000000000001A1FE3983C300D142EC2CF154C8A6BBB275875D2"
    );
  });

  it("encodeTransaction - unsigned, secp256k1 - XRPL + Non-Native Asset", () => {
    const unsignedTx = {
      TransactionType: "TrustSet",
      NetworkID: 21336,
      LimitAmount: {
        currency: "XAH",
        value: "100",
        issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
      },
    };
    expect(utils.encodeTransaction(unsignedTx)).toEqual(
      "53545800120014210000535863D5038D7EA4C6800000000000000000000000000058414800000000001A1FE3983C300D142EC2CF154C8A6BBB275875D2"
    );
  });

  it("encodeTransaction - unsigned, secp256k1 - Xahau + Native Asset", () => {
    const unsignedTx = {
      TransactionType: "TrustSet",
      NetworkID: 21337,
      LimitAmount: {
        currency: "XAH",
        value: "100",
        issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
      },
    };
    expect(utils.encodeTransaction(unsignedTx)).toEqual(
      "53545800120014210000535963D5038D7EA4C6800000000000000000000000000000000000000000001A1FE3983C300D142EC2CF154C8A6BBB275875D2"
    );
  });

  it("encodeTransaction - unsigned, secp256k1 - Xahau + Non-Native Asset", () => {
    const unsignedTx = {
      TransactionType: "TrustSet",
      NetworkID: 21337,
      LimitAmount: {
        currency: "XRP",
        value: "100",
        issuer: "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
      },
    };
    expect(utils.encodeTransaction(unsignedTx)).toEqual(
      "53545800120014210000535963D5038D7EA4C6800000000000000000000000000058525000000000001A1FE3983C300D142EC2CF154C8A6BBB275875D2"
    );
  });

  it("secp256k1_p1363ToFullyCanonicalDerSignature", () => {
    expect(
      utils.secp256k1_p1363ToFullyCanonicalDerSignature(
        fixtures.utils.p1363signature
      )
    ).toEqual(fixtures.utils.derSignature);
  });

  it("verifySignature secp256k1", () => {
    expect(utils.compressPubKey(fixtures.utils.txPrePubUncompressed)).toEqual(
      fixtures.utils.txPrePubCompressed
    );

    expect(
      utils.verifySignature(
        fixtures.utils.txPreSignMessage,
        fixtures.utils.derSignature,
        fixtures.utils.txPrePubCompressed
      )
    ).toEqual(true);
  });
});
