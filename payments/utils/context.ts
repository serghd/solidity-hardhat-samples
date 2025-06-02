import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { DeployProxyOptions } from "@openzeppelin/hardhat-upgrades/dist/utils";
import { ethers, upgrades } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getNetworkName } from "../common/deploy";
import {
   ACCOUNTS,
   CONTRACTS,
   PAYMENTS_CONTRACT_BLAST_NAME,
   USD_TEST_CONTRACT_NAME,
} from "../constants";
import { Addresses, DeployNetworks, Users } from "../misc/types";
import { PaymentsContractBlast } from "../typechain-types/contracts/PaymentsContractBlast";
import { TestUSD } from "../typechain-types/contracts/TestUSD";
import { PaymentsContractBlast__factory } from "../typechain-types/factories/contracts/PaymentsContractBlast__factory";
import { TestUSD__factory } from "../typechain-types/factories/contracts/TestUSD__factory";

const OPTIONS: DeployProxyOptions = {
   initializer: "initialize",
   kind: "uups",
};

export function getAddresses(network: keyof DeployNetworks): Addresses {
   const superOwnerAddress = ACCOUNTS.SUPER_OWNER[network];
   const ownerAddress = ACCOUNTS.OWNER[network];
   const paymentsContractAddressBlast = CONTRACTS.PAYMENTS_BLAST[network];
   const usdTokenContractAddress = CONTRACTS.USD[network];
   return {
      paymentsContractAddressBlast,
      superOwnerAddress,
      ownerAddress,
      usdTokenContractAddress,
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

export async function getOrDeployPaymentsContractBlast(
   users: Users,
   createObj:
      | {
           superOwnerAddress: string;
           usdTokenContractAddress: string;
           usdTokenSymbol: string;
           usdTokenDecimals: number;
        }
      | string,
) {
   const { superOwner, owner, user1, user2 } = users;

   const paymentsContractFactoryBlast = (await ethers.getContractFactory(
      PAYMENTS_CONTRACT_BLAST_NAME,
   )) as unknown as PaymentsContractBlast__factory;

   let paymentsContractBlast;

   if (typeof createObj === "string") {
      const contractAddress = createObj as string;
      paymentsContractBlast = paymentsContractFactoryBlast
         .connect(owner)
         .attach(contractAddress) as PaymentsContractBlast;
   } else {
      // deployer (signer): see hardhat.config->network->accounts
      paymentsContractBlast = (await upgrades.deployProxy(
         paymentsContractFactoryBlast,
         [
            createObj.superOwnerAddress,
            createObj.usdTokenContractAddress,
            createObj.usdTokenSymbol,
            createObj.usdTokenDecimals,
         ],
         OPTIONS,
      )) as unknown as PaymentsContractBlast;
   }

   const ownerPaymentsContractBlast = paymentsContractBlast;
   const superOwnerPaymentsContractBlast = paymentsContractBlast.connect(
      superOwner,
   ) as PaymentsContractBlast;
   const user1PaymentsContractBlast = paymentsContractBlast.connect(user1) as PaymentsContractBlast;
   const user2PaymentsContractBlast = paymentsContractBlast.connect(user1) as PaymentsContractBlast;

   return {
      paymentsContractFactoryBlast,
      superOwnerPaymentsContractBlast,
      ownerPaymentsContractBlast,
      user1PaymentsContractBlast,
      user2PaymentsContractBlast,
   };
}

export async function getOrDeployUsdTestContract(
   users: Users,
   createObj:
      | {
           tokenDecimals: number;
        }
      | string,
) {
   const { superOwner, owner, user1 } = users;

   const usdTestFactory = (await ethers.getContractFactory(
      USD_TEST_CONTRACT_NAME,
   )) as unknown as TestUSD__factory;

   let testUSDContract: TestUSD;

   if (typeof createObj === "string") {
      const tokenAddress = createObj as string;
      testUSDContract = usdTestFactory.connect(superOwner).attach(tokenAddress) as TestUSD;
   } else {
      /**
       * with gas price:
       * .deploy(createObj.tokenDecimals, {nonce: 21, gasPrice: 400_000_000_000})) as TestUSD;
       */
      testUSDContract = (await usdTestFactory
         .connect(superOwner)
         .deploy(createObj.tokenDecimals)) as TestUSD;
   }

   const superOwnerUsdTestContract = testUSDContract.connect(superOwner) as TestUSD;
   const ownerUsdTestContract = testUSDContract.connect(owner) as TestUSD;
   const user1UsdTestContract = testUSDContract.connect(user1) as TestUSD;

   return {
      superOwnerUsdTestContract,
      ownerUsdTestContract,
      user1UsdTestContract,
   };
}
