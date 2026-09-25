// ++  co
//
// See arvo/sys/hoon.hoon.
import { ob } from "./ob";
import type { Iterable, PatP, PatQ, Rank } from "./types";

// Simple replacements for lodash functions
const chunk = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const isEqual = (a: any, b: any): boolean => {
  // For the use case in this file, we're comparing strings
  // after removeLeadingZeroBytes, so simple equality should work
  return a === b;
};

// Constants using bigint literals
const zero = 0n;
const one = 1n;
const two = 2n;
const three = 3n;
const four = 4n;
const five = 5n;

const pre = `
dozmarbinwansamlitsighidfidlissogdirwacsabwissib\
rigsoldopmodfoglidhopdardorlorhodfolrintogsilmir\
holpaslacrovlivdalsatlibtabhanticpidtorbolfosdot\
losdilforpilramtirwintadbicdifrocwidbisdasmidlop\
rilnardapmolsanlocnovsitnidtipsicropwitnatpanmin\
ritpodmottamtolsavposnapnopsomfinfonbanmorworsip\
ronnorbotwicsocwatdolmagpicdavbidbaltimtasmallig\
sivtagpadsaldivdactansidfabtarmonranniswolmispal\
lasdismaprabtobrollatlonnodnavfignomnibpagsopral\
bilhaddocridmocpacravripfaltodtiltinhapmicfanpat\
taclabmogsimsonpinlomrictapfirhasbosbatpochactid\
havsaplindibhosdabbitbarracparloddosbortochilmac\
tomdigfilfasmithobharmighinradmashalraglagfadtop\
mophabnilnosmilfopfamdatnoldinhatnacrisfotribhoc\
nimlarfitwalrapsarnalmoslandondanladdovrivbacpol\
laptalpitnambonrostonfodponsovnocsorlavmatmipfip\
`;

const suf = `
zodnecbudwessevpersutletfulpensytdurwepserwylsun\
rypsyxdyrnuphebpeglupdepdysputlughecryttyvsydnex\
lunmeplutseppesdelsulpedtemledtulmetwenbynhexfeb\
pyldulhetmevruttylwydtepbesdexsefwycburderneppur\
rysrebdennutsubpetrulsynregtydsupsemwynrecmegnet\
secmulnymtevwebsummutnyxrextebfushepbenmuswyxsym\
selrucdecwexsyrwetdylmynmesdetbetbeltuxtugmyrpel\
syptermebsetdutdegtexsurfeltudnuxruxrenwytnubmed\
lytdusnebrumtynseglyxpunresredfunrevrefmectedrus\
bexlebduxrynnumpyxrygryxfeptyrtustyclegnemfermer\
tenlusnussyltecmexpubrymtucfyllepdebbermughuttun\
bylsudpemdevlurdefbusbeprunmelpexdytbyttyplevmyl\
wedducfurfexnulluclennerlexrupnedlecrydlydfenwel\
nydhusrelrudneshesfetdesretdunlernyrsebhulryllud\
remlysfynwerrycsugnysnyllyndyndemluxfedsedbecmun\
lyrtesmudnytbyrsenwegfyrmurtelreptegpecnelnevfes\
`;

const patp2syls = (name: string): string[] =>
  name.replace(/[\^~-]/g, "").match(/.{1,3}/g) || [];

const splitAt = (index: number, str: string) => [
  str.slice(0, index),
  str.slice(index),
];

// These regex matches result in string arrays, not bigint/bigint
export const prefixes = pre.match(/.{1,3}/g) as RegExpMatchArray;
export const suffixes = suf.match(/.{1,3}/g) as RegExpMatchArray;

// Replace .pow() with **
const bex = (n: bigint): bigint => two ** n;

// Replace .div() with /
// Replace .mul() with *
const rsh = (a: bigint, b: bigint, c: bigint): bigint => c / bex(bex(a) * b);

const met = (a: bigint, b: bigint, c: bigint = zero): bigint =>
  // Replace .eq() with ===
  // Replace .add() with +
  b === zero ? c : met(a, rsh(a, one, b), c + one);

// Replace .mod() with %
// Replace .mul() with *
const end = (a: bigint, b: bigint, c: bigint) => c % bex(bex(a) * b);

/**
 * Convert a hex-encoded string to a @p-encoded string.
 *
 */
