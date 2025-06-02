import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export interface DeployNetworks {
   blast_testnet: string;
   blast: string;
   polygon_testnet: string;
   polygon: string;
   boba_bnb_testnet: string;
   myria_testnet: string;
   bsc_testnet: string;
   opbnb_testnet: string;
   hardhat: string;
}

export interface Addresses {
   multicollectionContractAddress: string;
   superOwnerAddress: string;
   ownerAddress: string;
}

export interface Users {
   superOwner: SignerWithAddress;
   owner: SignerWithAddress;
   user1: SignerWithAddress;
   user2: SignerWithAddress;
}

export type StringNumber = string | number;

export type DeployNetworkKey = keyof DeployNetworks;
