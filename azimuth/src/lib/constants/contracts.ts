import type { ETHEREUM_NETWORK } from "../types/chain";

type HexString = `0x${string}`;
export type ContractAddresses = {
  azimuth: HexString;
  ecliptic: HexString;
  polls: HexString;
  claims: HexString;
  linearStarRelease: HexString;
  conditionalStarRelease: HexString;
  urbit_L2: HexString;
  usdc: HexString;
  usdt: HexString;
  dai: HexString;
  link: HexString;
  token: HexString;
  treasury: HexString;
};

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
];

export const AZIMUTH_ABI = [
  "function getOwner(uint32 _point) view returns (address)",
  "function getOwnedPoints(address _whose) view returns (uint32[])",
];

export const CONTRACT_ADDRESSES: Record<ETHEREUM_NETWORK, ContractAddresses> = {
  mainnet: {
    azimuth: "0x223c067F8CF28ae173EE5CafEa60cA44C335fecB",
    ecliptic: "0x33EeCbf908478C10614626A9D304bfe18B78DD73",
    polls: "0x0",
    claims: "0xe7e7f69b34D7d9Bd8d61Fb22C33b22708947971A",
    linearStarRelease: "0x86cd9cd0992f04231751e3761de45cecea5d1801",
    conditionalStarRelease: "0x8c241098c3d3498fe1261421633fd57986d74aea",
    urbit_L2: "0x1111111111111111111111111111111111111111",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48",
    usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
    link: "0x514910771af9ca656af840dff83e8264ecf986ca", // ?
    token: "0x0",
    treasury: "0x0",
  },
  sepolia: {
    azimuth: "0xF07cD672D61453c29138c8db5b44fC9FA84811B5",
    ecliptic: "0x2E35a61198C383212CeF06C22f1E81B6b097135C",
    polls: "0x3A3a06199Dc537FB56A6975A8B12A8eD7fCbf897",
    claims: "0xdB164DBEF321e7DE938809fE35A5A8A928c4F4df",
    linearStarRelease: "0x0",
    conditionalStarRelease: "0x0",
    urbit_L2: "0x0",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    usdt: "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0",
    dai: "0x776b6fc2ed15d6bb5fc32e0c89de68683118c62a",
    link: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    token: "0xF3F55D64D57e7A812C3e5e4B6d36A851Df85787D",
    treasury: "0x9B4FBc6872227F1DC38b63C9bD68EF090acAA602",
  },
};
