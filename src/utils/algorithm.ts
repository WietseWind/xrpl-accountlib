"use strict";

/**
 * Shared `algorithm` option handling. Accepts any casing / surrounding
 * whitespace ("ED25519", " Ed25519 ", ...) and only throws if the value is
 * really something else: silently falling back to another algorithm than the
 * caller asked for would derive a different (funded) account.
 *
 * Keep this module free of runtime imports from other project modules: it is
 * used by low level modules (schema/Account) that must stay require-cycle free.
 */

import type { Algorithms } from "../schema/Account";

const ALGORITHMS: Algorithms[] = ["ed25519", "secp256k1"];

function normalizeAlgorithm(
  algorithm: unknown,
  fallback: Algorithms
): Algorithms;
function normalizeAlgorithm(
  algorithm: unknown,
  fallback?: undefined
): Algorithms | undefined;
function normalizeAlgorithm(
  algorithm: unknown,
  fallback?: Algorithms
): Algorithms | undefined {
  if (
    typeof algorithm === "undefined" ||
    algorithm === null ||
    algorithm === ""
  ) {
    // Not specified
    return fallback;
  }

  const normalized =
    typeof algorithm === "string" ? algorithm.trim().toLowerCase() : algorithm;

  const match = ALGORITHMS.find((a) => a === normalized);

  if (!match) {
    throw new Error(
      "Invalid algorithm: " +
        JSON.stringify(algorithm) +
        ", expecting 'ed25519' or 'secp256k1' (default)"
    );
  }

  return match;
}

export { normalizeAlgorithm, ALGORITHMS };
