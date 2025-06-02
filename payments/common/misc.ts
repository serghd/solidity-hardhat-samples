import { BigNumberish } from "ethers";
import _ from "lodash";

import { toNumber } from "./converts";

export function printBigNumber(value: BigNumberish, factor = 1, fractionDigits = 3): string {
   return toNumber(value, factor).toFixed(fractionDigits);
}

export function toUnixTime(value: string | Date = new Date()): number {
   return Math.floor(new Date(value).getTime() / 1000);
}

export function numberToByteArray(value: number, bytesNumber = 4): number[] {
   var byteArray = new Array(bytesNumber).fill(0);

   for (var index = byteArray.length - 1; index >= 0; index--) {
      var byte = value & 0xff;
      byteArray[index] = byte;
      value = (value - byte) / 256;
   }

   return byteArray;
}

export function byteArrayToNumber(byteArray: number[]): number {
   var value = 0;
   for (var i = byteArray.length - 1; i >= 0; i--) {
      value = value * 256 + byteArray[i];
   }

   return value;
}

export function printJson(value: any) {
   return JSON.stringify(value, null, 2);
}

export const sleep = (ms: number): any => {
   return new Promise((resolve) => setTimeout(resolve, ms));
};
