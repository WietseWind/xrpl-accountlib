# XRPL-AccountLib

> XRPL Account helper: generation, derivation and signing.

#### Todo

  - MultiSig
  - Possible: 
    - TX decoding (sign output to object)

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

## Methods

## Generate account `lib.generate`

All `generate` methods return an `XRPL_Account` object.

### Family Seed `lib.generate.familySeed(options)`

Options:
	
- **algorithm**  
  Default: 'secp256k1', alternatively: 'ed25519'


### Mnemonic `lib.generate.mnemonic(options)`

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

### Family Seed `lib.derive.familySeed(options)`

	Options:
	
	- XXXX. Default: `XX`, some info on this option
	- XXXX. Default: `XX`, some info on this option


### Mnemonic `lib.derive.mnemonic(options)`

	Options:
	
	- XXXX. Default: `XX`, some info on this option
	- XXXX. Default: `XX`, some info on this option


### Passphrase `lib.derive.passphrase(options)`

	Options:
	
	- XXXX. Default: `XX`, some info on this option
	- XXXX. Default: `XX`, some info on this option


## Sign `lib.sign(XRPL_Account{}, options)`

The first argument of the `sign`-method should be an `XRPL_Account` object, returned by either 
the `generate` or `derive` methods.

	Options:
	
	- XXXX. Default: `XX`, some info on this option
	- XXXX. Default: `XX`, some info on this option