import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, verifyContract } from "../../common/deploy";
import { consoleLog } from "../../common/log";
import { sleep } from "../../common/misc";
import { MULTICOLLECTION_CONTRACT_NAME } from "../../constants";
import {
   getAddressesFromHre,
   getOrDeployMulticollectionContract,
   getUsers,
} from "../../utils/context";

const verifyRequired = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const proxyAddress: string = getAddressesFromHre(hre).multicollectionContractAddress;
      console.log(`${MULTICOLLECTION_CONTRACT_NAME} ${proxyAddress} is upgrading...`);
      const { multicollectionContractFactory } = await getOrDeployMulticollectionContract(
         await getUsers(),
         proxyAddress,
      );
      await upgrades.upgradeProxy(proxyAddress, multicollectionContractFactory);

      consoleLog(`Address of Implementation-contract...`);
      await sleep(10000);
      const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      consoleLog(`${implementationAddress}`);

      if (verifyRequired) {
         consoleLog("verifying...");
         await sleep(10000);
         await verifyContract(implementationAddress, hre);
         consoleLog(`Implementation-contract ${implementationAddress} - verified`);
      }
   }, hre);
};

func.tags = ["multicollection-contract-upgrade"];

export default func;
