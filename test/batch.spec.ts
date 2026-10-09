import { verify } from "ripple-keypairs";
import * as utils from "../src/utils";
import { familySeed } from "../src/derive";
import { signInnerBatch } from "../src";
import { nativeAsset } from "../src/nativeAsset";
import devnetBatch from "./fixtures/batch-v1-1-devnet.json";

const parentAccount = familySeed("sEdVG7nzg5iXsHWbd6CxKs5PYx6qKyG"); // rPJLVD5wBodKz721xk3V3AT7wUJx878ajU
const childAccount1 = familySeed("sEdVfE5cbKj6DG5oDnfCED3WX4J7nD1"); // rnmxGK7ShgVNynKJCeFKkDZVJ1ji1UXmL3
const childAccount2 = familySeed("sEdTtwrsJDWb4vVg63YTTez3WGGn8gz"); // rMrcKatiqxvM2wZ7d2LT8Ro8fQyyEyUFVP

const Tx = {
  TransactionType: "Batch",
  Account: parentAccount.address,
  Flags: 262144,
  Sequence: 357642 + 1,
  Fee: "1337",
  RawTransactions: [
    {
      RawTransaction: {
        TransactionType: "Payment",
        Amount: "99999",
        Account: String(childAccount1.address),
        Destination: childAccount2.address,
        Sequence: 357646 + 1,
        Flags: 1073741824, // Inner batch
        Fee: "0",
        SigningPubKey: "",
      },
    },
    {
      RawTransaction: {
        TransactionType: "Payment",
        Amount: "88888",
        Account: childAccount2.address,
        Destination: String(childAccount1.address),
        Sequence: 357649 + 1,
        Flags: 1073741824, // Inner batch
        Fee: "0",
        SigningPubKey: "",
      },
    },
  ],
  BatchSigners: [
    {
      BatchSigner: {
        Account: "rnmxGK7ShgVNynKJCeFKkDZVJ1ji1UXmL3",
        SigningPubKey:
          "EDF8AAFC7D47850C2DE18E5E748C399C7BCA7D726BFBFA4163F8EAD09026E60146",
        TxnSignature:
          "F4A3426C8605A0F4BDE087ECBF0CACC9D13954FDE6973E8A1AC9143489FC71AFBE752504B1354E835DE1A7392CA3F9056009E845A6E8B4A5B793F751CCA89406",
      },
    },
    {
      BatchSigner: {
        Account: "rMrcKatiqxvM2wZ7d2LT8Ro8fQyyEyUFVP",
        SigningPubKey:
          "ED94FEE05507261B9A295EA004E709484DA052EDE862EC4EDDB11166C28BEA8309",
        TxnSignature:
          "885D43C632629BC02B65DB63D246EBFDFACF9FDADC1C8C0622B3D49C241A52B99B084187FF3ABF16EDC8979C99D977F530B48CA3138F73AC5FB8A38DBC22BE07",
      },
    },
  ],
};

const innerHashes = [
  "6DA0477AB7582AA53005DEE9549ACF547C5722569DB685B8823CA4ECEB303297",
  "635D067BF4771B882B108E4CD378E03BC36AAD02A3C4999A2CB936918B12E2EC",
];

