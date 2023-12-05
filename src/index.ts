/* Methods  ==================================================================== */
import * as generate from "./generate";
import * as derive from "./derive";
import * as utils from "./utils";
import { sign, signAndSubmit } from "./sign";
import * as rawSigning from "./rawSigning";

/* Types ==================================================================== */
import XRPL_Account from "./schema/Account";

/* Client ==================================================================== */
import { XrplClient } from "xrpl-client";

/* Defs ==================================================================== */
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
};

export type { DefinitionsData };