const hex2patp = (hex: string): string => {
  if (hex === null) {
    throw new Error("hex2patp: null input");
  }
  const big = BigInt("0x" + hex);
  return patp(big);
};

/**
 * Convert a @p-encoded string to a hex-encoded string.
 *
 * @param  {String}  name @p
 * @return  {String}
 */
const patp2hex = (name: PatP): string => {
  if (isValidPat(name) === false) {
    throw new Error("patp2hex: not a valid @p");
  }
  const syls = patp2syls(name);

  // This function produces a binary string, then it's converted to bigint
  const syl2bin = (idx: number) => idx.toString(2).padStart(8, "0");

  const addr = syls.reduce(
    (acc, syl, idx) =>
      idx % 2 !== 0 || syls.length === 1
        ? acc + syl2bin(suffixes.indexOf(syl)) // indexOf returns number
        : acc + syl2bin(prefixes.indexOf(syl)), // indexOf returns number
    "",
  );

  // Replace new bigint(addr, 2) with BigInt('0b' + addr)
  const bigint = BigInt("0b" + addr);
  // Assume ob.fynd is refactored to accept and return bigint
  // Replace .toString("hex") with .toString(16)
  const hex = ob.fynd(bigint).toString(16);
  // Pad hex string if length is odd before returning
  return hex.length % 2 !== 0 ? hex.padStart(hex.length + 1, "0") : hex;
};

/**
 * Convert a @p-encoded string to a bignum.
 *
 */
// Replace new bigint(patp2hex(name), "hex") with BigInt('0x' + patp2hex(name))
const patp2bigint = (name: PatP): bigint => BigInt("0x" + patp2hex(name));

/**
 * Convert a @p-encoded string to a decimal-encoded string.
 *
 */
const patp2dec = (name: PatP): string => {
  let bigint;
  try {
    // patp2bigint now returns bigint
    bigint = patp2bigint(name);
  } catch (_) {
    throw new Error("patp2dec: not a valid @p");
  }
  // .toString() works directly on bigint
  return bigint.toString();
};

/**
 * Convert a number to a @q-encoded string.
 *
 */
const patq = (arg: number | bigint | string): string => {
  // Replace new bigint(arg) with BigInt(arg)
  const bigint = BigInt(arg);

  // Replace .toArrayLike(Buffer) with Buffer conversion from hex
  // bigint.toString(16) gives hex. Pad if odd length for Buffer.from.
  const hex = bigint.toString(16);
  const paddedHex = hex.length % 2 !== 0 ? "0" + hex : hex;
  // Handle the zero case specially, as '0'.toString(16) is '0' and Buffer.from('0', 'hex') is empty.
  // new bigint(0).toArrayLike(Buffer) is also empty. So empty buffer for 0n is correct.
  const buf = bigint === 0n ? Buffer.from("") : Buffer.from(paddedHex, "hex");

  return buf2patq(buf);
};

/**
 * Convert a Buffer into a @q-encoded string.
 *
 */
// This function operates on Buffer, no direct bigint/bigint changes needed here,
// but it will now be called with Buffers derived from bigints.
const buf2patq = (buf: Buffer): string => {
  const bytes = [...buf];
  const chunked =
    bytes.length % 2 !== 0 && bytes.length > 1
      ? [[bytes[0]!]].concat(chunk(bytes.slice(1), 2))
      : chunk(bytes, 2);

  // These functions use array lookups based on numbers (byte values), which is correct.
  const prefixName = (byts: number[]) =>
    byts[1] === undefined
      ? prefixes[0] + suffixes[byts[0]!]
      : prefixes[byts[0]!]! + suffixes[byts[1]];

  const name = (byts: number[]) =>
    byts[1] === undefined
      ? suffixes[byts[0]!]
      : prefixes[byts[0]!]! + suffixes[byts[1]];

  const alg = (pair: number[]) =>
    pair.length % 2 !== 0 && chunked.length > 1 ? prefixName(pair) : name(pair);

  return chunked.reduce(
    (acc, elem) => acc + (acc === "~" ? "" : "-") + alg(elem),
    "~",
  );
};

/**
 * Convert a hex-encoded string to a @q-encoded string.
 *
 * Note that this preserves leading zero bytes.
 *
 */
