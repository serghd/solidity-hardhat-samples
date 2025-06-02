import { expect } from "chai";

import { includes } from "./test";

describe("Test", () => {
   describe("includes", () => {
      it("String negative case ", async function () {
         const array = "some error1";
         const result = includes(array, "fake");
         expect(result).eq(false);
      });

      it("String positive case", async function () {
         const array = "some error1";
         const result = includes(array, "error1");
         expect(result).eq(true);
      });

      it("String negative case ", async function () {
         const array = ["dfsdfdsf", "some error1"];
         const result = includes(array, "fake");
         expect(result).eq(false);
      });

      it("String positive case ", async function () {
         const array = ["dfsdfdsf", "some error1"];
         const result = includes(array, "error1");
         expect(result).eq(true);
      });
   });
});
