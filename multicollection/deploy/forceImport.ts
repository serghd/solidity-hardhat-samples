import { upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre } from "../common/deploy";
import { MULTICOLLECTION_CONTRACT_NAME } from "../constants";
import {
   getAddressesFromHre,
   getOrDeployMulticollectionContract,
   getUsers,
} from "../utils/context";

/**
 * https://docs.openzeppelin.com/upgrades-plugins/1.x/api-hardhat-upgrades#force-import
 *
 * Use this function to recreate a lost network file (.openzeppelin/<networkname>.json)
 * by importing previous deployments, or to register proxies or beacons for upgrading even if they
 * were not originally deployed by this plugin. Supported for UUPS, Transparent,
 * and Beacon proxies, as well as beacons and implementation contracts.
 */
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      // multicollection
      {
         console.log(`force import of ${MULTICOLLECTION_CONTRACT_NAME} proxy ...`);
         const proxyAddress: string = getAddressesFromHre(hre).multicollectionContractAddress;
         const { multicollectionContractFactory } = await getOrDeployMulticollectionContract(
            await getUsers(),
            proxyAddress,
         );
         const deployment = await upgrades.forceImport(
            proxyAddress,
            multicollectionContractFactory,
         );
         console.log("Proxy imported from:", await deployment.getAddress());
      }
   }, hre);
};

func.tags = ["force-import"];

export default func;
