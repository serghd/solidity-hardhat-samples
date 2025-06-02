import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getEnv } from "../../common/config";
import { callWithTimerHre, verifyContract } from "../../common/deploy";
import { sleep } from "../../common/misc";
import { PAYMENTS_CONTRACT_BLAST_NAME } from "../../constants";
import { defaultNetwork } from "../../hardhat.config";
import { Users } from "../../misc/types";
import {
   getAddressesFromHre,
   getOrDeployPaymentsContractBlast,
   getUsers,
} from "../../utils/context";

const verifyRequired = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const { superOwnerAddress, usdTokenContractAddress } = getAddressesFromHre(hre);
      const usdTokenSymbol: string = String(
         getEnv(`${defaultNetwork.toUpperCase()}_USD_TOKEN_SYMBOL`),
      );
      const usdTokenDecimals: number = Number(
         getEnv(`${defaultNetwork.toUpperCase()}_USD_TOKEN_DECIMALS`),
      );

      console.log(`Contract SuperOwner: ${superOwnerAddress}`);
      console.log(`USD Token Contract address: ${usdTokenContractAddress}`);
      console.log(`USD Token Symbol: ${usdTokenSymbol}`);
      console.log(`USD Token Decimals: ${usdTokenDecimals}`);

      const users: Users = await getUsers();
      console.log(`${PAYMENTS_CONTRACT_BLAST_NAME} proxy is deploying...`);

      const { ownerPaymentsContractBlast } = await getOrDeployPaymentsContractBlast(users, {
         superOwnerAddress,
         usdTokenContractAddress,
         usdTokenSymbol,
         usdTokenDecimals,
      });
      await ownerPaymentsContractBlast.waitForDeployment();

      const addr: string = await ownerPaymentsContractBlast.getAddress();

      // after deploying a new proxy see its options (set polygonscan ui -> More Options -> Is this a proxy?)
      console.log(`${PAYMENTS_CONTRACT_BLAST_NAME}-proxy deployed to: ${addr}`);

      if (verifyRequired) {
         console.log("verifying...");
         await sleep(15000);
         await verifyContract(addr, hre);
         console.log(`${PAYMENTS_CONTRACT_BLAST_NAME} deployed and verified to: ${addr}`);
      }
   }, hre);
};

func.tags = ["payments-contract-deploy-proxy-blast"];

export default func;