// This function operates on strings and Buffer, no direct bigint/bigint changes needed.
const hex2patq = (arg: string): string => {
  const hex = arg.length % 2 !== 0 ? arg.padStart(arg.length + 1, "0") : arg;

  const buf = Buffer.from(hex, "hex");
  return buf2patq(buf);
};

/**
 * Convert a @q-encoded string to a hex-encoded string.
 *
 * Note that this preserves leading zero bytes.
 *
 */
// This function operates on strings and Buffer, no direct bigint/bigint changes needed.
const patq2hex = (name: PatQ): string => {
  if (isValidPat(name) === false) {
    throw new Error("patq2hex: not a valid @q");
  }
  const chunks = name.slice(1).split("-");
  const dec2hex = (dec: number) => dec.toString(16).padStart(2, "0");

  const splat = chunks.map((chunk) => {
    let syls = splitAt(3, chunk);
    return syls[1] === ""
      ? dec2hex(suffixes.indexOf(syls[0]!)) // indexOf returns number
      : dec2hex(prefixes.indexOf(syls[0]!)) +
          dec2hex(suffixes.indexOf(syls[1]!)); // indexOf returns number
  });

  // Original code returned "00" for empty name. This might be a specific rule.
  // If name="" then chunks=[] and splat=[] and splat.join("")="".
  // Let's keep the explicit "00" return for empty input name as it seems intentional.
  // However, the check is `name.length === 0`, which would mean `~`? `isValidPat` should handle this.
  // Assuming empty string input is invalid based on isValidPat check.
  // If input was `~`, patq2hex("~") would be `chunks = []`, `splat = []`, return "".
  // The original code has `name.length === 0`. Is it possible to call with ""?
  // isValidPat("~") returns true. length is not 0. So `name.length === 0` seems unreachable for valid @q.
  // Reverting to just `splat.join("")` which handles the "~" case resulting in "".
  return splat.join("");
};

/**
 * Convert a @q-encoded string to a bignum.
 *
 */
// Replace new bigint(patq2hex(name), "hex") with BigInt('0x' + patq2hex(name))
const patq2bigint = (name: PatQ): bigint => BigInt("0x" + patq2hex(name));

/**
 * Convert a @q-encoded string to a decimal-encoded string.
 *
 */
const patq2dec = (name: PatQ): string => {
  let bigint;
  try {
    // patq2bigint now returns bigint
    bigint = patq2bigint(name);
  } catch (_) {
    throw new Error("patq2dec: not a valid @q");
  }
  // .toString() works directly on bigint
  return bigint.toString();
};

/**
 * Determine the ship class of a @p value.
 *
 */
const clan = (who: PatP): Rank => {
  let name;
  try {
    // patp2bigint now returns bigint
    name = patp2bigint(who);
  } catch (_) {
    throw new Error("clan: not a valid @p");
  }

  // met and end now handle bigint
  const wid = met(three, name);
  // Replace .lte(), .eq() with <=, ===
  // Replace new bigint(8) with 8n
  return wid <= one
    ? "galaxy"
    : wid === two
      ? "star"
      : wid <= four
        ? "planet"
        : wid <= 8n
          ? "moon"
          : "comet";
};

/**
 * Determine the parent of a @p value.
 *
 */
const sein = (name: PatP): PatP => {
  let who;
  try {
    // patp2bigint now returns bigint
    who = patp2bigint(name);
  } catch (_) {
    throw new Error("sein: not a valid @p");
  }

  let mir;
  try {
    mir = clan(name); // clan returns string, no change needed here
  } catch (_) {
    throw new Error("sein: not a valid @p");
  }

  // end now handles bigint, zero is bigint
  const res =
    mir === "galaxy"
      ? who // who is already bigint
      : mir === "star"
        ? end(three, one, who)
        : mir === "planet"
          ? end(four, one, who)
          : mir === "moon"
            ? end(five, one, who)
            : zero;
  // patp function now handles bigint input
  return patp(res);
};

/**
 * Weakly check if a string is a valid @p or @q value.
 *
 * This is, at present, a pretty weak sanity check.  It doesn't confirm the
 * structure precisely (e.g. dashes), and for @q, it's required that q values
 * of (greater than one) odd bytelength have been zero-padded.  So, for
 * example, '~doznec-binwod' will be considered a valid @q, but '~nec-binwod'
 * will not.
 *
 */
