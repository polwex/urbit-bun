export type ETHEREUM_NETWORK = "mainnet" | "sepolia";

export type Balance = {
  raw: bigint;
  decimals: number;
  formatted: string;
  symbol: string;
};
export type HexString = `0x${string}`;
