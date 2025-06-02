import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, verifyContract } from "../../common/deploy";
import { MULTICOLLECTION_CONTRACT_NAME } from "../../constants";
import { getAddressesFromHre } from "../../utils/context";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const { multicollectionContractAddress } = getAddressesFromHre(hre);

      console.log(
         `${MULTICOLLECTION_CONTRACT_NAME} ${multicollectionContractAddress} is verifying...`,
      );
      await verifyContract(multicollectionContractAddress, hre);
   }, hre);
};

func.tags = ["multicollection-contract-verify"];

export default func;
