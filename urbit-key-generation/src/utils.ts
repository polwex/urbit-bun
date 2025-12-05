import jssha256 from "js-sha256";
import { computeAddress } from "@ethersproject/transaction";
import { getAddress as toChecksumAddress } from "@ethersproject/address";
import BIP32Factory from "bip32";
import secp256k1 from "secp256k1";
import nacl from "tweetnacl";
export const bip32 = BIP32Factory(await import("tiny-secp256k1"));

import bip39 from "bip39";
import argon2 from "argon2-wasm";
import { hex2patq, patq2hex, hex2patp } from "urbit-ob";
import {
  CHILD_SEED_TYPES,
  GALAXY_MAX,
  GALAXY_MIN,
  PLANET_MAX,
  PLANET_MIN,
} from "./constants";
import type { NetworkKeys, WalletNode } from "./types";
import { createRing } from "./keys";
import { keccak256 } from "@ethersproject/keccak256";

type Shard = string | undefined;

export function hexToBuffer(hex: string) {
  let cleanHex = stripHexPrefix(hex);
  if (typeof cleanHex === "string" && cleanHex.length % 2 === 1) {
    cleanHex = "0" + cleanHex;
  }
  const buf = Buffer.from(cleanHex, "hex");
  if (cleanHex.length !== 0 && buf.length === 0) {
    throw new Error("invalid hex string: " + hex);
  }
  return buf;
}

export const addHexPrefix = (hex: string) =>
  hex.slice(0, 2) === "0x" ? hex : "0x" + hex;

export const stripHexPrefix = (hex: string) =>
  hex.slice(0, 2) === "0x" ? hex.slice(2) : hex;

const combine = (shards: Shard[]): Shard => {
  const nundef = shards.reduce(
    (acc, shard) => acc + (shard === undefined ? 1 : 0),
    0,
  );

  if (nundef > 1) {
    throw new Error("combine: need at least two shards");
  }

  const s0 = shards[0];
  const s1 = shards[1];
  const s2 = shards[2];

  const arg =
    s0 !== undefined && s1 !== undefined
      ? patq2hex(s0).slice(0, 32) + patq2hex(s1)
      : s0 !== undefined && s2 !== undefined
        ? patq2hex(s0) + patq2hex(s2).slice(32)
        : s1 !== undefined && s2 !== undefined
          ? patq2hex(s2).slice(0, 32) + patq2hex(s1)
          : // above throw makes this unreachable
            /* istanbul ignore next */
            undefined;
  return hex2patq(arg!);
};
export function shard(ticket: string) {
  const ticketHex = patq2hex(ticket);
  const ticketBuf = hexToBuffer(ticketHex);

  if (ticketBuf.length !== 48) {
    return [ticket];
  }

  const shards = [
    ticketBuf.slice(0, 32),
    ticketBuf.slice(16),
    Buffer.concat([ticketBuf.slice(0, 16), ticketBuf.slice(32)]),
  ];

  const pq = shards.map((shard) => hex2patq(shard.toString("hex")));

  const combinable =
    combine([pq[0], pq[1], undefined]) === ticket &&
    combine([pq[0], undefined, pq[2]]) === ticket &&
    combine([undefined, pq[1], pq[2]]) === ticket;

  // shards should always be combinable, so following should be unreachable
  /* istanbul ignore next */
  if (combinable === false) {
    /* istanbul ignore next */
    throw new Error("produced invalid shards -- please report this as a bug");
  }

  return pq;
}

// TODO any
export const argon2u = async (entropy: any, ship: number) => {
  const a2u = await argon2.hash({
    pass: entropy,
    salt: `urbitkeygen${ship}`,
    type: argon2.types.Argon2u,
    hashLen: 32,
    parallelism: 4,
    mem: 512000,
    time: 1,
  });
  return a2u.hash;
};

export const sha256 = (...args: any[]) => {
  const buffer = Buffer.concat(args.map((x) => Buffer.from(x)));
  const hashed = jssha256.sha256.array(buffer);
  return Buffer.from(hashed);
};

export const addressFromSecp256k1Public = (pub: Uint8Array) => {
  const compressed = secp256k1.publicKeyConvert(pub);
  const str = Buffer.from(compressed).toString("hex");
  const addr = computeAddress("0x" + str);
  return toChecksumAddress(addr);
};

type NodeSeedType =
  | "ownership"
  | "transfer"
  | "spawn"
  | "voting"
  | "management"
  | "bitcoinTestnet"
  | "bitcoinMainnet";

export const deriveNodeSeed = (master: Uint8Array, type: NodeSeedType) => {
  const hash = sha256(master, type);
  return bip39.entropyToMnemonic(hash);
};

// * @return  {Object}  the keypair, BIP32 chain code, and Ethereum address
export const deriveNodeKeys = async (
  mnemonic: string,
  derivationPath: string,
  passphrase?: string,
) => {
  const seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
  const hd = bip32.fromSeed(seed);
  const wallet = hd.derivePath(derivationPath);
  return {
    public: Buffer.from(wallet.publicKey).toString("hex"),
    private: Buffer.from(wallet.privateKey!).toString("hex"),
    chain: Buffer.from(wallet.chainCode).toString("hex"),
    address: addressFromSecp256k1Public(wallet.publicKey),
  };
};

export const deriveNode = async (
  master: Uint8Array,
  type: NodeSeedType,
  derivationPath: string,
  passphrase?: string,
): Promise<WalletNode> => {
  const mnemonic = deriveNodeSeed(master, type);
  const keys = await deriveNodeKeys(mnemonic, derivationPath, passphrase);
  return {
    type: type,
    seed: mnemonic,
    keys: keys,
    derivationPath: derivationPath,
  };
};

