import { BigNumberish, ethers, formatUnits } from "ethers";

import { StringNumber } from "./types";

export function toWei(value: StringNumber, unitName?: BigNumberish) {
   return ethers.parseUnits(String(value), unitName);
}

export function toNumber(value: BigNumberish, factor = 1): number {
   return Number(ethers.formatEther(value)) * factor;
}

export function toNumberDecimals(value: BigNumberish, decimals = 18): number {
   return Number(formatUnits(value, decimals));
}
