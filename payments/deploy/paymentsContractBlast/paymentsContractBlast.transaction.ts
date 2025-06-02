import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre } from "../../common/deploy";
import {
   getAddressesFromHre,
   getOrDeployPaymentsContractBlast,
   getUsers,
} from "../../utils/context";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const proxyAddress = getAddressesFromHre(hre).paymentsContractAddressBlast;
      const { superOwnerPaymentsContractBlast } = await getOrDeployPaymentsContractBlast(
         await getUsers(),
         proxyAddress,
      );

      console.log("!!!!!!! current owner: ");
      console.log(await superOwnerPaymentsContractBlast.owner());
      // 0x66d469354f446A59f589A32aA647BB18771CB239

      //await superOwnerPaymentsContractBlast.transferOwnership("0x6Cc820037116A5A090bb5571E63211a9B3e70A00");
   }, hre);
};

func.tags = ["custom-transaction"];

export default func;
