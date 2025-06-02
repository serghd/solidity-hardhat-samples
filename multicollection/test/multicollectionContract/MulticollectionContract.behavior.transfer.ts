import { expect } from "chai";

import {
   INITIAL_POSITIVE_CHECK_TEST_TITLE,
   vmEsceptionText,
   vmEsceptionText2,
} from "../../common/test";
import {
   checkBalanceAndAddressItems,
   checkTransferAddressItems,
   initCollections,
   validateStateAfterTransfer,
} from "../../test/multicollectionContract/utils";
import { fnName } from "./testData";
import { invTestData } from "./testData";
import { petobotErrorMessage } from "./testData";

export function shouldBehaveCorrectTransfer(): void {
   describe("transfer", () => {
      describe("initCollectionsReal", () => {
         beforeEach(async function () {
            await initCollections(this.superOwnerMulticollectionContract, this.superOwner.address);
         });

         it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
            await checkBalanceAndAddressItems(this, this.superOwner, [
               BigInt(0),
               BigInt(1),
               BigInt(2),
               BigInt(3),
               BigInt(4),
            ]);
         });

         it("should call transferFrom correctly", async function () {
            await this.superOwnerMulticollectionContract.transferFrom(
               this.superOwner.address,
               this.user1.address,
               invTestData.tokenId0,
            );
            await validateStateAfterTransfer(this);
            await checkTransferAddressItems(this);
         });

         it("should call safeTransferFrom(3 params) correctly", async function () {
            await this.superOwnerMulticollectionContract[fnName.safeTransferFrom3P](
               this.superOwner.address,
               this.user1.address,
               invTestData.tokenId0,
            );
            await validateStateAfterTransfer(this);
            await checkTransferAddressItems(this);
         });

         it("throw error when user1 tries to transfer unapproved", async function () {
            const errStr: string =
               petobotErrorMessage.callerIsNotTokenOwnerOrApproved2 +
               '("' +
               this.user1.address +
               '", ' +
               invTestData.tokenId0 +
               ")";
            await expect(
               this.user1MulticollectionContract[fnName.safeTransferFrom3P](
                  this.superOwner.address,
                  this.user1.address,
                  invTestData.tokenId0,
               ),
            ).rejectedWith(vmEsceptionText2(errStr));
         });

         describe("burn", () => {
            beforeEach(async function () {
               await this.superOwnerMulticollectionContract.burn(invTestData.tokenId0);
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
               await checkBalanceAndAddressItems(this, this.superOwner, [
                  BigInt(1),
                  BigInt(2),
                  BigInt(3),
                  BigInt(4),
               ]);
            });

            it("throw error when owner tries to transfer burnt token using safeTransferFrom(3 params)", async function () {
               await expect(
                  this.superOwnerMulticollectionContract[fnName.safeTransferFrom3P](
                     this.superOwner.address,
                     this.user1.address,
                     invTestData.tokenId0,
                  ),
               ).rejectedWith(vmEsceptionText(petobotErrorMessage.couldntFindIndex));
            });
         });

         describe("setApprovalForAll", () => {
            beforeEach(async function () {
               await this.superOwnerMulticollectionContract.setApprovalForAll(
                  this.user1.address,
                  true,
               );
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
               expect(
                  await this.superOwnerMulticollectionContract.isApprovedForAll(
                     this.superOwner.address,
                     this.user1.address,
                  ),
               ).eq(true);
            });
         });

         describe("transferFrom", () => {
            beforeEach(async function () {
               await this.superOwnerMulticollectionContract.transferFrom(
                  this.superOwner.address,
                  this.user1.address,
                  invTestData.tokenId4,
               );
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
               await checkBalanceAndAddressItems(this, this.superOwner, [
                  BigInt(0),
                  BigInt(1),
                  BigInt(2),
                  BigInt(3),
               ]);
               await checkBalanceAndAddressItems(this, this.user1, [BigInt(4)]);
            });

            describe("transferFrom", () => {
               beforeEach(async function () {
                  await this.superOwnerMulticollectionContract.transferFrom(
                     this.superOwner.address,
                     this.user1.address,
                     invTestData.tokenId3,
                  );
               });

               it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                  await checkBalanceAndAddressItems(this, this.superOwner, [
                     BigInt(0),
                     BigInt(1),
                     BigInt(2),
                  ]);
                  await checkBalanceAndAddressItems(this, this.user1, [BigInt(4), BigInt(3)]);
               });

               describe("transferFrom", () => {
                  beforeEach(async function () {
                     await this.superOwnerMulticollectionContract.transferFrom(
                        this.superOwner.address,
                        this.user1.address,
                        invTestData.tokenId2,
                     );
                  });

                  it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
                     await checkBalanceAndAddressItems(this, this.superOwner, [
                        BigInt(0),
                        BigInt(1),
                     ]);
                     await checkBalanceAndAddressItems(this, this.user1, [
                        BigInt(4),
                        BigInt(3),
                        BigInt(2),
                     ]);
                  });
               });
            });
         });
      });
   });
}
