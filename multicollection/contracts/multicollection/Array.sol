// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

library Array {
   function insert(uint256[] storage arr, uint256 value) internal {
      arr.push(value);
   }

   //ToDo: fix it
   function orderedInsert(uint256[] storage arr, uint256 value) internal {
      arr.push(0);
      bool broken = false;
      for (uint256 i = uint256(arr.length - 1); i > 0; i--) {
         if (arr[i] > value) {
            arr[i] = arr[i - 1];
         } else {
            arr[i] = value;
            broken = true;
            break;
         }
      }
      if (!broken) {
         arr[0] = value;
      }
   }

   function remove(uint256[] storage arr, uint256 index) internal {
      require(arr.length > 0, "Can't remove from empty array");
      arr[index] = arr[arr.length - 1];
      arr.pop();
   }

   function orderedRemove(uint256[] storage arr, uint256 index) internal {
      require(arr.length > 0, "Can't remove from empty array");
      for (uint256 i = index; i < arr.length - 1; i++) {
         arr[i] = arr[i + 1];
      }
      arr.pop();
   }

   function findIndex(uint256[] storage arr, uint256 value) internal view returns (uint256) {
      for (uint256 i = 0; i < arr.length; i++) {
         if (arr[i] == value) {
            return i;
         }
      }
      revert("Couldn't find index");
   }
}
