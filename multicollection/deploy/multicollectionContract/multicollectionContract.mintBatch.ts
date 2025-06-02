import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, waitTx } from "../../common/deploy";
import { MULTICOLLECTION_CONTRACT_NAME } from "../../constants";
import {
   getAddressesFromHre,
   getOrDeployMulticollectionContract,
   getUsers,
} from "../../utils/context";

const addresses = ["0xAa6f1fAE9eeA0741E7FF6A305F4CEd2A91774863"];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const { multicollectionContractAddress } = getAddressesFromHre(hre);
      console.log(
         `${MULTICOLLECTION_CONTRACT_NAME} ${multicollectionContractAddress} starts minting batch...`,
      );

      const { ownerMulticollectionContract } = await getOrDeployMulticollectionContract(
         await getUsers(),
         multicollectionContractAddress,
      );

      await waitTx(ownerMulticollectionContract.mintBatch(addresses, false), `mintBatch`);
   }, hre);
};

func.tags = [`multicollection-contract-mint-batch`];

export default func;
