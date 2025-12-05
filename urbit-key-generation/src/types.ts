export type WalletNode = {
  type: ChildSeedType;
  seed: string;
  keys: WalletNodeKeys;
  derivationPath: string;
};
type CHILD_SEED_TYPES = {
  OWNERSHIP: "ownership";
  TRANSFER: "transfer";
  SPAWN: "spawn";
  VOTING: "voting";
  MANAGEMENT: "management";
  NETWORK: "network";
  BITCOIN_MAINNET: "bitcoinMainnet";
  BITCOIN_TESTNET: "bitcoinTestnet";
};

export type ChildSeedType = ValueOf<CHILD_SEED_TYPES>;
export interface WalletNodeKeys {
  public: string;
  private: string;
  chain: string;
  address: string;
  xpub?: string;
  xprv?: string;
}
type ValueOf<T> = T[keyof T];

export interface UrbitWallet {
  meta: {
    generator: {
      name: string;
      version: string;
    };
    spec: string;
    point: number;
    patp: string;
    tier: string;
    passphrase?: string;
  };
  ticket: string;
  shards: string[];
  ownership: WalletNode;
  management: WalletNode;
  transfer: WalletNode;
  network:
    | {
        type: string;
        seed: string;
        keys: string;
      }
    | {};
  voting?: WalletNode;
  spawn?: WalletNode;
  bitcoinTestnet: BitcoinWallet;
  bitcoinMainnet: BitcoinWallet;
}

export interface NetworkKeys {
  crypt: {
    private: string;
    public: string;
  };
  auth: {
    private: string;
    public: string;
  };
}

interface BitcoinWallet extends WalletNode {}

export interface WalletConfig {
  ticket: string;
  ship: number;
  passphrase?: string;
  boot?: boolean;
}
