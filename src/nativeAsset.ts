/**
 * xrpl-binary-codec-prerelease exports nativeAsset from the package root as a
 * getter. Metro/Hermes CJS interop can leave that getter returning undefined,
 * so sign() / rawSigning.prepare() crash on nativeAsset.set().
 *
 * Load the codec's nativeasset module with a static import so Metro bundles
 * the same singleton encode() uses, then re-attach it onto the package root.
 */

import * as Codec from "xrpl-binary-codec-prerelease";
import * as CodecNative from "xrpl-binary-codec-prerelease/dist/nativeasset";

type NativeAssetHandle = {
  set: (asset: string) => void;
  get: () => string;
};

const asHandle = (value: unknown): NativeAssetHandle | undefined => {
  if (
    value &&
    typeof (value as NativeAssetHandle).set === "function" &&
    typeof (value as NativeAssetHandle).get === "function"
  ) {
    return value as NativeAssetHandle;
  }
  return undefined;
};

const attachNativeAsset = (mod: any, instance: NativeAssetHandle): void => {
  if (!mod || (typeof mod !== "object" && typeof mod !== "function")) {
    return;
  }

  try {
    Object.defineProperty(mod, "nativeAsset", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: instance,
    });
  } catch {
    try {
      mod.nativeAsset = instance;
    } catch {
      // getter-only and frozen
    }
  }

  if (mod.default && mod.default !== mod) {
    attachNativeAsset(mod.default, instance);
  }
};

const readFromNamespace = (mod: any): NativeAssetHandle | undefined => {
  return asHandle(mod?.nativeAsset) || asHandle(mod?.default?.nativeAsset);
};

export const getNativeAsset = (): NativeAssetHandle => {
  let instance =
    readFromNamespace(CodecNative) || readFromNamespace(Codec);

  if (!instance) {
    try {
      instance = readFromNamespace(require("xrpl-binary-codec-prerelease"));
    } catch {
      //
    }
  }

  if (!instance) {
    try {
      instance =
        readFromNamespace(
          require("xrpl-binary-codec-prerelease/dist/nativeasset.js"),
        ) ||
        readFromNamespace(
          require("xrpl-binary-codec-prerelease/dist/nativeasset"),
        );
    } catch {
      //
    }
  }

  if (!instance) {
    throw new Error(
      "xrpl-accountlib: xrpl-binary-codec-prerelease nativeAsset is unavailable",
    );
  }

  attachNativeAsset(Codec, instance);
  attachNativeAsset(CodecNative, instance);
  try {
    attachNativeAsset(require("xrpl-binary-codec-prerelease"), instance);
  } catch {
    //
  }

  return instance;
};

/**
 * Public setter/getter used by consumers (`nativeAsset.set("XAH")`).
 * Lazy so a broken package-root getter is repaired on first use.
 */
export const nativeAsset: NativeAssetHandle = {
  set(asset: string) {
    getNativeAsset().set(asset);
  },
  get() {
    return getNativeAsset().get();
  },
};

export const setNativeAsset = (Tx: any): void => {
  const asset = getNativeAsset();
  asset.set("XRP");

  // Xahau Mainnet, Xahau Testnet
  if ([21337, 21338].indexOf(Tx?.NetworkID) > -1) {
    asset.set("XAH");
  }
};
