import fixtures from "./fixtures/api.json";
import { derive, sign, rawSigning } from "../src";
import { verify } from "ripple-keypairs";

const TxFormats = [
  {
    command: "channel_authorize",
    channel: fixtures.paychan.common.input.channel,
    amount: fixtures.paychan.common.input.amount,
  },
  {
    TransactionType: "PaymentChannelAuthorize",
    channel: fixtures.paychan.common.input.channel,
    amount: fixtures.paychan.common.input.amount,
  },
  {
    channel: fixtures.paychan.common.input.channel,
    amount: fixtures.paychan.common.input.amount,
  },
];

describe("Paychan - native", () => {
  describe("secp256k1", () => {
    TxFormats.forEach((Tx) => {
      test("Test Payment Channel Authorization", () => {
        const account = derive.familySeed(
          fixtures.paychan.secp256k1.familySeed
        );
        const signed = sign(Tx, account);
        expect(signed.signedTransaction).toEqual(
          fixtures.paychan.secp256k1.authorization
        );
        expect(
          verify(
            fixtures.paychan.common.output.claim,
            signed.signedTransaction,
            fixtures.paychan.secp256k1.publicKey
          )
        ).toBeTruthy();
      });
    });
  });

  describe("ed25519", () => {
    TxFormats.forEach((Tx) => {
      test("Test Payment Channel Authorization", () => {
        const account = derive.familySeed(fixtures.paychan.ed25519.familySeed);
        const signed = sign(Tx, account);
        expect(signed.signedTransaction).toEqual(
          fixtures.paychan.ed25519.authorization
        );
        expect(
          verify(
            fixtures.paychan.common.output.claim,
            signed.signedTransaction,
            fixtures.paychan.ed25519.publicKey
          )
        ).toBeTruthy();
      });
    });
  });
});

describe("Paychan - Raw (NFC card)", () => {
  Object.keys(fixtures.paychan.raw.pubkeys).forEach((keyType) => {
    describe(keyType, () => {
      TxFormats.forEach((Tx) => {
        test("Test Payment Channel Authorization", () => {
          const PreparedAuthorization = rawSigning.prepare(
            Tx,
            (fixtures.paychan.raw.pubkeys as Record<string, any>)[keyType]
          );
          expect(PreparedAuthorization.hashToSign).toBe(
            (fixtures.paychan.raw.hashToSign as Record<string, any>)[keyType]
          );
          const Completed = rawSigning.complete(
            PreparedAuthorization,
            (fixtures.paychan.raw.signedResponse as Record<string, any>)[
              keyType
            ]
          );
          expect(Completed.type).toBe("SignedPayChanAuth");
          expect(Completed.signatureVerifies).toBeTruthy();
          expect(Completed.id).toBe("");
          expect(Completed.signedTransaction).toBe(
            (fixtures.paychan.raw.signedClaim as Record<string, any>)[keyType]
          );
          expect(
            verify(
              fixtures.paychan.common.output.claim,
              Completed.signedTransaction,
              PreparedAuthorization.signingPubKey
            )
          ).toBeTruthy();
        });
      });
    });
  });
});
