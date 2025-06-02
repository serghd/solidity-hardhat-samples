import { expect } from "chai";

import { INITIAL_POSITIVE_CHECK_TEST_TITLE } from "../../common/test";
import { initCollections } from "../../test/multicollectionContract/utils";
import { fnName } from "./testData";
import { invTestData } from "./testData";

export function shouldBehaveCorrectMinting(): void {
   describe("minting", () => {
      describe("setURI", () => {
         beforeEach(async function () {
            await this.superOwnerMulticollectionContract.setURI(invTestData.uri);
            await this.superOwnerMulticollectionContract.setURIPostfix(invTestData.uriPostfix);
         });

         it("should procced the minting", async function () {
            await this.superOwnerMulticollectionContract[fnName.mint1P](this.owner.address, false);
            expect(await this.superOwnerMulticollectionContract.tokenURI(0)).eq(
               `${invTestData.uri}0.json`,
            );
            await this.superOwnerMulticollectionContract[fnName.mint1P](this.owner.address, false);
            expect(await this.superOwnerMulticollectionContract.tokenURI(0)).eq(
               `${invTestData.uri}0.json`,
            );
            expect(await this.superOwnerMulticollectionContract.tokenURI(1)).eq(
               `${invTestData.uri}1.json`,
            );
         });

         it("should procced the minting with count", async function () {
            await this.superOwnerMulticollectionContract[fnName.mint2P](
               this.owner.address,
               invTestData.tokenCount,
               false,
            );
            expect(await this.superOwnerMulticollectionContract.tokenURI(0)).eq(
               `${invTestData.uri}0.json`,
            );
         });

         it("should procced the batch minting", async function () {
            await this.superOwnerMulticollectionContract.mintBatch(
               [this.owner.address, this.user1.address, this.user2.address],
               false,
            );

            const tokenCount = await this.superOwnerMulticollectionContract.getTokenCount();

            for (let i = 0; i < tokenCount; i++) {
               expect(await this.superOwnerMulticollectionContract.tokenURI(i)).eq(
                  `${invTestData.uri}${i}.json`,
               );
            }
         });

         it("should procced minting with locked tokens", async function () {
            await this.superOwnerMulticollectionContract[fnName.mint1P](this.owner.address, true);
            expect(await this.superOwnerMulticollectionContract.tokenIsLocked(0)).eq(true);
         });

         it("unlock tokens", async function () {
            await this.superOwnerMulticollectionContract[fnName.mint1P](this.owner.address, true);
            const tokenId: number = 0;
            await this.superOwnerMulticollectionContract.lockToken(tokenId, false);
            expect(await this.superOwnerMulticollectionContract.tokenIsLocked(tokenId)).eq(false);
         });

         describe("setCommonTokenUri", () => {
            beforeEach(async function () {
               await this.superOwnerMulticollectionContract.setCommonTokenUri(true);
            });

            it(INITIAL_POSITIVE_CHECK_TEST_TITLE, async function () {
               expect(await this.superOwnerMulticollectionContract.getCommonTokenUri()).eq(true);
               expect(await this.superOwnerMulticollectionContract.tokenURI(0)).eq(
                  `${invTestData.uri}token.json`,
               );
            });
         });
      });

      it("should call createTokens correctly", async function () {
         await initCollections(this.superOwnerMulticollectionContract, this.owner.address);

         expect(await this.superOwnerMulticollectionContract.balanceOf(this.owner.address)).eq(
            invTestData.tokenCount,
         );
         expect(await this.superOwnerMulticollectionContract.ownerOf(0)).eq(this.owner.address);
         expect(await this.superOwnerMulticollectionContract.ownerOf(1)).eq(this.owner.address);
         expect(await this.superOwnerMulticollectionContract.ownerOf(2)).eq(this.owner.address);
         expect(await this.superOwnerMulticollectionContract.ownerOf(3)).eq(this.owner.address);
         expect(await this.superOwnerMulticollectionContract.ownerOf(4)).eq(this.owner.address);

         expect(await this.superOwnerMulticollectionContract.tokenURI(0)).eq(
            `${invTestData.uri}0.json`,
         );
         expect(await this.superOwnerMulticollectionContract.tokenURI(1)).eq(
            `${invTestData.uri}1.json`,
         );
      });
   });
}
