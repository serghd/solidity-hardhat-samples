import { expect } from "chai";

export const INITIAL_POSITIVE_CHECK_TEST_TITLE = "initial positive check";

export async function expectThrowsAsync(method: () => Promise<any>, errorMessage: string) {
   let error: any = null;
   try {
      await method();
   } catch (err) {
      error = err;
   }
   expect(error).an("Error");
   if (errorMessage) {
      expect(error?.message).eq(errorMessage);
   }
}

export function vmEsceptionText(text: string) {
   return `VM Exception while processing transaction: reverted with reason string '${text}'`;
}

export function includes(text: any, value: string) {
   if (typeof text === "string") {
      return text.includes(value);
   }
   if (Array.isArray(text)) {
      for (const item of text) {
         if (item.includes(value)) {
            return true;
         }
      }
   }
   return false;
}

export function errorHandler(error: object, message: string) {
   if ("reason" in error) {
      expect(includes(error.reason, message)).eq(true);
   } else if ("message" in error) {
      expect(includes(error.message, message)).eq(true);
   }
}

export function getNow() {
   return Math.round(new Date().getTime() / 1000);
}

export const commonErrorMessage = {
   onlyOwner: "Ownable: caller is not the owner",
};
