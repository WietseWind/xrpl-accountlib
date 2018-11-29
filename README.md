# XRPL-AccountLib

> XRPL Account helper: generation, derivation and signing.

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

### Mnemonic `lib.derive.mnemonic(mnemonic'', options{})`

The _ mnemonic_ argument is required, and should contain a string with a valid word list, like: `state green stem tower...`

Options:
	
- **passphrase**  
  Default: (none), alternatively: 'my secret passsword'


### Passphrase `lib.derive.passphrase(passphrase'')`

Derive from a passphrase, like `masterpassphrase`

### Private Key `lib.derive.privatekey(hex'')`

Derive from a 66 char HEX private key, like `001ACAAEDECE405B2A958212629E16F2EB46B153EEE94CDD350FDEFF52795525B7`

## Sign `lib.sign(Transaction{}, XRPL_Account{}/[{}])`

The first argument of the `sign`-method should be a Transaction object, the second argument can either contain one `XRPL_Account` object (returned by either 
the `generate` or `derive` methods) or an array with multiple `XRPL_Account` object**s** (multiSign).

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