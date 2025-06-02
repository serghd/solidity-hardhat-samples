import { expect } from "chai";

import { DiffArray } from "./DiffArray";

describe("DiffArray", () => {
   it("should correct call diff, constuctor", async function () {
      const array = [1, 1, 2];
      const diffArray = new DiffArray(array);
      expect(diffArray.values).eql(array);
      const diff = diffArray.diff([1, 2, 3]);
      expect(diff).eql([0, 1, 1]);
   });

   it("should correct call diff, store", async function () {
      const diffArray = new DiffArray();
      diffArray.store([1, 1, 2]);
      const diff = diffArray.diff([1, 2, 3]);
      expect(diff).eql([0, 1, 1]);
   });
});
