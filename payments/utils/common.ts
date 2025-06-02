import { Signer } from "ethers";
import { BigNumberish, EventLog, Log } from "ethers";

import { signMessage } from "../common/cryptography";

export async function signMessageForWithdraw(
   signer: Signer,
   toAddress: string,
   amount: BigNumberish,
   transactionId: string,
) {
   return signMessage(signer, ["address", "uint256", "string"], [toAddress, amount, transactionId]);
}

export function splitNumberIntoTriplets(number: number | string): string {
   const numString = typeof number === "number" ? number.toString() : number;
   const reversedString = numString.split("").reverse().join("");
   const triplets = reversedString.match(/.{1,3}/g);
   const result = triplets ? triplets.join("_").split("").reverse().join("") : numString;
   return result;
}

export function getTransactionEventLogs(
   eventLogs: Array<EventLog | Log>,
   logName: string,
): Array<EventLog> {
   let res = new Array<EventLog>();

   for (const log of eventLogs) {
      if (log instanceof Object && "fragment" in log && log.fragment.name === logName) {
         res.push(log);
      }
   }

   return res;
}
