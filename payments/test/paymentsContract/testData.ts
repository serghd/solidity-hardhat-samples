import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

import { toWei } from "../../common/converts";
import { toUnixTime } from "../../common/misc";

export const PROD_PRICE = false;
export const PROD_DATA = false;

export const TOKEN_COUNT = 101;
export const USD_TEST_DECIMALS = 6;

// randomly generated, example: 99a4306f-1460-425f-8f87-789bd6a9c800
const transactionId0 = uuidv4();
const transactionId1 = uuidv4();

export const seedData = {
   zero: toWei(0),
   price0: toWei(30, USD_TEST_DECIMALS),
   price1: toWei(15, USD_TEST_DECIMALS),
   price2: toWei(1000, USD_TEST_DECIMALS),
   userInitialBalance0: toWei(1000, USD_TEST_DECIMALS),
   userInitialBalance1: toWei(2000, USD_TEST_DECIMALS),
   userInitialBalance2: toWei(3000, USD_TEST_DECIMALS),
   userInitialBalance3: toWei(6000, USD_TEST_DECIMALS),
   today: toUnixTime(),
   todayMinus1m: toUnixTime(dayjs().add(-1, "minute").toDate()),
   todayPlus1m: toUnixTime(dayjs().add(1, "minute").toDate()),
   todayPlus1h: toUnixTime(dayjs().add(1, "hour").toDate()),
   todayPlus3d1m: toUnixTime(dayjs().add(3, "day").add(1, "minute").toDate()),
   nullAddress: "0x0000000000000000000000000000000000000000",
   timeDelta: 300,
   attemps: 5,
   delayMs: 5000,
   transactionId0,
   transactionId1,
};

export const errorMessage = {
   onlySuperOwner: "Only superOwner has right to call this function",
   invalidSignature: "Invalid signature",
   onlyOwnerCanWithdraw: "only Owner can make Withdrawal with this Signature",
   onlyOwnerCanCancelTheSignature: "only Owner can cancel the Signature",
   signatureAlreadyExists: "This Signature is already exists",
   youHaveWithdrawalsInPending: "You have withdrawals in 'pending' status",
   signatureIsAlreadyUsedBefore: "this Signature is already used",
};

export enum Roles {
   SUPER_OWNER_ROLE = "0x8b1505cddb35f62ac075d7162e97e437accb1359b84bdfe7c73611681f2dc87c",
   OWNER_ROLE = "0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e",
}
