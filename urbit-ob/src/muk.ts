// ++  muk
//
// See arvo/sys/hoon.hoon.

const ux_FF = 0xffn;
const ux_FF00 = 0xff00n;
const u_256 = 256n;

/**
 * Standard murmur3.
 *
 * This implementation uses the murmurhash3_32_gc function which operates
 * on 32-bit numbers. The input 'key' (a bigint) is reduced to 16 bits
 * and passed as a two-character string to the hash function.
 */
export const muk = (syd: number, len: number, key: bigint): bigint => {
  // Extract the lowest 8 bits (byte 0)
  // Replace .and(ux_FF) with & ux_FF
  // Replace .toNumber() with Number(...) - safe as result is <= 0xff
  const lo = Number(key & ux_FF);

  // Extract the next 8 bits (byte 1)
  // Replace .and(ux_FF00) with & ux_FF00
  // Replace .div(u_256) with / u_256
  // Replace .toNumber() with Number(...) - safe as result is <= 0xff
  const hi = Number((key & ux_FF00) / u_256);

  // Create a two-character string from the bytes
  const kee = String.fromCharCode(lo) + String.fromCharCode(hi);

  // Call the 32-bit hash function (operates on numbers)
  const hashResultNumber = murmurhash3_32_gc(kee, syd);

  // Convert the number result back to bigint
  // Replace new bigint(...) with BigInt(...)
  return BigInt(hashResultNumber);
};

// see: https://github.com/garycourt/murmurhash-js
//
// Copyright (c) 2011 Gary Court
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 **/
// This function operates on standard JavaScript numbers and 32-bit bitwise logic,
// it does not need to be refactored to use bigint.
const murmurhash3_32_gc = (key: string, seed: number): number => {
  // eslint-disable-next-line no-unused-vars
  let remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

  remainder = key.length & 3; // key.length % 4
  bytes = key.length - remainder;
  h1 = seed;
  c1 = 0xcc9e2d51;
  c2 = 0x1b873593;
  i = 0;

  while (i < bytes) {
    k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 =
      ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b =
      ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  k1 = 0;

  switch (remainder) {
    // @ts-ignore intentional fallthrough (murmur hash)
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    // @ts-ignore intentional fallthrough (murmur hash)
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
        0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
        0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 =
    ((h1 & 0xffff) * 0x85ebca6b +
      ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 13;
  h1 =
    ((h1 & 0xffff) * 0xc2b2ae35 +
      ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};
