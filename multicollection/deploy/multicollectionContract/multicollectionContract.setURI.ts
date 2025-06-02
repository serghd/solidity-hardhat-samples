import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { callWithTimerHre, waitTx } from "../../common/deploy";
import { MULTICOLLECTION_CONTRACT_NAME, multicollectionContractAttrs } from "../../constants";
import {
   getAddressesFromHre,
   getOrDeployMulticollectionContract,
   getUsers,
} from "../../utils/context";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   await callWithTimerHre(async () => {
      const { multicollectionContractAddress } = getAddressesFromHre(hre);
      console.log(
         `${MULTICOLLECTION_CONTRACT_NAME} ${multicollectionContractAddress} is setting setURI...`,
      );

      const { superOwnerMulticollectionContract } = await getOrDeployMulticollectionContract(
         await getUsers(),
         multicollectionContractAddress,
      );

      await waitTx(
         superOwnerMulticollectionContract.setURI(multicollectionContractAttrs.nftMetadataUri),
         `setURI`,
      );

      console.log(`Function setURI() was called`);
   }, hre);
};

func.tags = [`multicollection-contract-set-uri`];

export default func;
