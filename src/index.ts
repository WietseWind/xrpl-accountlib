/* Methods  ==================================================================== */
import * as generate from "./generate";
import * as derive from "./derive";
import * as utils from "./utils";
import sign from "./sign";
import * as rawSigning from "./rawSigning";

/* Types ==================================================================== */
import XRPL_Account from "./schema/Account";

/* Defs ==================================================================== */
import {
  XrplDefinitions,
  encode,
  decode,
  encodeForSigning,
  encodeForMultisigning,
  encodeForSigningClaim,
} from "ripple-binary-codec";
import { type DefinitionsData } from "ripple-binary-codec/dist/enums/xrpl-definitions-base";

const binary = {
  encode,
  decode,
  encodeForSigning,
  encodeForMultisigning,
  encodeForSigningClaim,
}

/* Export ==================================================================== */
export {
  XRPL_Account,
  generate,
  derive,
  sign,
  utils,
  rawSigning,
  XrplDefinitions,
  binary,
};

export type { DefinitionsData };
