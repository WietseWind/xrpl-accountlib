# XRPL-AccountLib [![npm version](https://badge.fury.io/js/xrpl-accountlib.svg)](https://www.npmjs.com/xrpl-accountlib) ![NodeJS](https://github.com/WietseWind/xrpl-accountlib/workflows/NodeJS/badge.svg)

> XRPL Account helper: generation, derivation and signing.

## Getting started

```
npm install --save xrpl-accountlib
```

### Use in the browser

You can get a [prebuilt](https://cdn.jsdelivr.net/npm/xrpl-accountlib/dist/browser.js) / [prebuilt & minified](https://cdn.jsdelivr.net/npm/xrpl-accountlib/dist/browser.min.js) version from Github / CDNJS [![CDNJS Browserified](https://img.shields.io/badge/cdnjs-browserified-blue)](https://cdn.jsdelivr.net/npm/xrpl-accountlib/dist/browser.js) [![CDNJS Browserified Minified](https://img.shields.io/badge/cdnjs-minified-orange)](https://cdn.jsdelivr.net/npm/xrpl-accountlib/dist/browser.min.js)

Sample: [https://jsfiddle.net/WietseWind/gkefpnu0/](https://jsfiddle.net/WietseWind/gkefpnu0/)

### A note on signing vs. connectivity

Please note: this lib primarily provides signing and derivation capabilities. To connect to the XRPL and submit transactions, please take a look at `xrpl-client`.

[Here's an example](https://gist.github.com/WietseWind/557a5c11fa0d474468e8c9c54e3e5b93) on how these two libs can work together (manually).

#### 🎉 **HOWEVER**... Since version 2.1.0 this lib. bundles `xrpl-client` as well, and comes with helpers to prepare transactions & submit transactions 🎉

The bundled `xrpl-client` instance & behaviour is **network definitions aware**, meaning it will dynamically load definitions from supporting networks, like [Hooks](https://hooks.xrpl.org) enabled networks.

- `utils.accountAndLedgerSequence(wss, account)` (async) can be used to get values required to prepare a transaction:
  - The first param. takes either an instance of `xrpl-client` or a string containing a WebSocket node endpoint. In case of a string (endpoint) a connection will be created & closed automatically.
  - The second param. takes either an account address (string, r...) or an `XRPL_Account` object (see below).
  - The output contains ready to use params. in the `txValues` property. The given `LastLedgerSequence` is the current ledger index + 20.
- `signAndSubmit(tx, wss, account)` (async) can be used to sign a transaction & submit it to the network provided:
  - The first param contains the TX Json, complete or completed by the `accountAndLedgerSequence` method `txValues`
  - The second param. takes either an account address (string, r...) or an `XRPL_Account` object (see below).
  - The third param takes an `XRPL_Account` object (see below). An account 'r-address' string can't be used here as a keypair needs to be present to sign.

A sample can be viewed here:
https://github.com/WietseWind/xrpl-accountlib/blob/master/samples/sign-and-submit.mjs

## The XRPL_Account object

Both the `generate` and the `derive` methods will return an `XRPL_Account` object, containing all information to sign:

```
{
  accountType: '...',
  address: 'rXXXXXXXXX...',
  secret:
   { familySeed: 'rYYYYYYYYY...',
     mnemonic: 'word word word...',
     passphrase: 'Hello World! ...',
     path: 'm/44'/144'/X'/Y/Z' },
  keypair:
   { algorithm: 'xxxxxxxx',
     publicKey: 'AABBCC001122...',
     privateKey: 'CCDDEE332211...' } }

```

All `XRPL_Account` objects allow calling the `signAs` method to set the `signAs` user for MultiSign transactions (when a MultiSign user also uses a RegularKey);

```
derive
  .familySeed('snYHBZDJ51PPSuzWYVhEh1kb9zvEU')
  .signAs('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY')
```

## Methods

## Generate account `lib.generate`

All `generate` methods return an `XRPL_Account` object.

Samples: https://github.com/WietseWind/xrpl-accountlib/blob/master/samples/generate.js

### Family Seed `lib.generate.familySeed(options{})`

Options:

- **algorithm**  
  Default: 'secp256k1', alternatively: 'ed25519'

### Secret Numbers `lib.generate.secretNumbers()`

See:

- [https://www.npmjs.com/xrpl-secret-numbers](https://www.npmjs.com/xrpl-secret-numbers)
- [https://github.com/WietseWind/xrpl-secret-numbers](https://github.com/WietseWind/xrpl-secret-numbers)

### Mnemonic `lib.generate.mnemonic(options{})`

Options:

- **passphrase**  
  Default: (none), alternatively: 'my secret passsword'
- **strength**  
  Default: 256 (24 words), alternatively: 128 (12 words)
- **accountPath**  
  Default: 0, alternatively: X in the derivation path: m/44'/144'/X'/Y/Z
- **changePath**  
  Default: 0, alternatively: Y in the derivation path: m/44'/144'/X'/Y/Z
- **addressIndex**  
  Default: 0, alternatively: Z in the derivation path: m/44'/144'/X'/Y/Z
- **wordlist**  
  Default: 'english', alternatively one of:
  - chinese_simplified
  - chinese_traditional
  - french
  - italian
  - japanese
  - korean
  - spanish
  - english

## Derive account `lib.derive`

All `derive` methods return an `XRPL_Account` object.

Samples: https://github.com/WietseWind/xrpl-accountlib/blob/master/samples/derive.js

### Family Seed `lib.derive.familySeed(familyseed'')`

The _familyseed_ argument is required, and should contain a string, like: `sXXXXXXXXX...`

### Secret Numbers `lib.derive.secretNumbers(secretNumbers''|[], acceptWithoutChecksum?:false)`

The _secretNumbers_ argument is required, and should contain a string, like: `012345 123456 ...` or an array containing **8** elements of the type **string** containing **6 digits**.

### Mnemonic `lib.derive.mnemonic(mnemonic'', options{})`

The _ mnemonic_ argument is required, and should contain a string with a valid word list, like: `state green stem tower...`

Options:

- **passphrase**  
  Default: (none), alternatively: 'my secret passsword'
- **accountPath**  
  Default: (0), alternatively: any integer
- **changePath**  
  Default: (0), alternatively: any integer
- **addressIndex**  
  Default: (0), alternatively: any integer

### Passphrase `lib.derive.passphrase(passphrase'')`

Derive from a passphrase, like `masterpassphrase`

### Private Key `lib.derive.privatekey(hex'')`

Derive from a 66 char HEX private key, like `001ACAAEDECE405B2A958212629E16F2EB46B153EEE94CDD350FDEFF52795525B7`

## Sign `lib.sign(Transaction{}, XRPL_Account{}/[{}])`

The first argument of the `sign`-method should be a Transaction object, the second argument can either contain one `XRPL_Account` object (returned by either
the `generate` or `derive` methods) or an array with multiple `XRPL_Account` object**s** (multiSign).

When combining previously signed MultiSign transactions as HEX blob, the second argument can also be an array with `{ signedTransaction: '...' }` objects (or an array of strings with the HEX blob).

### Samples

https://github.com/WietseWind/xrpl-accountlib/blob/master/samples/sign.js

#### Signing with one account:

```
lib.sign(Tx, lib.derive.familySeed('shqNUmrgnkBmK9iCijrtid2Ua4uHd'))
```

### MultiSign

```
lib.sign(Tx, [
  lib.derive.familySeed('sp5mkm12oJj3t8fFRiaMNrDbc73N2'),
  lib.derive.familySeed('snYHBZDJ51PPSuzWYVhEh1kb9zvEU')
])
```

If you want to sign a single transaction that will be part of a MultiSigned transaction (combined later on) it's mandatory to specify the `signAs` account (with the chained (`signAs( .. )` method). The output (signed transaction blob, hex) signed by multiple accounts can then be combined later on:

#### Sign a MultiSign transaction to combine later

```
lib.sign(
  Tx,
  lib.derive.familySeed('sp5mkm12oJj3t8XXXXXXXXXXXXXXX')
  	 .signAs('r9yzFismdTTWzc6Ea3mJr9by26QaFrFHP7')
)
```

#### Combine multiple signed HEX MultiSign transactions

```
const Tx = lib.sign([
   { signedTransaction: '120000240000000B2E000001EF614000000002FAF0806840000000000003E873008114723F34B08C70F3EF8759B1A2CD4934D434A3C2518314628891E80B72684CF065A0AE8EC3482472C1C0DCF3E010732103AC651208BDA639C7AEC10873771A5B5F1A2008CAB3B2155871EE16A966D5860774473045022100CD9BC97047BF8EE0AF2D7631540FFF4C5FFE863AFAA9E2DE7AD98156F3323CF9022031D0454947833536028029FB9B61B224F4C2BFC1D1F670C49880AD004A76315C8114723F34B08C70F3EF8759B1A2CD4934D434A3C251E1F1' },
   { signedTransaction: '12000024000000042E000001EF614000000007F81ED96840000000000003E873008114F84E8A80D08854F3621F9214D58F04D41A07EE108314F40B468D5AC0DBA36E2941877AC2E9BBD48262A1F3E010732103CA9799516799A1139BED8958A9FDD0033389396422B888A7E56FB9991B0A179E74473045022100B22D6874CC4ECC92D32E657A1F863245A4DB1B425260052A9427616BE397D244022023CA82B76ADD26909549381C5CCB7BB09084936B294577299F5796A22F5AC39E8114F40B468D5AC0DBA36E2941877AC2E9BBD48262A1E1F1' }
])
```

You can also pass the signed HEX blob as an array with strings.

## Hooks Helpers

To obtain network information, fetch Hooks fees, etc. there are some helpers present in the `utils` object.

To prevent new connections from being setup all the time, you can connect a pre-constructed XrplClient class.

#### Get Account & Ledger sequences & TX network values

```javascript
utils.txNetworkAndAccountValues(
  client: XrplClient | string,
  account: string | Account
)
```

Returns:

```javascript
{
  networkInfo: {
    ledgerSequence: 4782267,
    accountSequence: 4404168,
    endpoint: 'wss://hooks-testnet-v3.xrpl-labs.com/',
    networkId: 21338,
    features: { hooks: true }
  },
  txValues: {
    Account: 'rDUsh2K9rFeEZNU24zyjHD61ceeDwspFAU',
    NetworkID: 21338,
    Sequence: 4404168,
    LastLedgerSequence: 4782287,
    Fee: '0'
  }
}
```
  
#### Get network information

If you are obtaining network information and passing a string as client, a connection
will be created for you. If you want to keep the connection alive for further communcation,
pass `keepCreatedConnectionAlive` as true, and fetch the `XrplClient` connection from the
`connection` return property.

```javascript
utils.networkInfo(
  client: XrplClient | string,
  keepCreatedConnectionAlive = false
)
```

Returns:

```javascript
  endpoint: string,
  networkId: number,
  ledgerSequence: number,
  ledger: number,
  amendments: string[],
  features: {
    hooks: boolean,
  },
  connection: XrplClient,
```

#### Get network fee & network Fee based on Hooks on accounts

```javascript
utils.networkTxFee(
  client: XrplClient | string,
  tx?: string | Object,
  keepCreatedConnectionAlive = false
)
```

Returns (string in drops):

```javascript
13371337
```
