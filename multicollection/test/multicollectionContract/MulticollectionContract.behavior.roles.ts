import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

import { INITIAL_POSITIVE_CHECK_TEST_TITLE } from "../../common/test";
import { MulticollectionContract } from "../../typechain-types/contracts/MulticollectionContract";
import { Roles } from "./testData";
import { initCollections } from "./utils";

async function upgradeContract(MulticollectionContractAddress: string, owner: SignerWithAddress) {
   const MulticollectionContractFactory = await ethers.getContractFactory(
      "MulticollectionContract",
      owner,
   );

   await upgrades.upgradeProxy(MulticollectionContractAddress, MulticollectionContractFactory);
}

export function shouldBehaveCorrectRoles(): void {
   describe("roles", () => {
      beforeEach(async function () {
         let mc = this.superOwnerMulticollectionContract as MulticollectionContract;
         await initCollections(mc, this.user1.address);
      });

      it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
         expect(await this.superOwnerMulticollectionContract.superOwner()).eq(
            this.superOwner.address,
         );
         expect(await this.ownerMulticollectionContract.owner()).eq(this.superOwner.address);

         // superOwner
         expect(
            await this.superOwnerMulticollectionContract.hasRole(
               Roles.SUPER_OWNER_ROLE,
               this.superOwner.address,
            ),
         ).eq(true);
         expect(
            await this.superOwnerMulticollectionContract.hasRole(
               Roles.OWNER_ROLE,
               this.superOwner.address,
            ),
         ).eq(true);

         // user1
         expect(
            await this.superOwnerMulticollectionContract.hasRole(
               Roles.SUPER_OWNER_ROLE,
               this.user1.address,
            ),
         ).eq(false);
         expect(
            await this.superOwnerMulticollectionContract.hasRole(
               Roles.OWNER_ROLE,
               this.user1.address,
            ),
         ).eq(false);
      });

      it("superOwner is allowed to upgrade contract", async function () {
         await upgradeContract(
            await this.superOwnerMulticollectionContract.getAddress(),
            this.superOwner,
         );
      });
   });
}
