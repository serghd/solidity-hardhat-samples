import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, verifyContract } from "../../common/deploy";
import { consoleLog } from "../../common/log";
import { sleep } from "../../common/misc";
import { MULTICOLLECTION_CONTRACT_NAME, multicollectionContractAttrs } from "../../constants";
import {
   getAddressesFromHre,
   getOrDeployMulticollectionContract,
   getUsers,
} from "../../utils/context";

const verifyRequired = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const { superOwnerAddress } = getAddressesFromHre(hre);
      const users = await getUsers();

      console.log(`Contract Owner Address: ${superOwnerAddress}`);
      console.log(
         `Contract name: ${multicollectionContractAttrs.name}, symbol: ${multicollectionContractAttrs.symbol}`,
      );
      console.log(`${MULTICOLLECTION_CONTRACT_NAME} proxy is deploying...`);

      let createObj = {
         superOwnerAddress: superOwnerAddress,
         name: multicollectionContractAttrs.name,
         symbol: multicollectionContractAttrs.symbol,
      };
      const { ownerMulticollectionContract } = await getOrDeployMulticollectionContract(
         users,
         createObj,
      );

      await ownerMulticollectionContract.waitForDeployment();
      const address: string = await ownerMulticollectionContract.getAddress();
      // after deploying a new proxy see its options (set polygonscan ui -> More Options -> Is this a proxy?)
      console.log(`${MULTICOLLECTION_CONTRACT_NAME}-proxy deployed to ${address}`);

      if (verifyRequired) {
         consoleLog("verifying...");
         await sleep(15000);
         await verifyContract(address, hre);
         console.log(`${MULTICOLLECTION_CONTRACT_NAME} deployed and verified to ${address}`);
      }
   }, hre);
};

func.tags = ["multicollection-contract-deploy-proxy"];

export default func;
