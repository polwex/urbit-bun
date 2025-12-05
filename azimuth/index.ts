import EthProvider from "./src/lib/calls";
import azimuth_abi from "./src/lib/abis/azimuth.json";
import ecliptic_abi from "./src/lib/abis/ecliptic.json";
import claims_abi from "./src/lib/abis/claims.json";
import treasury_abi from "./src/lib/abis/treasury.json";
import {
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  type ContractAddresses,
} from "./src/lib/constants/contracts";
export default EthProvider;
const ABIS = {
  azimuth: azimuth_abi,
  ecliptic: ecliptic_abi,
  claims: claims_abi,
  treasury: treasury_abi,
  erc20: ERC20_ABI,
};
export { ABIS, CONTRACT_ADDRESSES, type ContractAddresses };
