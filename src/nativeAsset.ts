/**
 * xrpl-binary-codec-prerelease exports nativeAsset from the package root as a
 * getter. Metro/Hermes CJS interop can leave that getter returning undefined,
 * so sign() / rawSigning.prepare() crash on nativeAsset.set().
 *
 * Resolve the real singleton (same object the codec uses for Amount encoding)
 * and re-attach it onto the package root so both internal signing and the
 * public nativeAsset.set() API work.
 */

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

const tryRequire = (specifier: string): any => {
  try {
    return require(specifier);
  } catch {
    return undefined;
  }
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

export const getNativeAsset = (): NativeAssetHandle => {
  const codec = tryRequire("xrpl-binary-codec-prerelease");
  const fromCodec =
    asHandle(codec?.nativeAsset) || asHandle(codec?.default?.nativeAsset);
  if (fromCodec) {
    return fromCodec;
  }

  const nativeMod =
    tryRequire("xrpl-binary-codec-prerelease/dist/nativeasset.js") ||
    tryRequire("xrpl-binary-codec-prerelease/dist/nativeasset");
  const fromFile =
    asHandle(nativeMod?.nativeAsset) ||
    asHandle(nativeMod?.default?.nativeAsset);

  if (!fromFile) {
    throw new Error(
      "xrpl-accountlib: xrpl-binary-codec-prerelease nativeAsset is unavailable",
    );
  }

  attachNativeAsset(codec, fromFile);
  attachNativeAsset(nativeMod, fromFile);
  return fromFile;
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
