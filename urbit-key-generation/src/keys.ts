import { dwim, jam as sjam, Atom, Cell, type Noun } from "@urbit/nockjs";
import { deriveNetworkSeed, deriveNetworkKeys, shas } from "./utils";
import type { NetworkKeys, UrbitWallet } from "./types";
// the curve param for the network keys
export const NETWORK_KEY_CURVE_PARAMETER = "42";
// the current crypto suite version
export const CRYPTO_SUITE_VERSION = 1;

export const CURVE_ZERO_ADDR =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const b64 = (buf: Buffer) => {
  let hex = buf.reverse().toString("hex");
  let n = BigInt("0x" + hex);
  let c = [];
  while (n > 0n) {
    c.push(Number(n & 0x3fn));
    n = n >> 6n;
  }

  const trans = (j: number) =>
    10 > j ? j + 48 : 36 > j ? j + 87 : 62 > j ? j + 29 : 62 === j ? 45 : 126;

  return (
    "0w" +
    c.reduce(
      (a, b, i) =>
        String.fromCharCode(trans(b)) + (i && 0 === i % 5 ? "." : "") + a,
      "",
    )
  );
};

const jam = (seed: Noun) => {
  const hex = sjam(seed).toString().slice(2);
  const pad = hex.length % 2 === 0 ? hex : "0" + hex;
  return Buffer.from(pad, "hex").reverse();
};

export const createRing = (pair: NetworkKeys) =>
  pair.crypt.private + pair.auth.private + NETWORK_KEY_CURVE_PARAMETER;

export const deriveNetworkSeedFromUrbitWallet = async (
  urbitWallet: UrbitWallet,
  revision = 1,
) => {
  return await deriveNetworkSeedFromMnemonic(
    urbitWallet.management.seed,
    urbitWallet.meta.passphrase,
    revision,
  );
};

const deriveNetworkSeedFromMnemonic = async (
  mnemonic: string,
  passphrase?: string,
  revision = 1,
) => {
  //NOTE revision is the point's on-chain revision number. since common uhdw
  //     usage derives the first key at revision/index 0, we need to decrement
  //     the on-chain revision number by one to get the number to derive with.
  return deriveNetworkSeed(mnemonic, passphrase, revision - 1);
};

export const deriveNetworkSeedFromAuthToken = (
  point: number,
  authToken: string,
  revision = 1,
) => {
  //NOTE revision is the point's on-chain revision number.
  //     since deriveNetworkSeedFromMnemonic does this too, we decrement the
  //     revision number by one before deriving from it.
  const salt = Buffer.from(`revision-${point}-${revision - 1}`);
  const networkSeed = shas(Buffer.from(authToken), salt)
    .toString("hex")
    .slice(0, 32);
  return networkSeed;
};

export const segmentNetworkKey = (hex: string) => {
  if (hex === CURVE_ZERO_ADDR) {
    return null;
  }

  const sl = (i: number) => hex.slice(i, i + 4);
  const rowFrom = (i: number) =>
    `${sl(i)}.${sl(i + 4)}.${sl(i + 8)}.${sl(i + 12)}`;

  return [rowFrom(2), rowFrom(18), rowFrom(34), rowFrom(50)];
};

export const compileMultiKey = (
  point: number,
  continuityNumber: number,
  keys: Array<{ revision: number; pair: NetworkKeys }>,
) => {
  const kyz: Noun[] = keys.map((k) => {
    const bnsec = BigInt("0x" + createRing(k.pair));
    console.log({ bnsec });
    return dwim(Atom.fromInt(k.revision), Atom.fromString(bnsec.toString()));
  });
  kyz.push(Atom.fromInt(0));

  const fed = dwim(
    dwim(Atom.fromInt(2), Atom.fromInt(0)), // version
    Atom.fromInt(point), // ship
    Atom.fromInt(continuityNumber),
    dwim(kyz), // keys
  );

  return b64(jam(fed));
};

export async function generateKeyfile(
  urbitWallet: UrbitWallet,
  revision: number,
) {
  const { patp, point } = urbitWallet.meta;
  const continuityNumber = 0;
  const hasNetworkKeys = revision > 0;
  const seed = await deriveNetworkSeedFromUrbitWallet(urbitWallet, revision);
  const keys = deriveNetworkKeys(seed);

  const keyfile = compileMultiKey(point, continuityNumber, [
    { revision, pair: keys },
  ]);
  const filename = `${patp.slice(1)}-${revision}.key`;
  const blob = new Blob([keyfile], {
    type: "text/plain;charset=utf-8",
  });
}
