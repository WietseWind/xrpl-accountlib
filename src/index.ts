/* Methods ================================================================== */
import * as generate from "./generate";
import * as derive from "./derive";
import * as utils from "./utils";
import { sign, signAndSubmit } from "./sign";
import * as rawSigning from "./rawSigning";

/* Types ==================================================================== */
import XRPL_Account from "./schema/Account";

/* Client =================================================================== */
import { XrplClient } from "xrpl-client";

/* All Libs ================================================================= */
import * as rippleAddressCodec from "ripple-address-codec";
import * as rippleKeypairs from "ripple-keypairs";
import * as rippleSecretCodec from "ripple-secret-codec";
import * as xrplBinaryCodecPrerelease from "xrpl-binary-codec-prerelease";
import * as xrplClient from "xrpl-client";
import * as xrplSecretNumbers from "xrpl-secret-numbers";
import * as xrplSign from "xrpl-sign-keypairs";

/* Defs ===================================================================== */
import {
  XrplDefinitions,
  encode,
  decode,
  encodeForSigning,
  encodeForMultisigning,
  encodeForSigningClaim,
  nativeAsset,
} from "xrpl-binary-codec-prerelease";
import { type DefinitionsData } from "xrpl-binary-codec-prerelease/dist/enums/xrpl-definitions-base";

const binary = {
  encode,
  decode,
  encodeForSigning,
  encodeForMultisigning,
  encodeForSigningClaim,
};

const libraries = {
  rippleAddressCodec,
  rippleKeypairs,
  rippleSecretCodec,
  xrplBinaryCodecPrerelease,
  rippleBinaryCodec: xrplBinaryCodecPrerelease,
  xrplClient,
  xrplSecretNumbers,
  xrplSign,
};

/* Export ==================================================================== */
export {
  XRPL_Account,
  generate,
  derive,
  sign,
  signAndSubmit,
  utils,
  rawSigning,
  XrplDefinitions,
  binary,
  XrplClient,
  nativeAsset,
  libraries,
};

export type { DefinitionsData };
