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
import DEFAULT_DEFINITIONS from 'xrpl-binary-codec-prerelease/dist/enums/definitions.json';
import { type DefinitionsData } from "xrpl-binary-codec-prerelease/dist/enums/xrpl-definitions-base";

const binary = {
  encode,
  decode,
  encodeForSigning,
  encodeForMultisigning,
  encodeForSigningClaim,
  DEFAULT_DEFINITIONS
};

const libraries: {
      rippleAddressCodec: typeof rippleAddressCodec,
    rippleKeypairs: typeof rippleKeypairs,
    rippleSecretCodec: typeof rippleSecretCodec,
    xrplBinaryCodecPrerelease: typeof xrplBinaryCodecPrerelease
    rippleBinaryCodec: typeof xrplBinaryCodecPrerelease
} = {
  rippleAddressCodec,
  rippleKeypairs,
  rippleSecretCodec,
  xrplBinaryCodecPrerelease,
  rippleBinaryCodec: xrplBinaryCodecPrerelease,
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
