const lib = require("../");

console.log("XRPL-AccountLib");
console.log();

/**
 * You can try this at TestNet,
 *    https://xrpl.org/xrp-testnet-faucet.html
 * Using:
 *    https://xrp.fans/ (Click the "Switch to TESTNET" button)
 */

// First setup a Signer List
// const Tx = {
//   Flags: 0,
//   TransactionType: 'SignerListSet',
//   Account: 'rBRnkVBkA79gDF52zNwzYLXhAQsCeqYoNQ', // snnvKfBAyTnDB9JpXWxZCmiv5Sb4v
//   Fee: '1000',
//   SignerQuorum: 2,
//   Sequence: 4,
//   SignerEntries: [
//     {
//       SignerEntry: {
//         Account: 'r9yzFismdTTWzc6Ea3mJr9by26QaFrFHP7',
//         SignerWeight: 2
//       }
//     },
//     {
//       SignerEntry: {
//         Account: 'rpxfMpvC5NLRydTDgqfURqgVpz5nos7zit',
//         SignerWeight: 2
//       }
//     }
//   ]
// }

const Tx = {
  TransactionType: "Payment",
  Account: "rBRnkVBkA79gDF52zNwzYLXhAQsCeqYoNQ",
  Fee: "1000",
  Destination: "r9yzFismdTTWzc6Ea3mJr9by26QaFrFHP7",
  Amount: "50000000",
  DestinationTag: 495,
  Sequence: 11
};

console.log("Sign: multiSign");
console.dir(
  lib.sign(Tx, [
    lib.derive
      .familySeed("sp5mkm12oJj3t8fFRiaMNrDbc73N2")
      .signAs("r9yzFismdTTWzc6Ea3mJr9by26QaFrFHP7"),
    lib.derive
      .familySeed("shqNUmrgnkBmK9iCijrtid2Ua4uHd")
      .signAs("rpxfMpvC5NLRydTDgqfURqgVpz5nos7zit")
  ]),
  { depth: null }
);
console.log();

// console.log('Sign: or: MultiSign from per-account signed blob')
// console.dir(lib.sign([
//   { signedTransaction: '120000240000000B2E000001EF614000000002FAF0806840000000000003E873008114723F34B08C70F3EF8759B1A2CD4934D434A3C2518314628891E80B72684CF065A0AE8EC3482472C1C0DCF3E010732103AC651208BDA639C7AEC10873771A5B5F1A2008CAB3B2155871EE16A966D5860774473045022100CD9BC97047BF8EE0AF2D7631540FFF4C5FFE863AFAA9E2DE7AD98156F3323CF9022031D0454947833536028029FB9B61B224F4C2BFC1D1F670C49880AD004A76315C8114723F34B08C70F3EF8759B1A2CD4934D434A3C251E1F1' },
//   { signedTransaction: '12000024000000042E000001EF614000000007F81ED96840000000000003E873008114F84E8A80D08854F3621F9214D58F04D41A07EE108314F40B468D5AC0DBA36E2941877AC2E9BBD48262A1F3E010732103CA9799516799A1139BED8958A9FDD0033389396422B888A7E56FB9991B0A179E74473045022100B22D6874CC4ECC92D32E657A1F863245A4DB1B425260052A9427616BE397D244022023CA82B76ADD26909549381C5CCB7BB09084936B294577299F5796A22F5AC39E8114F40B468D5AC0DBA36E2941877AC2E9BBD48262A1E1F1' }
// ]), { depth: null })
// console.log()
