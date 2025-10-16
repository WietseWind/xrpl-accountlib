import * as utils from "../src/utils";
import { familySeed } from "../src/derive";
import { signInnerBatch } from "../src";

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
        Account: childAccount1.address,
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
        Destination: childAccount1.address,
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
          "14F0B04B583E476ADDE2D4CBFB15E45B81D4BA55B7726281835DEE24037E6854F80D461062E333499356B8B9F683E15CED45975F7DC8DF316E0B041FB835EC00",
      },
    },
    {
      BatchSigner: {
        Account: "rMrcKatiqxvM2wZ7d2LT8Ro8fQyyEyUFVP",
        SigningPubKey:
          "ED94FEE05507261B9A295EA004E709484DA052EDE862EC4EDDB11166C28BEA8309",
        TxnSignature:
          "86454C88FAA96B20BE5F6F638449C8A33F42469E63BA4DB5079CBA36836988CA55510BDA53CA452BDCBB7C7BFD4A08E73DC8ABCA86E0D24D2AFFC82F1A172B03",
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

  it("createBatchInnerTxnBlob", () => {
    const batchSignerPayload = utils.createBatchInnerTxnBlob(
      Tx.Flags,
      innerHashes
    );
    expect(batchSignerPayload).toEqual(
      "4243480000040000000000026DA0477AB7582AA53005DEE9549ACF547C5722569DB685B8823CA4ECEB303297635D067BF4771B882B108E4CD378E03BC36AAD02A3C4999A2CB936918B12E2EC"
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
});
