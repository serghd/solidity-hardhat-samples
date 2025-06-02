import { multicollectionContractAttrs } from "../../constants";
import { MulticollectionContract } from "../../typechain-types/contracts/MulticollectionContract";
import { getOrDeployMulticollectionContract, getUsers } from "../../utils/context";
import { MulticollectionContextBase } from "./types";

export async function deployContractFixture(): Promise<MulticollectionContextBase> {
   const users = await getUsers();
   const { superOwner, owner, user1, user2 } = users;
   const {
      superOwnerMulticollectionContract,
      ownerMulticollectionContract,
      user1MulticollectionContract,
      user2MulticollectionContract,
   } = await getOrDeployMulticollectionContract(users, {
      superOwnerAddress: superOwner.address,
      name: multicollectionContractAttrs.name,
      symbol: multicollectionContractAttrs.symbol,
   });

   await ownerMulticollectionContract.waitForDeployment();

   return {
      superOwner,
      owner,
      user1,
      user2,
      superOwnerMulticollectionContract:
         superOwnerMulticollectionContract as MulticollectionContract,
      ownerMulticollectionContract: ownerMulticollectionContract as MulticollectionContract,
      user1MulticollectionContract: user1MulticollectionContract as MulticollectionContract,
      user2MulticollectionContract: user2MulticollectionContract as MulticollectionContract,
   };
}
