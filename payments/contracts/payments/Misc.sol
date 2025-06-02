// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

struct PendingWithdrawal {
   bytes32 hashId;
   string transactionId;
   address to;
   uint256 amount;
   uint64 createdAt;
   bytes signature;
}

struct WithdrawalStat {
   uint256 blockNumber;
   uint64 count;
}

struct SignatureStruct {
   address owner;
   address to;
   uint256 amount;
   bool exists;
   bool used;
   bytes transactionId;
}
