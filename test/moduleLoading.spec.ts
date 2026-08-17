/**
 * Regression: require cycles (utils -> sign/derive -> utils, sign -> index ->
 * sign) used to leave modules partially initialized when a submodule was
 * required before the package root, eg.:
 *
 *   require("xrpl-accountlib/dist/derive/mnemonic")   // first require
 *   require("xrpl-accountlib").derive.mnemonic        // undefined!
 *
 * Every public module must be requirable FIRST, with the package root fully
 * populated afterwards. jest.isolateModules gives every scenario a fresh
 * module registry, so require order matches a fresh Node process.
 */

const MODULES = [
  "../src/index",
  "../src/schema/Account",
  "../src/derive/index",
  "../src/derive/mnemonic",
  "../src/derive/familySeed",
  "../src/derive/secretNumbers",
  "../src/derive/privatekey",
  "../src/derive/passphrase",
  "../src/generate/index",
  "../src/generate/mnemonic",
  "../src/generate/familySeed",
  "../src/generate/secretNumbers",
  "../src/sign/index",
  "../src/rawSigning/index",
  "../src/utils/index",
  "../src/utils/mnemonicKeypair",
  "../src/utils/slip10",
  "../src/utils/algorithm",
];

const expectFullRootApi = (lib: any) => {
  expect(typeof lib.derive.mnemonic).toBe("function");
  expect(typeof lib.derive.familySeed).toBe("function");
  expect(typeof lib.derive.secretNumbers).toBe("function");
  expect(typeof lib.derive.privatekey).toBe("function");
  expect(typeof lib.derive.passphrase).toBe("function");
  expect(typeof lib.generate.mnemonic).toBe("function");
  expect(typeof lib.generate.familySeed).toBe("function");
  expect(typeof lib.generate.secretNumbers).toBe("function");
  expect(typeof lib.sign).toBe("function");
  expect(typeof lib.signAndSubmit).toBe("function");
  expect(typeof lib.signInnerBatch).toBe("function");
  expect(typeof lib.utils.getAlgorithmFromKey).toBe("function");
  expect(typeof lib.utils.encodeTransaction).toBe("function");
  expect(typeof lib.utils.combine).toBe("function");
  expect(typeof lib.rawSigning.prepare).toBe("function");
  expect(typeof lib.XRPL_Account).toBe("function");
};

describe("Module loading (require order)", () => {
  MODULES.forEach((mod) => {
    test(`Package intact when ${mod.replace("../src/", "")} is required first`, () => {
      jest.isolateModules(() => {
        const deep = require(mod);
        expect(deep).toBeDefined();

        const lib = require("../src");
        expectFullRootApi(lib);

        // And the loaded graph must actually work end to end
        const account = lib.derive.passphrase("masterpassphrase");
        const signed = lib.sign({ TransactionType: "SignIn" }, account);
        expect(typeof signed.signedTransaction).toBe("string");
        expect(signed.signedTransaction.length).toBeGreaterThan(0);
      });
    });
  });
});
