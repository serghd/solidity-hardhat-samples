import { getEnv } from "./common/config";
import { DeployNetworks } from "./misc/types";

export const PAYMENTS_CONTRACT_BLAST_NAME = "PaymentsContractBlast";

export enum CONTRACT_LIST {
   PAYMENTS_BLAST = "PAYMENTS_BLAST",
   USD = "USD",
}

export const USD_TEST_CONTRACT_NAME = "TestUSD";

export enum ACCOUNT_LIST {
   SUPER_OWNER = "SUPER_OWNER",
   OWNER = "OWNER",
   USER1 = "USER1",
}

export const CONTRACTS: Record<CONTRACT_LIST, DeployNetworks> = {
   PAYMENTS_BLAST: {
      blast_testnet: getEnv("BLAST_TESTNET_PAYMENTS_CONTRACT_ADDRESS"),
      blast: getEnv("BLAST_PAYMENTS_CONTRACT_ADDRESS"),
      polygon_testnet: "",
      polygon: "",
      boba_bnb_testnet: "",
      myria_testnet: "",
      bsc_testnet: "",
      opbnb_testnet: "",
      hardhat: "",
   },
   USD: {
      blast_testnet: getEnv("BLAST_TESTNET_USD_TOKEN_ADDRESS"),
      blast: getEnv("BLAST_USD_TOKEN_ADDRESS"),
      polygon_testnet: "",
      polygon: "",
      boba_bnb_testnet: "",
      myria_testnet: "",
      bsc_testnet: "",
      opbnb_testnet: "",
      hardhat: "",
   },
};

export const ACCOUNTS: Record<ACCOUNT_LIST, DeployNetworks> = {
   SUPER_OWNER: {
      blast_testnet: "0x13C54cA7a6987ccB71e16373FFe2236799c7BcAc",
      blast: "0x8A1838172Cbb61833f9B41A096D926a4F81334fF",
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
      blast: "0xAa6f1fAE9eeA0741E7FF6A305F4CEd2A91774863",
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
