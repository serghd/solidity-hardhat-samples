import appRoot from "app-root-path";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";

import { getEnv } from "../common/config";
import { callWithTimerHre } from "../common/deploy";
import { PAYMENTS_CONTRACT_BLAST_NAME } from "../constants";

const func: DeployFunction = async (): Promise<void> => {
   await callWithTimerHre(async () => {
      const root = appRoot.toString();

      // PaymentsContractBlast
      {
         const sourcePath = `${root}/artifacts/contracts/${PAYMENTS_CONTRACT_BLAST_NAME}.sol/${PAYMENTS_CONTRACT_BLAST_NAME}.json`;

         const file = fs.readFileSync(sourcePath, { encoding: "utf8", flag: "r" });
         const jsonFile = JSON.parse(file);
         let abi: string = jsonFile.abi;

         {
            const targetPath = `${root}/../../${getEnv(
               "INDEXER_PROJECT_NAME",
            )}/src/contracts/abi/${PAYMENTS_CONTRACT_BLAST_NAME}.json`;
            fs.writeFileSync(targetPath, JSON.stringify(abi, null, 2));
            console.log(`ABI-file was saved to ${targetPath}`);
         }
         {
            const targetPath = `${root}/../../${getEnv(
               "WEB3_PROJECT_NAME",
            )}/src/contracts/abi/${PAYMENTS_CONTRACT_BLAST_NAME}.json`;
            fs.writeFileSync(targetPath, JSON.stringify(abi, null, 2));
            console.log(`ABI-file was saved to ${targetPath}`);
         }
      }
   });
};

func.tags = ["copy-abi-to-external-projects"];

export default func;
