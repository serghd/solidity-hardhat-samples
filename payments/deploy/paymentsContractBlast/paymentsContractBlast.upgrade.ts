import { Contract } from "ethers";
import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, verifyContract } from "../../common/deploy";
import { consoleLog } from "../../common/log";
import { sleep } from "../../common/misc";
import { PAYMENTS_CONTRACT_BLAST_NAME } from "../../constants";
import {
   getAddressesFromHre,
   getOrDeployPaymentsContractBlast,
   getUsers,
} from "../../utils/context";

const verifyRequired = true;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const proxyAddress = getAddressesFromHre(hre).paymentsContractAddressBlast;
      console.log(`${PAYMENTS_CONTRACT_BLAST_NAME} ${proxyAddress} (blast) is upgrading...`);
      const { paymentsContractFactoryBlast } = await getOrDeployPaymentsContractBlast(
         await getUsers(),
         proxyAddress,
      );
      const proxyContract: Contract = await upgrades.upgradeProxy(
         proxyAddress,
         paymentsContractFactoryBlast,
      );
      consoleLog(`Implementation for ${PAYMENTS_CONTRACT_BLAST_NAME} upgraded`);
      consoleLog(`New address of Implementation-contract...`);
      await sleep(15000);
      const implementationAddress = await upgrades.erc1967.getImplementationAddress(
         await proxyContract.getAddress(),
      );
      consoleLog(`${implementationAddress}`);

      if (verifyRequired) {
         console.log("verifying...");
         await sleep(15000);
         await verifyContract(implementationAddress, hre);
         consoleLog(`Implementation-contract ${implementationAddress} - verified`);
      }
   }, hre);
};

func.tags = ["payments-contract-upgrade-blast"];

export default func;
