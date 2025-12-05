import { hex2patq } from "urbit-ob";

import {
  GALAXY_ENTROPY_BITS,
  MIN_PLANET,
  MIN_STAR,
  PLANET_ENTROPY_BITS,
  STAR_ENTROPY_BITS,
  SEED_ENTROPY_BITS,
} from "./constants";
import { shas, stripHexPrefix } from "./utils";
import { generateWallet, type UrbitWallet } from "..";

const SEED_LENGTH_BYTES = SEED_ENTROPY_BITS / 8;

// import * as more from "more-entropy";
// import { chunk, flatMap, zipWith } from "lodash";
// export const makeTicket = (point: number): Promise<string> => {
//   const bits = getTicketBitSize(point);

//   const bytes = bits / 8;
//   const some = new Uint8Array(bytes);
//   ///@ts-ignore
//   if (window) window.crypto.getRandomValues(some);
//   else globalThis.crypto.getRandomValues(some);

//   const gen = new more.Generator();

//   return new Promise<string>((resolve, reject) => {
//     gen.generate(bits, (result: any) => {
//       const chunked = chunk(result, 2);
//       const desired = chunked.slice(0, bytes); // only take required entropy
//       const more = flatMap(desired, (arr: number[]) => arr[0]! ^ arr[1]!);
//       // TODO mmm??
//       const entropy = zipWith(some, more, (x, y: any) => x ^ y);
//       const buf = Buffer.from(entropy);
//       const patq = ob.hex2patq(buf.toString("hex"));
//       resolve(patq);
//       reject("Entropy generation failed");
//     });
//   });
// };
export const makeTicket = (point: number): string => {
  const bits = getTicketBitSize(point);

  const bytes = bits / 8;
  const entropy = new Uint8Array(bytes);
  ///@ts-ignore
  if (window) window.crypto.getRandomValues(entropy);
  else globalThis.crypto.getRandomValues(entropy);

  const hexString = Array.from(entropy)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const patq = hex2patq(hexString);
  return patq;
};
const getTicketBitSize = (point: number) =>
  point < MIN_STAR
    ? GALAXY_ENTROPY_BITS
    : point < MIN_PLANET
      ? STAR_ENTROPY_BITS
      : PLANET_ENTROPY_BITS;

export const makeDeterministicTicket = (point: number, seed: string) => {
  const bits = getTicketBitSize(point);

  const bytes = bits / 8;

  const pointSalt = Buffer.concat([
    Buffer.from(point.toString()),
    Buffer.from("invites"),
  ]);
  const normalizedSeed = stripHexPrefix(seed);
  const entropy = shas(Buffer.from(normalizedSeed, "hex"), pointSalt);

  const buf = entropy.slice(0, bytes);
  const patq = hex2patq(buf.toString("hex"));
  return patq;
};

// return a wallet object
export const makeWallet = async (data: {
  point: number;
  ticket: string;
  boot?: boolean;
  revision?: number;
}) => {
  const config = {
    ticket: data.ticket,
    seedSize: SEED_LENGTH_BYTES,
    point: data.point,
    password: "",
    revision: data.revision || 1,
    boot: data.boot || false,
  };

  // This is here to notify anyone who opens console because the thread
  // hangs, blocking UI updates so this cannot be done in the UI
  console.log("Generating Wallet for point address: ", data.point);

  const wallet = await generateWallet(config);
  console.log({ wallet });

  return wallet;
  // return new Promise(async (resolve, reject) => {
  //   // Use a web worker to process the data
  //   try {
  //     const processed = await walletgenWorker.generate(JSON.stringify(config));
  //     resolve(processed);
  //   } catch (error) {
  //     reject(error);
  //   }
  // });
};
