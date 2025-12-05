// ++  ob
//
// See arvo/sys/hoon.hoon.
import { muk } from "./muk";
import type { Number } from "./types";
// Constants using bigint literals
const ux_1_0000 = 0x10000n;
const ux_ffff_ffff = 0xffffffffn;
const ux_1_0000_0000 = 0x100000000n;
const ux_ffff_ffff_ffff_ffff = 0xffffffffffffffffn;
const ux_ffff_ffff_0000_0000 = 0xffffffff00000000n;

const u_65535 = 65535n;
const u_65536 = 65536n;

// Make sure muk is refactored to handle bigint
// a PRF for j in { 0, .., 3 }
const F = (j: number, arg: bigint): bigint => {
  // raku elements are numbers, but muk needs to handle bigint if arg is bigint
  const raku = [0xb76d5eed, 0xee281300, 0x85bcae01, 0x4b387af7];

  // muk must be refactored to accept its third argument as bigint and return bigint
  return muk(raku[j]!, 2, arg);
};

/**
 * Conceal structure v3.
 *
 */
const fein = (arg: Number): bigint => {
  const loop = (pyn: bigint): bigint => {
    // Replace .and() with &
    const lo = pyn & ux_ffff_ffff;
    // Replace .and() with &
    const hi = pyn & ux_ffff_ffff_0000_0000;

    // Replace .gte(), .lte() with >=, <=
    // Replace .add() with +
    // Replace .sub() with -
    // Replace .or() with |
    return pyn >= ux_1_0000 && pyn <= ux_ffff_ffff
      ? ux_1_0000 + feis(pyn - ux_1_0000)
      : pyn >= ux_1_0000_0000 && pyn <= ux_ffff_ffff_ffff_ffff
        ? hi | loop(lo)
        : pyn;
  };

  // Replace new bigint(arg) with BigInt(arg)
  return loop(BigInt(arg));
};

/**
 * Restore structure v3.
 *
 */
const fynd = (arg: Number): bigint => {
  const loop = (cry: bigint): bigint => {
    // Replace .and() with &
    const lo = cry & ux_ffff_ffff;
    // Replace .and() with &
    const hi = cry & ux_ffff_ffff_0000_0000;

    // Replace .gte(), .lte() with >=, <=
    // Replace .add() with +
    // Replace .sub() with -
    // Replace .or() with |
    return cry >= ux_1_0000 && cry <= ux_ffff_ffff
      ? ux_1_0000 + tail(cry - ux_1_0000)
      : cry >= ux_1_0000_0000 && cry <= ux_ffff_ffff_ffff_ffff
        ? hi | loop(lo)
        : cry;
  };

  // Replace new bigint(arg) with BigInt(arg)
  return loop(BigInt(arg));
};

/**
 * Generalised Feistel cipher.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param  {String, Number, bigint}
 * @return  {bigint}
 */
// Replace new bigint(arg) with BigInt(arg)
const feis = (arg: Number): bigint =>
  Fe(4, u_65535, u_65536, ux_ffff_ffff, F, BigInt(arg));

const Fe = (
  r: number,
  a: bigint,
  b: bigint,
  k: bigint,
  f: typeof F,
  m: bigint,
): bigint => {
  const c = fe(r, a, b, f, m);
  // Replace .lt() with <
  return c < k ? c : fe(r, a, b, f, c);
};

const fe = (r: number, a: bigint, b: bigint, f: typeof F, m: bigint) => {
  const loop = (j: number, ell: bigint, arr: bigint): bigint => {
    if (j > r) {
      // Replace .mul(), .add() with *, +
      // Replace .eq() with ===
      return r % 2 !== 0
        ? a * arr + ell
        : arr === a
          ? a * arr + ell
          : a * ell + arr;
    } else {
      const eff = f(j - 1, arr); // f is expected to return bigint

      // Replace .add() with +
      // Replace .mod() with %
      const tmp = j % 2 !== 0 ? (ell + eff) % a : (ell + eff) % b;

      return loop(j + 1, arr, tmp);
    }
  };

  // Replace .mod(), .div() with %, /
  const L = m % a;
  const R = m / a; // bigint division is integer division

  return loop(1, L, R);
};

/**
 * Reverse 'feis'.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param {Number, String, bigint}  arg
 * @return  {bigint}
 */
// Replace new bigint(arg) with BigInt(arg)
const tail = (arg: Number): bigint =>
  Fen(4, u_65535, u_65536, ux_ffff_ffff, F, BigInt(arg));

const Fen = (
  r: number,
  a: bigint,
  b: bigint,
  k: bigint,
  f: typeof F,
  m: bigint,
): bigint => {
  const c = fen(r, a, b, f, m);
  // Replace .lt() with <
  return c < k ? c : fen(r, a, b, f, c);
};

const fen = (r: number, a: bigint, b: bigint, f: typeof F, m: bigint) => {
  const loop = (j: number, ell: bigint, arr: bigint): bigint => {
    if (j < 1) {
      // Replace .mul(), .add() with *, +
      return a * arr + ell;
    } else {
      const eff = f(j - 1, ell); // f is expected to return bigint

      // NB (jtobin):
      //
      // Slight deviation from B&R (2002) here to prevent negative values.  We
      // add 'a' or 'b' to arr as appropriate and reduce 'eff' modulo the same
      // number before performing subtraction.
      //
      // Replace .add(), .sub(), .mod() with +, -, %
      const tmp =
        j % 2 !== 0 ? (arr + a - (eff % a)) % a : (arr + b - (eff % b)) % b;

      return loop(j - 1, tmp, ell);
    }
  };

  // Replace .div(), .mod() with /, %
  const ahh = r % 2 !== 0 ? m / a : m % a;

  const ale = r % 2 !== 0 ? m % a : m / a;

  // Replace .eq() with ===
  const L = ale === a ? ahh : ale;

  // Replace .eq() with ===
  const R = ale === a ? ale : ahh;

  return loop(r, L, R);
};

export const ob = {
  F,

  fe,
  Fe,
  feis,
  fein,

  fen,
  Fen,
  tail,
  fynd,
};
