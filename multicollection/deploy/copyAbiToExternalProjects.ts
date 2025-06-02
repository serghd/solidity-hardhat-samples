import appRoot from "app-root-path";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";

import { getEnv } from "../common/config";
import { callWithTimerHre } from "../common/deploy";
import { MULTICOLLECTION_CONTRACT_NAME } from "../constants";

const func: DeployFunction = async (): Promise<void> => {
   await callWithTimerHre(async () => {
      const root = appRoot.toString();

      // MulticollactionContract
      {
         const sourcePath = `${root}/artifacts/contracts/${MULTICOLLECTION_CONTRACT_NAME}.sol/${MULTICOLLECTION_CONTRACT_NAME}.json`;

         const file = fs.readFileSync(sourcePath, { encoding: "utf8", flag: "r" });
         const jsonFile = JSON.parse(file);
         let abi: string = jsonFile.abi;

         {
            const targetPath = `${root}/../../${getEnv(
               "INDEXER_PROJECT_NAME",
            )}/src/contracts/abi/${MULTICOLLECTION_CONTRACT_NAME}.json`;
            fs.writeFileSync(targetPath, JSON.stringify(abi, null, 2));
            console.log(`ABI-file was saved to ${targetPath}`);
         }
         {
            const targetPath = `${root}/../../${getEnv(
               "WEB3_PROJECT_NAME",
            )}/src/contracts/abi/${MULTICOLLECTION_CONTRACT_NAME}.json`;
            fs.writeFileSync(targetPath, JSON.stringify(abi, null, 2));
            console.log(`ABI-file was saved to ${targetPath}`);
         }
      }
   });
};

func.tags = ["copy-abi-to-external-projects"];

export default func;
