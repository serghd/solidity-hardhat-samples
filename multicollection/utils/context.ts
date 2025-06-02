import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { ethers, upgrades } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getNetworkName } from "../common/deploy";
import { ACCOUNTS, CONTRACTS, MULTICOLLECTION_CONTRACT_NAME } from "../constants";
import { Addresses, DeployNetworks, Users } from "../misc/types";
import { MulticollectionContract } from "../typechain-types/contracts/MulticollectionContract";
import { MulticollectionContract__factory } from "../typechain-types/factories/contracts/MulticollectionContract__factory";

const OPTIONS: DeployProxyOptions = {
   initializer: "initialize",
   kind: "uups",
};

export function getAddresses(network: keyof DeployNetworks): Addresses {
   const superOwnerAddress = ACCOUNTS.SUPER_OWNER[network];
   const ownerAddress = ACCOUNTS.OWNER[network];
   const multicollectionContractAddress = CONTRACTS.MULTICOLLECTION[network];
   return {
      multicollectionContractAddress,
      superOwnerAddress,
      ownerAddress,
   };
}

export function getAddressesFromHre(hre: HardhatRuntimeEnvironment) {
   return getAddresses(getNetworkName(hre));
}

export async function getUsers(): Promise<Users> {
   const [superOwner, owner, user1, user2] = await ethers.getSigners();
   return {
      superOwner,
      owner,
      user1,
      user2,
   };
}

export async function getUserByAddress(address: string): Promise<SignerWithAddress> {
   return await ethers.getSigner(address);
}

export async function getOrDeployMulticollectionContract(
   users: Users,
   createObj: string | { superOwnerAddress: string; name: string; symbol: string },
) {
   const { superOwner, owner, user1, user2 } = users;

   const multicollectionContractFactory = (await ethers.getContractFactory(
      MULTICOLLECTION_CONTRACT_NAME,
   )) as unknown as MulticollectionContract__factory;

   let contract;

   // address passed: use existing Proxy
   if (typeof createObj === "string") {
      const contractAddress = createObj as string;
      contract = multicollectionContractFactory.attach(contractAddress) as MulticollectionContract;
   }
   // object passed: create new Proxy
   else {
      contract = await upgrades.deployProxy(
         multicollectionContractFactory,
         [createObj!.superOwnerAddress, createObj!.name, createObj!.symbol],
         OPTIONS,
      );
   }

   const superOwnerMulticollectionContract = contract.connect(
      superOwner,
   ) as MulticollectionContract;
   const ownerMulticollectionContract = contract.connect(owner) as MulticollectionContract;
   const user1MulticollectionContract = contract.connect(user1) as MulticollectionContract;
   const user2MulticollectionContract = contract.connect(user2) as MulticollectionContract;

   return {
      multicollectionContractFactory,
      superOwnerMulticollectionContract,
      ownerMulticollectionContract,
      user1MulticollectionContract,
      user2MulticollectionContract,
   };
}
