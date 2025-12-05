import {
  Contract,
  getDefaultProvider,
  JsonRpcProvider,
  verifyMessage,
} from "ethers";
import AZIMUTH_ABI from "./abis/azimuth.json";
import { CONTRACT_ADDRESSES } from "./constants/contracts";
import type { ETHEREUM_NETWORK, HexString } from "./types/chain";

export type Backend =
  | "alchemy"
  | "ankr"
  | "cloudfare"
  | "chainstack"
  | "etherscan"
  | "infura"
  | "publicPolygon"
  | "quicknode";
export default class EthProvider {
  // endpoint;
  provider;
  constructor(apiCreds: [Backend, string], chain: ETHEREUM_NETWORK) {
    // TODO chain stuff
    const [vendor, apiKey] = apiCreds;
    const endpoint =
      chain === "mainnet"
        ? `https://mainnet.infura.io/v3/${apiKey}`
        : "https://sepolia.infura.io/v3/${apiKey}";
    // const opts = { [vendor]: apiKey };
    const jprovider = new JsonRpcProvider(endpoint);
    // const provider = getDefaultProvider(chain, opts);
    this.provider = jprovider;
  }

  async rpcCall(method: string, params: any[]) {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: Date.now(),
    });
    const opts = {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
    };
    // const res = await fetch(this.endpoint, opts);
  }

  async getAddress(point: number) {
    const contract = new Contract(
      CONTRACT_ADDRESSES.mainnet.azimuth,
      AZIMUTH_ABI,
      this.provider,
    );
    // contract.interface.forEachFunction((f) =>
    //   console.log("contract function", f),
    // );
    const res = await contract.getOwner!(point);
    return res;
  }
  async getKeys(point: number) {
    const contract = new Contract(
      CONTRACT_ADDRESSES.mainnet.azimuth,
      AZIMUTH_ABI,
      this.provider,
    );
    const res = await contract.points!(point);
    return res;
  }
  verifySignature(
    address: HexString,
    message: string,
    signature: HexString,
  ): boolean {
    const res = verifyMessage(message, signature);
    return res === address;
  }
}