describe("Utils", () => {
  it("hashBatchInnerTxn", () => {
    const r = Tx.RawTransactions.map((t) =>
      utils.hashBatchInnerTxn(t.RawTransaction)
    );
    expect(r).toEqual(innerHashes);
  });

  it("createBatchInnerTxnBlob (BatchV1_1)", () => {
    // Reference: ripple-binary-codec 2.11.0 encodeForSigningBatch
    const batchSignerPayload = utils.createBatchInnerTxnBlob(
      Tx.Flags,
      innerHashes,
      String(Tx.Account),
      Tx.Sequence,
      String(childAccount1.address)
    );
    expect(batchSignerPayload).toEqual(
      "42434800" + // HashPrefix.batch
        "F49A1AEA246919D01816F6FC7A632FE3B0A5E0BE" + // outer Account
        "0005750B" + // outer Sequence
        "00040000" + // Flags
        "00000002" + // txIDs length
        innerHashes.join("") +
        "3460F0074CC0A9D567C547689A0C30864BB3E1C9" // BatchSigner Account
    );
    expect(
      utils.batchSignerSigningData(Tx, String(childAccount1.address))
    ).toEqual(batchSignerPayload);
  });

  it("createBatchInnerTxnBlob requires the outer Account, Sequence and BatchSigner Account", () => {
    expect(() =>
      (utils.createBatchInnerTxnBlob as any)(Tx.Flags, innerHashes)
    ).toThrow(/outer \(Batch\) Account/);
    expect(() =>
      utils.batchSignerSigningData(
        { ...Tx, Account: undefined },
        String(childAccount1.address)
      )
    ).toThrow(/outer \(Batch\) Account/);
    expect(() =>
      utils.batchSignerSigningData(
        { ...Tx, Sequence: undefined },
        String(childAccount1.address)
      )
    ).toThrow(/Sequence or TicketSequence/);
    expect(() =>
      utils.batchSignerSigningData({ ...Tx, Sequence: 0 }, String(childAccount1.address))
    ).toThrow(/Sequence or TicketSequence/);
    expect(() => utils.batchSignerSigningData(Tx, "")).toThrow(
      /BatchSigner Account/
    );
  });

  it("batchSigners", () => {
    const innerSignatures = {
      BatchSigners: [
        signInnerBatch(Tx, childAccount1),
        signInnerBatch(Tx, childAccount2),
      ],
    };

    expect(innerSignatures).toEqual({ BatchSigners: Tx.BatchSigners });
  });

  it("batchSigners: TicketSequence when Sequence is 0", () => {
    // Reference: xrpl.js 5.3.0 signMultiBatch
    expect(
      signInnerBatch({ ...Tx, Sequence: 0, TicketSequence: 123 }, childAccount1)
    ).toEqual({
      BatchSigner: {
        Account: "rnmxGK7ShgVNynKJCeFKkDZVJ1ji1UXmL3",
        SigningPubKey:
          "EDF8AAFC7D47850C2DE18E5E748C399C7BCA7D726BFBFA4163F8EAD09026E60146",
        TxnSignature:
          "69A44848381DBB2C2DDB3CF4C6AB782AE0BD8C98E79CA2156F8D254E509B9A90CA3B7A4A3D1F5EA87A632487BC06F7BCE4A473CDEAD547920AB39668E3101B08",
      },
    });
  });

  it("batchSigners: regular key (signAs) signs for the inner account", () => {
    // childAccount2's key signs as childAccount1 (e.g. its regular key)
    // Reference: xrpl.js 5.3.0 signMultiBatch(wallet, tx, { batchAccount })
    const regularKey = familySeed("sEdTtwrsJDWb4vVg63YTTez3WGGn8gz");
    regularKey.signAs(String(childAccount1.address));
    expect(signInnerBatch(Tx, regularKey)).toEqual({
      BatchSigner: {
        Account: "rnmxGK7ShgVNynKJCeFKkDZVJ1ji1UXmL3",
        SigningPubKey:
          "ED94FEE05507261B9A295EA004E709484DA052EDE862EC4EDDB11166C28BEA8309",
        TxnSignature:
          "FBDED3B08D2A46889CB06B93301C1E69BE19A7AD3E5BD24B4FF9CC43FC1787578B892FF4B3AA5791071C302A38F750E260AB112E0C34D8496F008A8067BFF609",
      },
    });
  });

  it("batchSigners: secp256k1 signature verifies against the BatchV1_1 data", () => {
    const secpAccount = familySeed("snoPBrXtMeMyMHUVTgbuqAfg1SUTb"); // rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh
    const { BatchSigner } = signInnerBatch(Tx, secpAccount);
    expect(BatchSigner.Account).toEqual(String(secpAccount.address));
    expect(
      verify(
        utils.batchSignerSigningData(Tx, String(secpAccount.address)),
        BatchSigner.TxnSignature,
        BatchSigner.SigningPubKey
      )
    ).toEqual(true);
  });

  it("batchSignerSigningData: not affected by the native asset of an earlier signature", () => {
    const tx = {
      ...Tx,
      RawTransactions: [
        {
          RawTransaction: {
            TransactionType: "AMMDeposit",
            Account: childAccount1.address,
            Asset: { currency: "XRP" },
            Asset2: {
              currency: "USD",
              issuer: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",
            },
            Amount: "1000",
            Flags: 1073741824 | 524288, // Inner batch, tfSingleAsset
            Sequence: 357648,
            Fee: "0",
            SigningPubKey: "",
          },
        },
      ],
    };

    nativeAsset.set("XRP");
    const xrpData = utils.batchSignerSigningData(tx, String(childAccount1.address));

    // e.g. a Xahau transaction was signed before
    nativeAsset.set("XAH");
    expect(
      utils.batchSignerSigningData(tx, String(childAccount1.address))
    ).toEqual(xrpData);
  });

  it("BatchV1_1: matches a validated (tesSUCCESS) XRPL Devnet Batch", () => {
    const tx = (devnetBatch as any).tx;
    const { BatchSigner } = tx.BatchSigners[0];
    const data = utils.batchSignerSigningData(tx, BatchSigner.Account);
    expect(
      verify(data, BatchSigner.TxnSignature, BatchSigner.SigningPubKey)
    ).toEqual(true);

    // The original (pre BatchV1_1) data does not verify on this network
    const oldData = [
      "42434800",
      ("0".repeat(8) + Number(tx.Flags).toString(16)).slice(-8),
      ("0".repeat(8) + tx.RawTransactions.length.toString(16)).slice(-8),
      ...tx.RawTransactions.map((t: any) =>
        utils.hashBatchInnerTxn(t.RawTransaction)
      ),
    ].join("");
    expect(
      verify(oldData, BatchSigner.TxnSignature, BatchSigner.SigningPubKey)
    ).toEqual(false);
  });
});
