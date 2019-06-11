export type Algorithms = "ed25519" | "secp256k1";

export enum AccountTypes {
  Passphrase = "passphrase",
  FamilySeed = "familySeed",
  Mnemonic = "mnemonic",
  Hex = "hex"
}

export type KeyPair = {
  algorithm?: Algorithms | null;
  publicKey?: string | null;
  privateKey: string | null;
};
