import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractTransactionReceipt, EventFragment, EventLog } from "ethers";
import { getUserByAddress } from "~utils/context";

import { waitTx } from "../../common/deploy";
import { getNow, vmEsceptionText } from "../../common/test";
import { getTransactionEventLogs, signMessageForWithdraw } from "../../utils/common";
import { errorMessage, seedData } from "./testData";
import { EventName } from "./types";

export function shouldBehaveCorrectFunding(): void {
   describe("funding", () => {
      it("should return 0 balances for owner and all users", async function () {
         const ownerBalance = await this.ownerUsdTestContract.balanceOf(this.superOwner.address);
         expect(ownerBalance).equal(seedData.zero);

         const user1Balance = await this.ownerUsdTestContract.balanceOf(this.user1.address);
         expect(user1Balance).equal(seedData.zero);

         const user2Balance = await this.ownerUsdTestContract.balanceOf(this.user2.address);
         expect(user2Balance).equal(seedData.zero);
      });

      it("should return correct balances for owner and all users after minting", async function () {
         await this.superOwnerUsdTestContract.mint(
            this.superOwner.address,
            seedData.userInitialBalance0,
         );

         await this.superOwnerUsdTestContract.mint(
            this.user1.address,
            seedData.userInitialBalance1,
         );
         await this.superOwnerUsdTestContract.mint(
            this.user2.address,
            seedData.userInitialBalance2,
         );

         expect(
            await this.ownerUsdTestContract.balanceOf(
               await this.ownerPaymentsContract.getAddress(),
            ),
         ).equal(seedData.zero);
         expect(await this.ownerUsdTestContract.balanceOf(this.superOwner.address)).equal(
            seedData.userInitialBalance0,
         );
         expect(await this.ownerUsdTestContract.balanceOf(this.user1.address)).equal(
            seedData.userInitialBalance1,
         );
         expect(await this.ownerUsdTestContract.balanceOf(this.user2.address)).equal(
            seedData.userInitialBalance2,
         );
         expect(await this.ownerUsdTestContract.totalSupply()).equal(seedData.userInitialBalance3);
      });

      it("user1 deposited funds", async function () {
         await this.superOwnerUsdTestContract.mint(
            this.user1.address,
            seedData.userInitialBalance0,
         );

         await this.user1UsdTestContract.approve(
            await this.ownerPaymentsContract.getAddress(),
            seedData.price0,
         );

         const receipt: ContractTransactionReceipt = await waitTx(
            this.user1PaymentsContract.deposit(seedData.price0, "1"),
         );
         const evLog: EventLog = receipt.logs[2] as EventLog;
         expect(evLog.fragment.name == EventName.Deposit);
         const { account, amount, timestamp } = evLog.args;
         expect(account).equal(this.user1.address);
         expect(amount).equal(seedData.price0);
         expect(timestamp).closeTo(getNow(), seedData.timeDelta);
      });

      describe("user1 deposited funds", () => {
         beforeEach(async function () {
            await this.superOwnerUsdTestContract.mint(
               this.user1.address,
               seedData.userInitialBalance0,
            );
            await this.user1UsdTestContract.approve(
               await this.ownerPaymentsContract.getAddress(),
               seedData.price0,
            );
            await this.user1PaymentsContract.deposit(seedData.price0, seedData.transactionId0);
         });

         it("initial positive check", async function () {
            expect(await this.user1UsdTestContract.balanceOf(this.user1.address)).equal(
               (seedData.userInitialBalance0 -= seedData.price0),
            );
            expect(
               await this.user1UsdTestContract.balanceOf(
                  await this.ownerPaymentsContract.getAddress(),
               ),
            ).equal(seedData.price0);
            expect(await this.user1UsdTestContract.totalSupply()).equal(
               seedData.userInitialBalance0 + seedData.price0,
            );
         });

         it("user1 makes withdraw", async function () {
            const contractSuperOwnerAddress: string =
               await this.ownerPaymentsContract._superOwner();
            const contractSuperOwnerSigner: SignerWithAddress = await getUserByAddress(
               contractSuperOwnerAddress,
            );

            const signature: string = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price0,
               seedData.transactionId0,
            );

            await expect(
               this.ownerPaymentsContract.withdrawUsingSignature(
                  seedData.transactionId0,
                  signature,
               ),
            ).rejectedWith(vmEsceptionText(errorMessage.onlyOwnerCanWithdraw));

            await this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price0,
               seedData.transactionId0,
               signature,
            );

            await expect(
               this.user1PaymentsContract.cancelWithdrawalSignature(
                  seedData.transactionId0,
                  signature,
               ),
            ).rejectedWith(vmEsceptionText(errorMessage.onlyOwnerCanCancelTheSignature));

            await this.ownerPaymentsContract.cancelWithdrawalSignature(
               seedData.transactionId0,
               signature,
            );

            await expect(
               this.ownerPaymentsContract.addWithdrawalSignature(
                  this.user1.address,
                  seedData.price0,
                  seedData.transactionId0,
                  signature,
               ),
            ).rejectedWith(vmEsceptionText(errorMessage.signatureAlreadyExists));

            const signature2: string = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price1,
               seedData.transactionId1,
            );

            await this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price1,
               seedData.transactionId1,
               signature2,
            );

            await this.ownerPaymentsContract.withdrawUsingSignature(
               seedData.transactionId1,
               signature2,
            );
         });

         it("user1 makes next withdraw while his first withdraw is in pending", async function () {
            await this.superOwnerUsdTestContract.mint(
               this.user1.address,
               seedData.userInitialBalance3,
            );
            await this.user1UsdTestContract.approve(
               await this.ownerPaymentsContract.getAddress(),
               seedData.userInitialBalance3,
            );
            await this.user1PaymentsContract.deposit(
               seedData.userInitialBalance3,
               seedData.transactionId1,
            );

            const contractSuperOwnerAddress: string =
               await this.ownerPaymentsContract._superOwner();
            const contractSuperOwnerSigner: SignerWithAddress = await getUserByAddress(
               contractSuperOwnerAddress,
            );

            const signature: string = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price2,
               seedData.transactionId0,
            );

            await this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price2,
               seedData.transactionId0,
               signature,
            );

            await waitTx(
               this.ownerPaymentsContract.withdrawUsingSignature(
                  seedData.transactionId0,
                  signature,
               ),
            );

            const signature2: string = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price2,
               seedData.transactionId1,
            );

            await this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price2,
               seedData.transactionId1,
               signature2,
            );

            await expect(
               this.ownerPaymentsContract.withdrawUsingSignature(
                  seedData.transactionId1,
                  signature2,
               ),
            ).rejectedWith(vmEsceptionText(errorMessage.youHaveWithdrawalsInPending));
         });

         it("user1 makes next withdraw while his first withdraw was approved by admin", async function () {
            await this.superOwnerUsdTestContract.mint(
               this.user1.address,
               seedData.userInitialBalance3,
            );
            await this.user1UsdTestContract.approve(
               await this.ownerPaymentsContract.getAddress(),
               seedData.userInitialBalance3,
            );
            await this.user1PaymentsContract.deposit(seedData.userInitialBalance3, "2");

            const contractBalance = await this.ownerUsdTestContract.balanceOf(
               await this.ownerPaymentsContract.getAddress(),
            );
            expect(contractBalance).equal(seedData.price0 + seedData.userInitialBalance3);

            const contractSuperOwnerAddress: string =
               await this.ownerPaymentsContract._superOwner();
            const contractSuperOwnerSigner: SignerWithAddress = await getUserByAddress(
               contractSuperOwnerAddress,
            );

            const signature: string = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price2,
               seedData.transactionId0,
            );

            await this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price2,
               seedData.transactionId0,
               signature,
            );

            const receipt: ContractTransactionReceipt = await waitTx(
               this.ownerPaymentsContract.withdrawUsingSignature(
                  seedData.transactionId0,
                  signature,
               ),
            );

            const logs: Array<EventLog> = getTransactionEventLogs(
               receipt.logs,
               "WithdrawInPending",
            );
            expect(logs.length > 0, "invalid logs passed");
            const transactionIdHash: string = logs[0].args[3];

            // approve pending transaction by admin
            await this.superOwnerPaymentsContract.approvePendingWithdrawal(transactionIdHash, true);

            const signature2: string = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price2,
               seedData.transactionId1,
            );

            await this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price2,
               seedData.transactionId1,
               signature2,
            );

            // put in pending again
            await this.ownerPaymentsContract.withdrawUsingSignature(
               seedData.transactionId1,
               signature2,
            );
            const contractBalance2 = await this.ownerUsdTestContract.balanceOf(
               await this.ownerPaymentsContract.getAddress(),
            );
            expect(contractBalance2).equal(
               seedData.price0 + seedData.userInitialBalance3 - seedData.price2,
            );
         });

         it("should throw error when user2 tries to withdraw incorrect signature", async function () {
            const signature = await signMessageForWithdraw(
               this.owner,
               this.user1.address,
               seedData.price0,
               seedData.transactionId0,
            );

            await expect(
               this.ownerPaymentsContract.addWithdrawalSignature(
                  this.user1.address,
                  seedData.price0,
                  seedData.transactionId0,
                  signature,
               ),
            ).rejectedWith(vmEsceptionText(errorMessage.invalidSignature));
         });

         it("should throw error when user1 tries to withdraw twice", async function () {
            const contractSuperOwnerAddress: string =
               await this.ownerPaymentsContract._superOwner();
            const contractSuperOwnerSigner: SignerWithAddress = await getUserByAddress(
               contractSuperOwnerAddress,
            );

            const signature = await signMessageForWithdraw(
               contractSuperOwnerSigner,
               this.user1.address,
               seedData.price1,
               seedData.transactionId0,
            );

            this.ownerPaymentsContract.addWithdrawalSignature(
               this.user1.address,
               seedData.price1,
               seedData.transactionId0,
               signature,
            ),
               await this.ownerPaymentsContract.withdrawUsingSignature(
                  seedData.transactionId0,
                  signature,
               );

            await expect(
               this.ownerPaymentsContract.withdrawUsingSignature(
                  seedData.transactionId0,
                  signature,
               ),
            ).rejectedWith(vmEsceptionText(errorMessage.signatureIsAlreadyUsedBefore));
         });
      });
   });
}
