declare module "ripple-keypairs" {
  export interface RippleKeypair {
    privateKey: string;
    publicKey: string;
  }

  export const deriveKeypair: (
    seed: string,
    options?: {
      entropy: string;
    }
  ) => RippleKeypair;

  export const deriveAddress: (publicKey: string) => string;

  export const generateSeed: (options?: { algorithm: string }) => string;
}
