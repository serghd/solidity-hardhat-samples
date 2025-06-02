import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, verifyContract } from "../../common/deploy";
import { PAYMENTS_CONTRACT_BLAST_NAME } from "../../constants";
import { getAddressesFromHre } from "../../utils/context";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const { paymentsContractAddressBlast } = getAddressesFromHre(hre);
      console.log(
         `${PAYMENTS_CONTRACT_BLAST_NAME} ${paymentsContractAddressBlast} is verifying...`,
      );
      await verifyContract(paymentsContractAddressBlast, hre);
   }, hre);
};

func.tags = ["payments-contract-verify-blast"];

export default func;
