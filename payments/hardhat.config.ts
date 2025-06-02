import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "tsconfig-paths/register";

import { getEnv } from "./common/config";
import { DeployNetworks } from "./misc/types";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({
   path: resolve(__dirname, dotenvConfigPath),
});

function getChainConfig(chain: keyof DeployNetworks): NetworkUserConfig & { url?: string } {
   return {
      url: getEnv(`${chain.toUpperCase()}_PROVIDER_HTTP_URL`),
      // can be useful for mainnet:
      // gasPrice: 1_100_000,
      accounts: [
         `0x${getEnv("SUPER_OWNER_PRIVATE_KEY")}`,
         `0x${getEnv("OWNER_PRIVATE_KEY")}`,
         `0x${getEnv("USER1_PRIVATE_KEY")}`,
      ],
   };
}

export const defaultNetwork: keyof DeployNetworks = "blast_testnet";

const config: HardhatUserConfig = {
   defaultNetwork,
   networks: {
      polygon_testnet: getChainConfig("polygon_testnet"),
      blast_testnet: getChainConfig("blast_testnet"),
      polygon: getChainConfig("polygon"),
      blast: getChainConfig("blast"),
      hardhat: {
         forking: {
            enabled: false,
            url: getChainConfig(defaultNetwork).url ?? "",
            blockNumber: 39656567,
         },
         initialBaseFeePerGas: 0,
         mining: {
            auto: true,
         },
         gasPrice: 0,
      },
   },
   etherscan: {
      apiKey: {
         blast_testnet: getEnv("BLAST_TESTNET_SCAN_API_KEY"),
         blast: getEnv("BLAST_SCAN_API_KEY"),
         polygonMumbai: getEnv("POLYGON_TESTNET_SCAN_API_KEY"),
         polygon: getEnv("POLYGON_SCAN_API_KEY"),
         boba_bnb_testnet: getEnv("BOBA_BNB_TESTNET_SCAN_API_KEY"),
         goerli: getEnv("MYRIA_TESTNET_SCAN_API_KEY"),
         bscTestnet: getEnv("BSC_TESTNET_SCAN_API_KEY"),
         opbnb_testnet: getEnv("OPBNB_TESTNET_SCAN_API_KEY"),
      },
      customChains: [
         {
            // https://testnet.blastscan.io/documentation/recipes/hardhat-verification
            network: "blast_testnet",
            chainId: 168587773,
            urls: {
               // // source #1: https://testnet.blastscan.io/documentation/recipes/hardhat-verification
               // apiURL: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
               // source #2: https://docs.blastscan.io/v/sepolia-blastscan
               apiURL: "https://api-sepolia.blastscan.io/api",
               browserURL: "https://testnet.blastscan.io",
            },
         },
         {
            // https://blastexplorer.io/documentation/recipes/hardhat-verification
            network: "blast",
            chainId: 81457,
            urls: {
               // // source #1: https://blastexplorer.io/documentation/recipes/hardhat-verification
               // apiURL: "https://api.routescan.io/v2/network/mainnet/evm/81457/etherscan",
               // source #2: https://docs.blastscan.io/v/sepolia-blastscan
               apiURL: "https://api.blastscan.io/api",
               browserURL: "https://blastexplorer.io",
            },
         },
         {
            network: "boba_bnb_testnet",
            chainId: 9728,
            urls: {
               apiURL: "https://api.routescan.io/v2/network/testnet/evm/9728/etherscan",
               browserURL: "https://boba-bnb-testnet.gateway.tenderly.co",
            },
         },
         {
            network: "opbnb_testnet",
            chainId: 5611,
            urls: {
               apiURL: `https://open-platform.nodereal.io/${getEnv(
                  "OPBNB_TESTNET_SCAN_API_KEY",
               )}/op-bnb-testnet/contract/`,
               browserURL: "https://testnet.opbnbscan.com/",
            },
         },
      ],
   },
   gasReporter: {
      currency: "USD",
      enabled: false,
      excludeContracts: [],
      src: "./contracts",
   },
   paths: {
      artifacts: "./artifacts",
      cache: "./cache",
      sources: "./contracts",
      tests: "./test",
   },
   solidity: {
      compilers: [
         {
            version: "0.8.17",
            settings: {
               metadata: {
                  bytecodeHash: "none",
               },
               // Disable the optimizer when debugging
               // https://hardhat.org/hardhat-network/#solidity-optimizer-support
               optimizer: {
                  enabled: true,
                  runs: 800,
               },
            },
         },
         {
            version: "0.8.23",
            settings: {
               metadata: {
                  bytecodeHash: "none",
               },
               optimizer: {
                  enabled: true,
                  runs: 800,
               },
            },
         },
      ],
   },
   namedAccounts: {
      deployer: {
         default: 0, // here this will by default take the first account as deployer
      },
   },
   typechain: {
      // outDir: "types",
      target: "ethers-v6",
   },
};

export default config;
