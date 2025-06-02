import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";

import { vmEsceptionText } from "../../common/test";
import { seedData } from "./testData";
import { Roles, errorMessage } from "./testData";

async function upgradeContract(proxyContractAddress: string, owner: SignerWithAddress) {
   const paymentsContractFactory = await ethers.getContractFactory("PaymentsContractBlast", owner);

   /* const oldImplAddress = */ await upgrades.erc1967.getImplementationAddress(
      proxyContractAddress,
   );

   const proxyContract: Contract = await upgrades.upgradeProxy(
      proxyContractAddress,
      paymentsContractFactory,
   );

   /* const newImplAddress = */ await upgrades.erc1967.getImplementationAddress(
      await proxyContract.getAddress(),
   );

   expect(proxyContractAddress).eq(await proxyContract.getAddress());
}

export function shouldBehaveCorrectRoles(): void {
   describe("roles", () => {
      it("check initial roles", async function () {
         const superOwnerAddress: string = await this.ownerPaymentsContract._superOwner();
         const ownerAddress: string = await this.ownerPaymentsContract.owner();

         expect(superOwnerAddress).eq(this.superOwner.address);

         expect(
            await this.superOwnerPaymentsContract.hasRole(
               Roles.SUPER_OWNER_ROLE,
               superOwnerAddress,
            ),
         ).eq(true);
         expect(await this.superOwnerPaymentsContract.hasRole(Roles.OWNER_ROLE, ownerAddress)).eq(
            true,
         );

         expect(await this.ownerPaymentsContract.hasRole(Roles.OWNER_ROLE, this.user1.address)).eq(
            false,
         );
         expect(
            await this.superOwnerUsdTestContract.balanceOf(this.ownerPaymentsContract.getAddress()),
         ).equal(seedData.zero);
      });

      it("superOwner is allowed to upgrade contract", async function () {
         await upgradeContract(await this.ownerPaymentsContract.getAddress(), this.superOwner);
      });

      it("user isn't allowed to upgrade contract", async function () {
         const PaymentsContractFactoryBlast = await ethers.getContractFactory(
            "PaymentsContractBlast",
            this.user1,
         );

         await expect(
            upgrades.upgradeProxy(
               await this.ownerPaymentsContract.getAddress(),
               PaymentsContractFactoryBlast,
            ),
         ).rejectedWith(vmEsceptionText(errorMessage.onlySuperOwner));
      });

      describe("SuperOwner and Owner permissions", () => {
         it("initial check", async function () {
            expect(
               await this.superOwnerPaymentsContract.hasRole(
                  Roles.SUPER_OWNER_ROLE,
                  this.superOwner.address,
               ),
            ).eq(true);
            expect(
               await this.ownerPaymentsContract.hasRole(Roles.SUPER_OWNER_ROLE, this.owner.address),
            ).eq(false);
            expect(await this.superOwnerUsdTestContract.balanceOf(this.user1.address)).equal(
               seedData.zero,
            );
         });

         it("superOwner is allowed to upgrade contract", async function () {
            await upgradeContract(await this.ownerPaymentsContract.getAddress(), this.superOwner);
         });

         it("owner isn't allowed to upgrade contract", async function () {
            await expect(
               upgradeContract(await this.ownerPaymentsContract.getAddress(), this.owner),
            ).rejectedWith(vmEsceptionText(errorMessage.onlySuperOwner));
         });

         describe("change super owner", () => {
            beforeEach(async function () {
               await this.superOwnerPaymentsContract.transferSuperOwnership(this.owner.address);
            });
            it("initial check", async function () {
               expect(
                  await this.superOwnerPaymentsContract.hasRole(
                     Roles.SUPER_OWNER_ROLE,
                     this.superOwner,
                  ),
               ).eq(false);
               expect(
                  await this.ownerPaymentsContract.hasRole(
                     Roles.SUPER_OWNER_ROLE,
                     this.owner.address,
                  ),
               ).eq(true);
            });
            it("superOwner isn't allowed to upgrade contract", async function () {
               await expect(
                  upgradeContract(await this.ownerPaymentsContract.getAddress(), this.superOwner),
               ).rejectedWith(vmEsceptionText(errorMessage.onlySuperOwner));
            });

            it("owner is allowed to upgrade contract", async function () {
               await upgradeContract(
                  await this.superOwnerPaymentsContract.getAddress(),
                  this.owner,
               );
            });
         });
      });
   });
}
