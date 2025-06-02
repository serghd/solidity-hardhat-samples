export class DiffArray {
   private _values: number[];

   constructor(values?: number[]) {
      this._values = values ?? [];
   }

   public store(values: number[]) {
      this._values = values;
   }

   public diff(values: number[]) {
      if (this._values.length !== values.length) {
         return [];
      }

      const result: number[] = [];
      for (const index in this._values) {
         result.push(values[index] - this._values[index]);
      }
      return result;
   }

   public get values() {
      return this._values;
   }
}
