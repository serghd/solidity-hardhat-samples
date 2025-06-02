import {
   getOrDeployPaymentsContractBlast,
   getOrDeployUsdTestContract,
   getUsers,
} from "../../utils/context";
import { ContextBase } from "./types";

export async function deployPaymentsContractFixture(): Promise<ContextBase> {
   const users = await getUsers();
   const { superOwner, owner, user1, user2 } = users;

   const { superOwnerUsdTestContract, ownerUsdTestContract, user1UsdTestContract } =
      await getOrDeployUsdTestContract(users, { tokenDecimals: 6 });

   const {
      superOwnerPaymentsContractBlast,
      ownerPaymentsContractBlast,
      user1PaymentsContractBlast,
      user2PaymentsContractBlast,
   } = await getOrDeployPaymentsContractBlast(users, {
      superOwnerAddress: superOwner.address,
      usdTokenContractAddress: await ownerUsdTestContract.getAddress(),
      usdTokenSymbol: "TestUSD",
      usdTokenDecimals: 6,
   });

   await superOwnerPaymentsContractBlast.waitForDeployment();

   return {
      superOwner,
      owner,
      user1,
      user2,
      superOwnerPaymentsContractBlast,
      superOwnerUsdTestContract,
      ownerPaymentsContractBlast,
      user1PaymentsContractBlast,
      user2PaymentsContractBlast,
      ownerUsdTestContract,
      user1UsdTestContract,
   };
}
