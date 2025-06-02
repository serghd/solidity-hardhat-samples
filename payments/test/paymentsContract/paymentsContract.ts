import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { PAYMENTS_CONTRACT_BLAST_NAME } from "../../constants";
import { shouldBehaveCorrectFunding } from "./paymentsContract.behavior.funding";
import { shouldBehaveCorrectRoles } from "./paymentsContract.behavior.roles";
import { deployPaymentsContractFixture } from "./paymentsContract.fixture";

describe(PAYMENTS_CONTRACT_BLAST_NAME, function () {
   before(async function () {
      this.loadFixture = loadFixture;
   });

   beforeEach(async function () {
      const {
         superOwnerPaymentsContractBlast,
         superOwnerUsdTestContract,
         ownerPaymentsContractBlast,
         user1PaymentsContractBlast,
         user2PaymentsContractBlast,
         ownerUsdTestContract,
         user1UsdTestContract,
         superOwner,
         owner,
         user1,
         user2,
      } = await this.loadFixture(deployPaymentsContractFixture);

      this.superOwnerPaymentsContract = superOwnerPaymentsContractBlast;
      this.ownerPaymentsContract = ownerPaymentsContractBlast;
      this.user1PaymentsContract = user1PaymentsContractBlast;
      this.user2PaymentsContract = user2PaymentsContractBlast;
      this.superOwnerUsdTestContract = superOwnerUsdTestContract;
      this.ownerUsdTestContract = ownerUsdTestContract;
      this.user1UsdTestContract = user1UsdTestContract;
      this.superOwner = superOwner;
      this.owner = owner;
      this.user1 = user1;
      this.user2 = user2;
   });

   shouldBehaveCorrectFunding();
   shouldBehaveCorrectRoles();
});
