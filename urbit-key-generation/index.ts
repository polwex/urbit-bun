import * as ob from "urbit-ob";
import {
  shard,
  hexToBuffer,
  argon2u,
  deriveNode,
  deriveNetworkInfo,
  isGalaxy,
  isPlanet,
  bip32,
} from "./src/utils";
import {
  BITCOIN_MAINNET_INFO,
  BITCOIN_TESTNET_INFO,
  BTC_MAINNET_DERIVATION_PATH,
  BTC_TESTNET_DERIVATION_PATH,
  CHILD_SEED_TYPES,
  DERIVATION_PATH,
} from "./src/constants";
import type { UrbitWallet, NetworkKeys } from "./src/types";

const name = "New Urbit Key Generation";
const version = "2.0.0";

const generateWallet = async (config: {
  ticket: string;
  point: number;
  boot?: boolean;
  passphrase?: string;
  revision?: number;
}): Promise<UrbitWallet> => {
  /* istanbul ignore next */
  if ("ticket" in config === false) {
    throw new Error("generateWallet: no ticket provided");
  }
  /* istanbul ignore next */
  if ("point" in config === false) {
    throw new Error("generateWallet: no ship provided");
  }

  const { ticket, point } = config;

  const passphrase = config.passphrase;
  const revision = config.revision ? config.revision : 0;
  const boot = "boot" in config ? config.boot : false;

  const shards = shard(ticket);

  const patp = ob.patp(point);
  const tier = ob.clan(patp);

  const buf = hexToBuffer(ob.patq2hex(ticket));

  const meta = {
    generator: {
      name: name,
      version: version,
    },
    spec: "UP8",
    point: point,
    patp: patp,
    tier: tier,
    passphrase: passphrase,
  };

  const masterSeed = await argon2u(buf, point);

  const ownership = await deriveNode(
    masterSeed,
    "ownership",
    DERIVATION_PATH,
    passphrase,
  );

  const transfer = await deriveNode(
    masterSeed,
    "transfer",
    DERIVATION_PATH,
    passphrase,
  );

  const spawn = !isPlanet(point)
    ? await deriveNode(masterSeed, "spawn", DERIVATION_PATH, passphrase)
    : null;

  const voting = isGalaxy(point)
    ? await deriveNode(masterSeed, "voting", DERIVATION_PATH, passphrase)
    : null;

  const management = await deriveNode(
    masterSeed,
    "management",
    DERIVATION_PATH,
    passphrase,
  );

  const network =
    boot === true
      ? deriveNetworkInfo(management.seed, revision, passphrase)
      : {};

  const bitcoinTestnet = await deriveNode(
    masterSeed,
    "bitcoinTestnet",
    BTC_TESTNET_DERIVATION_PATH,
    passphrase,
  );

  const bitcoinTestnetKeys = bitcoinTestnet.keys;
  bitcoinTestnet.keys = {
    ...bitcoinTestnetKeys,
    xpub: bip32
      .fromPublicKey(
        Buffer.from(bitcoinTestnetKeys.public, "hex"),
        Buffer.from(bitcoinTestnetKeys.chain, "hex"),
        BITCOIN_TESTNET_INFO,
      )
      .toBase58(),

    xprv: bip32
      .fromPrivateKey(
        Buffer.from(bitcoinTestnetKeys.private, "hex"),
        Buffer.from(bitcoinTestnetKeys.chain, "hex"),
        BITCOIN_TESTNET_INFO,
      )
      .toBase58(),
  };

  const bitcoinMainnet = await deriveNode(
    masterSeed,
    "bitcoinMainnet",
    BTC_MAINNET_DERIVATION_PATH,
    passphrase,
  );

  const bitcoinMainnetKeys = bitcoinMainnet.keys;
  bitcoinMainnet.keys = {
    ...bitcoinMainnetKeys,
    xpub: bip32
      .fromPublicKey(
        Buffer.from(bitcoinMainnetKeys.public, "hex"),
        Buffer.from(bitcoinMainnetKeys.chain, "hex"),
        BITCOIN_MAINNET_INFO,
      )
      .toBase58(),
    xprv: bip32
      .fromPrivateKey(
        Buffer.from(bitcoinMainnetKeys.private, "hex"),
        Buffer.from(bitcoinMainnetKeys.chain, "hex"),
        BITCOIN_MAINNET_INFO,
      )
      .toBase58(),
  };

  const res: UrbitWallet = {
    meta,
    ticket,
    shards,
    ownership,
    transfer,
    management,
    network,
    bitcoinTestnet,
    bitcoinMainnet,
  };
  if (spawn) res.spawn = spawn;
  if (voting) res.voting = voting;
  return res;
};

export { generateWallet, type UrbitWallet, type NetworkKeys };
export * from "./src/ticket";
export * from "./src/utils";
