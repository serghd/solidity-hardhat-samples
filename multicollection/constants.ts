import { getEnv } from "./common/config";
import { DeployNetworks } from "./misc/types";

export const MULTICOLLECTION_CONTRACT_NAME = "MulticollectionContract";

export enum CONTRACT_LIST {
   MULTICOLLECTION = "MULTICOLLECTION",
}

export const multicollectionContractAttrs = {
   name: String(getEnv("MULTICOLLECTION_CONTRACT_NAME")),
   symbol: String(getEnv("MULTICOLLECTION_CONTRACT_SYMBOL")),
   nftMetadataUri:
      "https://beta.petobots.io/api/0x8119CAeE28BdC062FF4bd32C9794d9b0fFCB0c31/nft/metadata/",
   contractMetadataUri: "https://beta.petobots.io/web3/multicollection/metadata",
   postfix: "",
};

export enum ACCOUNT_LIST {
   SUPER_OWNER = "SUPER_OWNER",
   OWNER = "OWNER",
   USER1 = "USER1",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
   MULTICOLLECTION: {
      /**
       * - set address of the proxy-contract if you need to call 'yarn upgrade-contract';
       * - set address of any contract if you need to call 'yarn verify-contract', etc.;
       */
      blast_testnet: getEnv("BLAST_TESTNET_MULTICOLLECTION_CONTRACT_ADDRESS"),
      blast: getEnv("BLAST_MULTICOLLECTION_CONTRACT_ADDRESS"),
      polygon_testnet: getEnv("POLYGON_TESTNET_MULTICOLLECTION_CONTRACT_ADDRESS"),
      polygon: getEnv("POLYGON_MULTICOLLECTION_CONTRACT_ADDRESS"),
      boba_bnb_testnet: "0x0A047b728BbD1dd95EDD6fF84B0EB7FA1da519C1",
      myria_testnet: "0x64Dfaf309A9edF19A21Ef5C8b0594Fb279539f76",
      bsc_testnet: "0xB6f5F375F2994aA016a7C51e0aAebAfB1a007aF9",
      opbnb_testnet: "0x1bea127F7dA78a0Bae691F5357C5AE1b34abad56",
      hardhat: "",
   },
};

export const ACCOUNTS: Record<ACCOUNT_LIST, DeployNetworks> = {
   SUPER_OWNER: {
      blast_testnet: "0x13C54cA7a6987ccB71e16373FFe2236799c7BcAc",
      blast: "0x6Cc820037116A5A090bb5571E63211a9B3e70A00",
      polygon_testnet: "0x13C54cA7a6987ccB71e16373FFe2236799c7BcAc",
      polygon: "0x1BcB5ecAA1DC3c1556d74e3Ae4576738BDe64A0A",
      boba_bnb_testnet: "",
      myria_testnet: "",
      bsc_testnet: "",
      opbnb_testnet: "",
      hardhat: "0x13C54cA7a6987ccB71e16373FFe2236799c7BcAc",
   },
   OWNER: {
      blast_testnet: "0xAa6f1fAE9eeA0741E7FF6A305F4CEd2A91774863",
      blast: "0xA1EDb6505c79Fe6cE9e9D21B7540eeb8F15b1599",
      polygon_testnet: "0xAa6f1fAE9eeA0741E7FF6A305F4CEd2A91774863",
      polygon: "0xAa6f1fAE9eeA0741E7FF6A305F4CEd2A91774863",
      boba_bnb_testnet: "",
      myria_testnet: "",
      bsc_testnet: "",
      opbnb_testnet: "",
      hardhat: "0xAa6f1fAE9eeA0741E7FF6A305F4CEd2A91774863",
   },
   USER1: {
      blast_testnet: "0x706564866BfFbef6353cF56a5824c43dB91DfeDF",
      blast: "0x706564866BfFbef6353cF56a5824c43dB91DfeDF",
      polygon_testnet: "0x706564866BfFbef6353cF56a5824c43dB91DfeDF",
      polygon: "0x706564866BfFbef6353cF56a5824c43dB91DfeDF",
      boba_bnb_testnet: "",
      myria_testnet: "",
      bsc_testnet: "",
      opbnb_testnet: "",
      hardhat: "0x706564866BfFbef6353cF56a5824c43dB91DfeDF",
   },
};
