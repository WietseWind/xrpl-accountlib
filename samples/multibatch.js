const lib = require("../"); // Use require("xrpl-accountlib") for npm

console.log("XRPL-AccountLib");
console.log();

const parentAccount = lib.derive.familySeed("sEdVG7nzg5iXsHWbd6CxKs5PYx6qKyG"); // rPJLVD5wBodKz721xk3V3AT7wUJx878ajU
const childAccount1 = lib.derive.familySeed("sEdVfE5cbKj6DG5oDnfCED3WX4J7nD1"); // rnmxGK7ShgVNynKJCeFKkDZVJ1ji1UXmL3
const childAccount2 = lib.derive.familySeed("sEdTtwrsJDWb4vVg63YTTez3WGGn8gz"); // rMrcKatiqxvM2wZ7d2LT8Ro8fQyyEyUFVP

const Tx = {
  "TransactionType": "Batch",
  "Account": parentAccount.address,
  "Flags": 262144,
  "Sequence": 357642,
  "Fee": "1337",
  "RawTransactions": [
    {
      "RawTransaction": {
        "TransactionType": "Payment",
        "Amount": "99999",
        "Account": childAccount1.address,
        "Destination": childAccount2.address,
        "Sequence": 357646,
        "Flags": 1073741824, // Inner batch
        "Fee": "0",
        "SigningPubKey": ""
      }
    },
    {
      "RawTransaction": {
        "TransactionType": "Payment",
        "Amount": "88888",
        "Account": childAccount2.address,
        "Destination": childAccount1.address,
        "Sequence": 357649,
        "Flags": 1073741824, // Inner batch
        "Fee": "0",
        "SigningPubKey": ""
      }
    }
  ]
};

// TODO: add example for multi-signed batch signer

Object.assign(Tx, {
  BatchSigners: [
    lib.signInnerBatch(Tx, childAccount1),
    lib.signInnerBatch(Tx, childAccount2),
  ],
})

// console.log(Tx)

const signed = lib.sign(Tx, parentAccount);

console.log('Signature by inner signers')
console.log(signed.txJson.BatchSigners)

console.log('Signed TX blob (submit: tx_blob)')
console.log(signed.signedTransaction)
