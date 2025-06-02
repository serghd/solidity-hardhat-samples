import { expect } from "chai";

import { multicollectionContractAttrs } from "../../constants";
import { invTestData } from "../../test/multicollectionContract/testData";
import { initCollections } from "../../test/multicollectionContract/utils";

export function shouldBehaveCorrectFetching(): void {
   describe("fetching", () => {
      it("should return correct initial state", async function () {
         expect(await this.superOwnerMulticollectionContract.name()).eq(
            multicollectionContractAttrs.name,
         );
         expect(await this.superOwnerMulticollectionContract.symbol()).eq(
            multicollectionContractAttrs.symbol,
         );
         expect(
            await this.superOwnerMulticollectionContract.isApprovedForAll(
               this.superOwner.address,
               this.user1.address,
            ),
         ).eq(false);

         const addressItem = await this.superOwnerMulticollectionContract.fetchAddressItem(
            this.user1.address,
         );
         expect(addressItem.tokens.length).eq(0);
      });

      describe("initCollectionsReal", () => {
         beforeEach(async function () {
            await initCollections(this.superOwnerMulticollectionContract, this.user1.address);
         });

         it("should call getTokenCount correctly", async function () {
            expect(await this.superOwnerMulticollectionContract.getTokenCount()).eq(
               invTestData.tokenCount,
            );
         });
      });
   });
}
