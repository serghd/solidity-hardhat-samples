// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./Array.sol";

contract AddressItems {
   using Array for uint256[];

   mapping(address => AddressItem) private _addressItems;

   struct AddressItem {
      uint256[] tokens;
   }

   function fetchAddressItem(address tokenOwner) public view returns (AddressItem memory) {
      return _addressItems[tokenOwner];
   }

   function addTokenToAddressItems(address tokenOwner, uint256 tokenId) internal {
      _addressItems[tokenOwner].tokens.insert(tokenId);
      // _addressItems[tokenOwner].tokens.orderedInsert(tokenId);
   }

   function removeTokenFromAddressItems(address tokenOwner, uint256 tokenId) internal {
      AddressItem storage addressItem = _addressItems[tokenOwner];
      uint256 index = addressItem.tokens.findIndex(tokenId);
      addressItem.tokens.orderedRemove(index);
   }

   function transferTokenInAddressItems(address from, address to, uint256 tokenId) internal {
      removeTokenFromAddressItems(from, tokenId);
      addTokenToAddressItems(to, tokenId);
   }
}
