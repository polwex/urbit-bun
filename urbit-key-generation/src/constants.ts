export const GALAXY_MIN = 0x00000000;
export const GALAXY_MAX = 0x000000ff;
export const PLANET_MIN = 0x00010000;
export const PLANET_MAX = 0xffffffff;
export const MIN_GALAXY = 0;
export const MAX_GALAXY = 255;
export const MIN_STAR = 256;
export const MAX_STAR = 65535;
export const MIN_PLANET = 65536;
export const MAX_PLANET = 4294967297;
export const ZOD = MIN_GALAXY;

export const PLANET_ENTROPY_BITS = 64;
export const STAR_ENTROPY_BITS = 128;
export const GALAXY_ENTROPY_BITS = 384;

export const SEED_ENTROPY_BITS = 128;

export const CHILD_SEED_TYPES = {
  OWNERSHIP: "ownership",
  TRANSFER: "transfer",
  SPAWN: "spawn",
  VOTING: "voting",
  MANAGEMENT: "management",
  NETWORK: "network",
  BITCOIN_MAINNET: "bitcoinMainnet",
  BITCOIN_TESTNET: "bitcoinTestnet",
};

export const DERIVATION_PATH = "m/44'/60'/0'/0/0";
export const BTC_MAINNET_DERIVATION_PATH = "m/84'/0'/0'";
export const BTC_TESTNET_DERIVATION_PATH = "m/84'/1'/0'";

export const BITCOIN_MAINNET_INFO = {
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "bc",
  bip32: {
    public: 0x04b24746,
    private: 0x04b2430c,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

export const BITCOIN_TESTNET_INFO = {
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "tb",
  bip32: {
    public: 0x045f1cf6,
    private: 0x045f18bc,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

export const NETWORK_KEY_CURVE_PARAMETER = "42";
