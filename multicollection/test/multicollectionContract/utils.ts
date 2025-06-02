import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Signer } from "ethers";

import { signMessage } from "../../common/cryptography";
import { StringNumber } from "../../common/types";
import { MulticollectionContract } from "../../typechain-types/contracts/MulticollectionContract";
import { fnName } from "./testData";
import { invTestData } from "./testData";
import { MulticollectionContextBase } from "./types";

export function getCollectionName(name: StringNumber) {
   return `collection ${name}`;
}

export async function initCollections(
   multicollectionContract: MulticollectionContract,
   userAddress: string,
   tokenCount = invTestData.tokenCount,
) {
   await multicollectionContract.setURI(invTestData.uri);
   await multicollectionContract.setURIPostfix(invTestData.uriPostfix);
   await multicollectionContract[fnName.mint2P](userAddress, tokenCount, false);
}

export async function validateStateAfterTransfer(
   that: MulticollectionContextBase,
   toAddress = that.user1.address,
   tokenCount = invTestData.tokenCount,
   tokenId = invTestData.tokenId0,
) {
   expect(await that.superOwnerMulticollectionContract.balanceOf(that.superOwner.address)).eq(
      tokenCount - 1,
   );
   expect(await that.superOwnerMulticollectionContract.balanceOf(toAddress)).eq(1);
   expect(await that.superOwnerMulticollectionContract.ownerOf(tokenId)).eq(toAddress);
}

export async function checkBalanceAndAddressItems(
   that: MulticollectionContextBase,
   user: SignerWithAddress,
   expected: bigint[],
) {
   const tokenCount = expected.length;

   expect(await that.superOwnerMulticollectionContract.balanceOf(user.address)).eq(tokenCount);

   let addressItem = await that.superOwnerMulticollectionContract.fetchAddressItem(user.address);
   expect(addressItem.tokens.length).eq(tokenCount);
   expect(addressItem.tokens).eql(expected);
}

export async function checkTransferAddressItems(that: MulticollectionContextBase) {
   await checkBalanceAndAddressItems(that, that.superOwner, [
      BigInt(1),
      BigInt(2),
      BigInt(3),
      BigInt(4),
   ]);
   await checkBalanceAndAddressItems(that, that.user1, [BigInt(0)]);
}

export function getWhiteList(that: MulticollectionContextBase) {
   return [that.user1.address, that];
}

export async function signMessageForClaim(
   signer: Signer,
   userAddress: string,
   tokenCount: number,
   sessionId: string,
) {
   return signMessage(
      signer,
      //tokenOwner, sessionId
      ["address", "uint32", "string"],
      [userAddress, tokenCount, sessionId],
   );
}

export function toUnixTime(value: string | Date = new Date()): number {
   return Math.floor(new Date(value).getTime() / 1000);
}
