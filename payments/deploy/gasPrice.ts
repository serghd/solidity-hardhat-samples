import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getNetworkName } from "../common/deploy";
import { splitNumberIntoTriplets } from "../utils/common";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
   const gasPrice: bigint | null = (await ethers.provider.getFeeData()).gasPrice;

   if (gasPrice) {
      console.log(
         `Network: ${getNetworkName(hre)}, gasPrice: ${splitNumberIntoTriplets(Number(gasPrice))}`,
      );
   }
};

func.tags = ["current-network-gas-price"];

export default func;