// This function operates on strings and arrays, no bigint/bigint changes needed.
const isValidPat = (name: PatQ | PatP): boolean => {
  if (typeof name !== "string") {
    throw new Error("isValidPat: non-string input");
  }

  const leadingTilde = name.slice(0, 1) === "~";

  if (leadingTilde === false || name.length < 4) {
    return false;
  } else {
    const syls = patp2syls(name);
    const wrongLength = syls.length % 2 !== 0 && syls.length !== 1;
    const sylsExist = syls.reduce(
      (acc: boolean, syl, index) =>
        acc &&
        (index % 2 !== 0 || syls.length === 1
          ? suffixes.includes(syl)
          : prefixes.includes(syl)),
      true,
    );

    return !wrongLength && sylsExist;
  }
};

/**
 * Validate a @p string.
 *
 */
// This function operates on strings, patp and patp2dec handle bigint internally
const isValidPatp = (str: PatP): boolean =>
  isValidPat(str) && str === patp(patp2dec(str));

/**
 * Validate a @q string.
 *
 */
// This function operates on strings, eqPatq and patq handle bigint internally
const isValidPatq = (str: PatQ): boolean =>
  isValidPat(str) && eqPatq(str, patq(patq2dec(str)));

/**
 * Remove all leading zero bytes from a sliceable value.
 */
// This function operates on strings, no bigint/bigint changes needed.
const removeLeadingZeroBytes = (str: Iterable): Iterable =>
  typeof str === "string" && str.slice(0, 2) === "00"
    ? removeLeadingZeroBytes(str.slice(2))
    : str;

/**
 * Equality comparison, modulo leading zero bytes.
 */
// This function uses isEqual on strings, no bigint/bigint changes needed.
const eqModLeadingZeroBytes = (s: Iterable, t: Iterable): boolean =>
  isEqual(removeLeadingZeroBytes(s), removeLeadingZeroBytes(t));

/**
 * Equality comparison on @q values.
 */
// This function operates on strings, patq2hex handles bigint internally
const eqPatq = (p: PatQ, q: PatQ): boolean => {
  let phex;
  try {
    phex = patq2hex(p);
  } catch (_) {
    throw new Error("eqPatq: not a valid @q");
  }

  let qhex;
  try {
    qhex = patq2hex(q);
  } catch (_) {
    throw new Error("eqPatq: not a valid @q");
  }

  return eqModLeadingZeroBytes(phex, qhex);
};

/**
 * Convert a number to a @p-encoded string.
 *
 * @param  {String, Number, bigint}  arg
 * @return  {String}
 */
const patp = (arg: number | string | bigint): PatP => {
  if (arg === null) {
    throw new Error("patp: null input");
  }
  // Replace new bigint(arg) with BigInt(arg)
  const n = BigInt(arg);

  // ob.fein is assumed to handle bigint and return bigint
  const sxz = ob.fein(n);
  // met now handles bigint and returns bigint
  const dyy = met(four, sxz);

  const loop = (tsxz: bigint, timp: bigint, trep: string): string => {
    // end and rsh now handle bigint and return bigint
    const log = end(four, one, tsxz);
    // Use .toNumber() for array indices - these values are small results of bitwise/mod operations
    const pre = prefixes[Number(rsh(three, one, log))];
    const suf = suffixes[Number(end(three, one, log))];
    // Replace .mod(), .eq() with %, ===
    const etc = timp % four === zero ? (timp === zero ? "" : "--") : "-";

    const res = pre! + suf + etc + trep;

    // Replace .eq() with ===
    // Replace .add() with +
    // rsh now handles bigint
    return timp === dyy ? trep : loop(rsh(four, one, tsxz), timp + one, res);
  };

  // met now handles bigint and returns bigint
  const dyx = met(three, sxz);

  // Replace .lte() with <=
  // Use .toNumber() for array index - only called for small values where sxz fits in Number
  return "~" + (dyx <= one ? suffixes[Number(sxz)] : loop(sxz, zero, ""));
};

export {
  patp,
  hex2patp,
  patp2hex,
  patp2bigint,
  patp2dec,
  patq,
  buf2patq,
  hex2patq,
  patq2hex,
  patq2bigint,
  patq2dec,
  clan,
  sein,
  isValidPat,
  isValidPatp,
  isValidPatq,
  eqPatq,
};