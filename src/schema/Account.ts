import Keypairs from "ripple-keypairs";
import AddressCodec from "ripple-address-codec";
import * as Elliptic from "elliptic";
import * as Utils from "../utils";

const Ed25519 = new Elliptic.eddsa("ed25519");
const Secp256k1 = new Elliptic.ec("secp256k1");

/* Types ==================================================================== */

export enum AccountTypes {
  Passphrase = "passphrase",
  FamilySeed = "familySeed",
  Mnemonic = "mnemonic",
  Hex = "hex",
  SecretNumbers = "secretNumbers"
}

export type KeyPair = {
  algorithm?: Algorithms | null;
  publicKey?: string | null;
  privateKey: string | null;
};

export type Algorithms = "ed25519" | "secp256k1";

export interface AccountOptions {
  accountType?: AccountTypes;
  address?: string;
  passphrase?: string;
  familySeed?: string;
  secretNumbers?: string[];
  mnemonic?: string;
  path?: string;
  keypair?: KeyPair;
  algorithm?: Algorithms;
}

/* Class ==================================================================== */

export default class XRPL_Account {
  public accountType: AccountTypes | null;
  public address: string | null;
  public secret: {
    familySeed: string | null;
    mnemonic: string | null;
    passphrase: string | null;
    path: string | null;
    secretNumbers: string[] | null;
  };
  public keypair: KeyPair;
  public _signAs?: any;

  constructor(options: AccountOptions = {}) {
    /**
     * Define object struct
     */
    this.accountType = null;
    this.address = null;
    this.secret = {
      familySeed: null,
      mnemonic: null,
      passphrase: null,
      path: null,
      secretNumbers: null
    };
    this.keypair = {
      algorithm: null,
      publicKey: null,
      privateKey: null
    };

    /**
     * Check & apply address
     */
    if (options.address) {
      if (AddressCodec.isValidAddress(options.address)) {
        this.address = options.address;
      }
    }

    /**
     * Check & apply account type [familySeed / mnemonic / passphrase]
     */
    if (options.passphrase) {
      this.accountType = AccountTypes.Passphrase;
      this.secret.passphrase = options.passphrase;
    }
    if (options.familySeed) {
      this.accountType = AccountTypes.FamilySeed;
      this.secret.familySeed = options.familySeed;

      if (options.secretNumbers) {
        this.secret.secretNumbers = options.secretNumbers;
        this.accountType = AccountTypes.SecretNumbers;
      }
    } else if (options.mnemonic) {
      this.accountType = AccountTypes.Mnemonic;
      this.secret.mnemonic = options.mnemonic;
      if (options.path) {
        this.secret.path = options.path;
      }
    }

    /**
     * Check & apply keypair, derive publicKey if only privateKey is known
     */
    if (options.keypair && options.keypair instanceof Object) {
      if (options.keypair.privateKey) {
        let prefix = "";
        if (options.keypair.privateKey.length === 64) {
          prefix = "00";
        }
        this.keypair.privateKey = prefix + options.keypair.privateKey;

        if (this.accountType === null) {
          this.accountType = AccountTypes.Hex;
        }
      }
      if (options.keypair.publicKey) {
        this.keypair.publicKey = options.keypair.publicKey;
      } else if (this.keypair.privateKey) {
        if (
          // @ts-ignore
          options.keypair.privateKey.slice(0, 2) === "ED" ||
          (options.algorithm && options.algorithm === "ed25519")
        ) {
          const priv = this.keypair.privateKey.slice(2);
          // @ts-ignore
          const keyBytes = Ed25519.keyFromSecret(priv).pubBytes();
          this.keypair.publicKey = "ED" + Utils.bytesToHex(keyBytes);
        } else {
          const priv = this.keypair.privateKey.slice(2);
          const keyBytes = Secp256k1.keyFromPrivate(priv)
            .getPublic()
            .encodeCompressed("array");
          // @ts-ignore
          this.keypair.publicKey = Utils.bytesToHex(keyBytes);
        }
      }
    }

    /**
     * Check & apply algorithm, or retrieve from private key
     */
    if (options.algorithm) {
      this.keypair.algorithm = options.algorithm;
    } else {
      if (this.keypair.privateKey) {
        this.keypair.algorithm = Utils.getAlgorithmFromKey(
          this.keypair.privateKey
        );
      }
    }

    /**
     * Derive address from publicKey if address unknown
     */
    if (this.address === null && this.keypair.publicKey) {
      this.address = Keypairs.deriveAddress(this.keypair.publicKey);
    }
  }

  signAs(address: string) {
    if (AddressCodec.isValidAddress(address)) {
      this._signAs = address;
    } else {
      throw new Error(
        "Invalid signAs address (should contain account address, rXXX...)"
      );
    }

    return this;
  }

  toString() {
    return "XPRL Account" + (this.address ? ": " + this.address : "");
  }
}