export const deriveNetworkSeed = async (
  mnemonic: string,
  passphrase: string | undefined,
  revision: number,
) => {
  const seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
  const hash = sha256(seed, CHILD_SEED_TYPES.NETWORK, `${revision}`);
  // SHA-256d on nonzero revisions to prevent length extension attacks
  const dhash = revision === 0 ? hash : sha256(hash);
  return dhash.toString("hex");
};

export const deriveNetworkKeys = (hex: string) => {
  const seed = hexToBuffer(hex);
  let h: any = [];
  //@ts-ignore
  nacl.lowlevel.crypto_hash(h, seed.reverse(), seed.length);

  const c = Buffer.from(h.slice(32));
  const a = Buffer.from(h.slice(0, 32));

  const crypt = nacl.sign.keyPair.fromSeed(c);
  const cpub = Buffer.from(crypt.publicKey);
  const auth = nacl.sign.keyPair.fromSeed(a);
  const apub = Buffer.from(auth.publicKey);

  return {
    crypt: {
      private: c.reverse().toString("hex"),
      public: cpub.reverse().toString("hex"),
    },
    auth: {
      private: a.reverse().toString("hex"),
      public: apub.reverse().toString("hex"),
    },
  };
};
export const deriveNetworkInfo = async (
  mnemonic: string,
  revision: number,
  passphrase?: string,
) => {
  const seed = await deriveNetworkSeed(mnemonic, passphrase, revision);
  const keys = deriveNetworkKeys(seed);
  return {
    type: CHILD_SEED_TYPES.NETWORK,
    seed: seed,
    keys: keys,
  };
};

// urbit stuff
export const isGalaxy = (ship: number) =>
  Number.isInteger(ship) && ship >= GALAXY_MIN && ship <= GALAXY_MAX;

export const isPlanet = (ship: number) =>
  Number.isInteger(ship) && ship >= PLANET_MIN && ship <= PLANET_MAX;

export function shas(buf: Buffer, salt: Buffer) {
  return sha256(xor(salt, sha256(buf)));
}

export function xor(a: Buffer, b: Buffer) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    // console.log("a", a);
    // console.log("b", b);
    throw new Error("only xor buffers!");
  }
  const length = Math.max(a.byteLength, b.byteLength);
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = a[i]! ^ b[i]!;
  }
  return result;
}

export function shaf(buf: Buffer, salt: Buffer) {
  const result = shas(buf, salt);
  const halfway = result.length / 2;
  const front = result.slice(0, halfway);
  const back = result.slice(halfway, result.length);
  return xor(front, back);
}

export const generateCode = (pair: NetworkKeys) => {
  const ring = hex2buf(createRing(pair));
  const salt = hex2buf("73736170"); // salt is the noun %pass
  const hash = sha256(ring);
  const result = shaf(hash, salt);
  const half = result.slice(0, result.length / 2);

  return hex2patp(buf2hex(half)).slice(1);
};
export function hex2buf(hex: string) {
  return Buffer.from(hex, "hex").reverse();
}

export function buf2hex(buf: Uint8Array) {
  return Buffer.from(buf).reverse().toString("hex");
}
export function fromHex(hex: string) {
  const p = hex2patp(hex);
  const point = Number(`0x${hex}`);
  return { p, point };
}
export function findChildren(star: string) {
  const ts = Date.now();
  const hex = patq2hex(star);
  // console.log({ star, hex });
  let planets = [];

  for (let i = 1; i <= 0xffff; i++) {
    const s = i.toString(16).padStart(4, "0") + hex;
    // console.log({ s, i });
    // const p = hex2patp(s);
    // console.log({ p });
    // const point = Number(`0x${s}`);
    // console.log({ point });
    // planets.push({ p, point });
    planets.push(s);
  }

  planets.sort();
  // console.log("planets elapsed", Date.now() - ts);
  return planets;
}

export function signTransactionHash(msg: string, prvKey: Buffer) {
  //  msg is a keccak-256 hash
  //
  const hashed = hexToBuffer(msg);
  const { signature, recid } = secp256k1.ecdsaSign(hashed, prvKey);
  // add key recovery parameter
  const ethSignature = new Uint8Array(65);
  ethSignature.set(signature);
  ethSignature[64] = recid;
  return `0x${Buffer.from(ethSignature).toString("hex")}`;
}

export function hashPersonalMessage(message: Buffer): Buffer {
  const prefix = Buffer.from(
    `\u0019Ethereum Signed Message:\n${message.length}`,
    "utf-8",
  );
  return Buffer.from(keccak256(Buffer.concat([prefix, message])));
}
export function signMessage(
  message: string,
  privateKey: Buffer,
  useLegacyTokenSigning = false,
) {
  const msg = "\x19Ethereum Signed Message:\n" + message.length + message;
  const hashed = useLegacyTokenSigning
    ? sha256(Buffer.from(msg))
    : hashPersonalMessage(Buffer.from(message)); // msg prefix is handled by lib

  const hashAry = new Uint8Array(hashed.buffer);
  const { signature } = secp256k1.ecdsaSign(hashAry, privateKey);

  // add key recovery parameter
  const ethSignature = new Uint8Array(65);
  ethSignature.set(signature);

  // https://eips.ethereum.org/EIPS/eip-155
  // This method for setting the recovery parameter is the "legacy" way of doing
  // so; and in fact, does not match up with output of Metamask / Brave Wallet.
  // MM uses 28 instead of 27.
  // TODO: Should we bring this up to latest standard? The problem is, users
  // who have set network keys or generated invites with an older token will
  // not be able to rederive them
  const v = (ethSignature[32]! & 1) + 27;
  ethSignature[64] = v;

  return ethSignature;
}
