import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { MULTICOLLECTION_CONTRACT_NAME } from "../../constants";
import { shouldBehaveCorrectFetching } from "./MulticollectionContract.behavior.fetching";
import { shouldBehaveCorrectMinting } from "./MulticollectionContract.behavior.minting";
import { shouldBehaveCorrectRoles } from "./MulticollectionContract.behavior.roles";
import { shouldBehaveCorrectTransfer } from "./MulticollectionContract.behavior.transfer";
import { deployContractFixture } from "./MulticollectionContract.fixture";

describe(MULTICOLLECTION_CONTRACT_NAME, function () {
   before(async function () {
      this.loadFixture = loadFixture;
   });

   beforeEach(async function () {
      const {
         superOwner,
         owner,
         user1,
         user2,
         superOwnerMulticollectionContract,
         ownerMulticollectionContract,
         user1MulticollectionContract,
         user2MulticollectionContract,
      } = await this.loadFixture(deployContractFixture);
      this.superOwner = superOwner;
      this.owner = owner;
      this.user1 = user1;
      this.user2 = user2;
      this.superOwnerMulticollectionContract = superOwnerMulticollectionContract;
      this.ownerMulticollectionContract = ownerMulticollectionContract;
      this.user1MulticollectionContract = user1MulticollectionContract;
      this.user2MulticollectionContract = user2MulticollectionContract;
   });

   shouldBehaveCorrectFetching();
   shouldBehaveCorrectMinting();
   shouldBehaveCorrectTransfer();
   shouldBehaveCorrectRoles();
});
