// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSD is ERC20, ERC20Burnable, Ownable {
   uint8 _decimals;

   constructor(uint8 decimals_) ERC20("Test USD Token", "tUSD") {
      _decimals = decimals_;
   }

   function mint(address to, uint256 amount) public onlyOwner {
      _mint(to, amount);
   }

   function decimals() public view override returns (uint8) {
      return _decimals;
   }
}
