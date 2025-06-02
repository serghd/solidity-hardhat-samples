// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

import "./payments/Misc.sol";

import "./blast/IBlast.sol";
import "./blast/IERC20Rebasing.sol";
import "./blast/IBlastPoints.sol";

contract PaymentsContractBlast is
   Initializable,
   OwnableUpgradeable,
   UUPSUpgradeable,
   ReentrancyGuardUpgradeable,
   AccessControlUpgradeable
{
   function initialize(
      address superOwner_,
      address usdTokenAddress,
      string calldata usdTokenSymbol,
      uint8 usdDecimals
   ) public initializer {
      __Ownable_init();
      __AccessControl_init();
      __ReentrancyGuard_init();

      _superOwner = superOwner_;
      _usdToken = IERC20Upgradeable(usdTokenAddress);
      _usdTokenSymbol = usdTokenSymbol;

      _grantRole(SUPER_OWNER_ROLE, _superOwner);
      _grantRole(OWNER_ROLE, _superOwner);

      _withdrawalApproveWallet = owner();
      _amountForPendingLow = 50 * (10 ** usdDecimals);
      _amountForPendingHigh = 500 * (10 ** usdDecimals);
      _blocksPerDay = 7000;
      _withdrawalNoPendingLimit = 10;
   }

   function _authorizeUpgrade(address newImplementation) internal override onlySuperOwnerRole {}

   using StringsUpgradeable for uint64;
   using StringsUpgradeable for uint256;
   using ECDSAUpgradeable for bytes32;
   using EnumerableSetUpgradeable for EnumerableSetUpgradeable.Bytes32Set;

   // members----------------------------------------------------

   bytes32 private constant SUPER_OWNER_ROLE = keccak256("SUPER_OWNER_ROLE");
   bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");

   address public _superOwner;
   IERC20Upgradeable public _usdToken;
   string public _usdTokenSymbol;

   EnumerableSetUpgradeable.Bytes32Set private _depositHashes;
   EnumerableSetUpgradeable.Bytes32Set private _withdrawalHashes; // deprecated
   EnumerableSetUpgradeable.Bytes32Set private _pendingWithdrawalHashes;

   mapping(bytes32 hashId => PendingWithdrawal) public _pendingWithdrawals;
   mapping(address userAddress => WithdrawalStat) public _withdrawalStats;
   mapping(address userAddress => uint256) public _userDepositAmounts;
   mapping(address userAddress => uint256) public _userWithdrawalAmounts;
   mapping(address userAddress => uint64) public _userPendingWithdrawalCounters;

   uint256 public _amountForPendingLow;
   uint256 public _amountForPendingHigh;
   address public _withdrawalApproveWallet;

   uint64 public _withdrawalNoPendingLimit;
   uint64 public _blocksPerDay;
   uint256 public _depositAmountCounter;
   uint256 public _withdrawAmountCounter;

   IBlast public constant _BLAST = IBlast(0x4300000000000000000000000000000000000002);
   IERC20Rebasing public _USDB;
   IERC20Rebasing public _WETHB;
   address public _blastPointsAddress;

   mapping(bytes signature => SignatureStruct) public _withdrawalSignatures;

   // events -------------------------------------------------------

   event Deposit(address indexed account, bytes transactionId, uint256 amount, uint64 timestamp);
   event AddSignature(
      address indexed account,
      bytes transactionId,
      bytes signature,
      uint64 timestamp
   );
   event CancelSignature(
      address indexed account,
      bytes transactionId,
      uint256 amount,
      bytes signature,
      uint64 timestamp
   );
   event Withdraw(
      address indexed account,
      bytes transactionId,
      uint256 amount,
      bytes signature,
      uint64 timestamp
   );
   event WithdrawInPending(
      address indexed account,
      bytes transactionId,
      uint256 amount,
      bytes32 withdrawalHash,
      bytes signature,
      uint64 timestamp
   );
   event WithdrawDeclinedByAdmin(
      address indexed account,
      bytes transactionId,
      uint256 amount,
      bytes signature,
      uint64 timestamp
   );
   event EventConfigureBlastGovernor(address governorAddress);
   event EventConfigureBlastOperator(
      address blastPointsContractAddress,
      address blastPointsOperator
   );
   event EventConfigureBlastYieldModes(uint8 usdbYieldMode, uint8 wethYieldMode);
   event EventClaimBlastYieldAll(
      address indexed recipient,
      uint256 amountWETH,
      uint256 amountUSDB,
      uint256 amountGas
   );
   event EventClaimBlastGas(address indexed recipient, uint256 amount);

   // modifiers ----------------------------------------------------

   modifier onlySuperOwnerRole() {
      require(
         hasRole(SUPER_OWNER_ROLE, _msgSender()),
         "Only superOwner has right to call this function"
      );
      _;
   }

   modifier onlyOwnerRole() {
      require(hasRole(OWNER_ROLE, _msgSender()), "Only Owner has right to call this function");
      _;
   }

   modifier onlyWithdrawalApproveWallet() {
      require(
         _msgSender() == _withdrawalApproveWallet,
         "Only _withdrawalApproveWallet has right to call this function"
      );
      _;
   }

   // functions ----------------------------------------------------

   function transferSuperOwnership(address to) public onlySuperOwnerRole {
      _revokeRole(SUPER_OWNER_ROLE, _superOwner);
      _superOwner = to;
      _grantRole(SUPER_OWNER_ROLE, _superOwner);
   }

   function transferOwnership(address newOwner) public virtual override onlyOwnerRole {
      _revokeRole(OWNER_ROLE, owner());
      super._transferOwnership(newOwner);
      _grantRole(OWNER_ROLE, newOwner);
   }

   // last test-name: setUSDAddress8
   function setUSDAddress(address usdTokenAddress) external onlyOwnerRole {
      _usdToken = IERC20Upgradeable(usdTokenAddress);
   }

   function setBlocksPerDay(uint64 blocksPerDay_) external onlyOwnerRole {
      _blocksPerDay = blocksPerDay_;
   }

   function setWithdrawalNoPendingLimit(uint64 limit) external onlyOwnerRole {
      _withdrawalNoPendingLimit = limit;
   }

   function _addDepositHash(bytes32 transactionIdHash) private {
      require(!_depositHashes.contains(transactionIdHash), "This transactionId was used before");
      _depositHashes.add(transactionIdHash);
   }

   function deposit(uint256 amount, string memory transactionId) external nonReentrant {
      address sender = _msgSender();

      require(amount > 0, "amount must be greater than 0");
      require(bytes(transactionId).length > 0, "transactionId must not be empty");

      require(
         _usdToken.allowance(sender, address(this)) >= amount,
         "User must allow to use of funds"
      );
      require(_usdToken.balanceOf(sender) >= amount, "User must have funds");

      bytes32 transactionIdHash = keccak256(abi.encodePacked(transactionId));
      _addDepositHash(transactionIdHash);

      _increaseDepositCounters(sender, amount);
      _usdToken.transferFrom(sender, address(this), amount);

      emit Deposit(sender, bytes(transactionId), amount, uint64(block.timestamp));
   }

   function _getDelta(address user) private view returns (int256) {
      return int256(_userDepositAmounts[user]) - int256(_userWithdrawalAmounts[user]);
   }

   function _updateWithdrawalStat(address user, uint256 blockNumber, uint64 count) private {
      _withdrawalStats[user] = WithdrawalStat(blockNumber = blockNumber, count = count);
   }

   function _verifySignature(
      address to,
      uint256 amount,
      string memory transactionId,
      bytes memory signature
   ) private view returns (bool) {
      bytes32 messageHash = keccak256(abi.encodePacked(to, amount, transactionId));
      address recover = messageHash.toEthSignedMessageHash().recover(signature);
      return recover == owner();
   }

   function _addWithdrawalSignature(
      address owner,
      address to,
      uint256 amount,
      bytes memory signature,
      bytes memory transactionId
   ) private {
      require(!_withdrawalSignatures[signature].exists, "This Signature is already exists");
      _withdrawalSignatures[signature] = SignatureStruct(
         owner,
         to,
         amount,
         true,
         false,
         transactionId
      );
   }

   function _markWithdrawalSignatureAsUsed(
      bytes memory signature,
      SignatureStruct memory signObj
   ) private {
      require(!signObj.used, "This Signature is already used");
      _withdrawalSignatures[signature] = SignatureStruct(
         signObj.owner,
         signObj.to,
         signObj.amount,
         signObj.exists,
         true,
         signObj.transactionId
      );
   }

   function addWithdrawalSignature(
      address to,
      uint256 amount,
      string memory transactionId,
      bytes memory signature
   ) external {
      require(amount > 0, "amount must be greater than 0");
      require(_verifySignature(to, amount, transactionId, signature), "Invalid signature");
      bytes32 hashId = keccak256(abi.encodePacked(transactionId));
      // backward compatibility
      require(!_withdrawalHashes.contains(hashId), "This transactionIdHash was used before");
      address sender = _msgSender();
      _addWithdrawalSignature(sender, to, amount, signature, bytes(transactionId));
      emit AddSignature(sender, bytes(transactionId), signature, uint64(block.timestamp));
   }

   function cancelWithdrawalSignature(
      string memory transactionId,
      bytes memory signature
   ) external {
      address sender = _msgSender();
      SignatureStruct storage signObj = _withdrawalSignatures[signature];
      require(signObj.owner == sender, "only Owner can cancel the Signature");

      _markWithdrawalSignatureAsUsed(signature, signObj);
      emit CancelSignature(
         sender,
         bytes(transactionId),
         signObj.amount,
         signature,
         uint64(block.timestamp)
      );
   }

   function withdrawUsingSignature(
      string memory transactionId,
      bytes memory signature
   ) external nonReentrant {
      address sender = _msgSender();
      SignatureStruct storage signObj = _withdrawalSignatures[signature];
      require(!signObj.used, "this Signature is already used");
      require(signObj.owner == sender, "only Owner can make Withdrawal with this Signature");
      require(
         _usdToken.balanceOf(address(this)) >= signObj.amount,
         "Contract must have sufficient funds"
      );

      address to = signObj.to;
      uint256 amount = signObj.amount;
      require(
         getPendingWithdrawalsByUser(to).length == 0,
         "You have withdrawals in 'pending' status"
      );

      _markWithdrawalSignatureAsUsed(signature, signObj);

      WithdrawalStat storage withdrawalStat = _withdrawalStats[to];
      uint256 delta = uint256(_getDelta(to));

      bool putInPending = false;
      if ((amount > delta) && (amount > _amountForPendingLow)) {
         putInPending = true;
      } else if ((amount <= delta) && (amount > _amountForPendingHigh)) {
         putInPending = true;
      } else {
         // passed less than a day
         if ((block.number - withdrawalStat.blockNumber) < _blocksPerDay) {
            if (withdrawalStat.count > _withdrawalNoPendingLimit) {
               putInPending = true;
            }
         }
      }

      //putInPending = true;

      if (putInPending) {
         bytes32 hashId = keccak256(abi.encodePacked(transactionId));
         _addPendingWithdrawal(to, amount, transactionId, hashId, signature);
         emit WithdrawInPending(
            to,
            bytes(transactionId),
            amount,
            hashId,
            signature,
            uint64(block.timestamp)
         );
         return;
      }

      _usdToken.transfer(to, amount);
      _increaseWithdrawCounters(to, amount);
      _updateWithdrawalStat(to, block.number, withdrawalStat.count + 1);
      emit Withdraw(to, bytes(transactionId), amount, signature, uint64(block.timestamp));
   }

   function _increaseDepositCounters(address user, uint256 amount) private {
      _userDepositAmounts[user] = _userDepositAmounts[user] + amount;
      _depositAmountCounter = _depositAmountCounter + amount;
   }

   function _increaseWithdrawCounters(address user, uint256 amount) private {
      _userWithdrawalAmounts[user] = _userWithdrawalAmounts[user] + amount;
      _withdrawAmountCounter = _withdrawAmountCounter + amount;
   }

   function depositWithdrawDiff() external view returns (uint256) {
      return (_depositAmountCounter - _withdrawAmountCounter);
   }

   // pending withdrawals ------------------------------------------

   function getPendingWithdrawalsByUser(
      address user
   ) public view returns (PendingWithdrawal[] memory) {
      if (_userPendingWithdrawalCounters[user] > 0) {
         PendingWithdrawal[] memory res = new PendingWithdrawal[](
            _userPendingWithdrawalCounters[user]
         );

         uint64 ii = 0;
         for (uint256 i = 0; i < _pendingWithdrawalHashes.length(); ++i) {
            PendingWithdrawal storage pw = _pendingWithdrawals[_pendingWithdrawalHashes.at(i)];
            if (pw.to == user) {
               res[ii] = pw;
               ++ii;
            }
         }

         return res;
      }

      PendingWithdrawal[] memory resNull;
      return resNull;
   }

   function getPendingWithdrawalHashByIndex(uint256 idx) public view returns (bytes32) {
      if (_pendingWithdrawalHashes.length() > idx) {
         return _pendingWithdrawalHashes.at(idx);
      }
      return "0x";
   }

   function setLowHighPendingAmounts(
      uint256 _amountLow,
      uint256 _amountHigh
   ) external onlyOwnerRole {
      _amountForPendingLow = _amountLow;
      _amountForPendingHigh = _amountHigh;
   }

   function setWithdrawalApproveWallet(address wallet) external onlySuperOwnerRole {
      _withdrawalApproveWallet = wallet;
   }

   function pendingWithdrawalHashesCount() public view returns (uint) {
      return _pendingWithdrawalHashes.length();
   }

   function _addPendingWithdrawal(
      address to,
      uint256 amount,
      string memory transactionId,
      bytes32 hashId,
      bytes memory signature
   ) private {
      require(!_pendingWithdrawalHashes.contains(hashId), "this Transaction is already in pending");

      _pendingWithdrawalHashes.add(hashId);
      _pendingWithdrawals[hashId] = PendingWithdrawal(
         hashId,
         transactionId,
         to,
         amount,
         uint64(block.timestamp),
         signature
      );
      _userPendingWithdrawalCounters[to] = _userPendingWithdrawalCounters[to] + 1;
   }

   function _removePendingWithdrawal(bytes32 hashId) private {
      _pendingWithdrawalHashes.remove(hashId);
      PendingWithdrawal storage pw = _pendingWithdrawals[hashId];
      if (_userPendingWithdrawalCounters[pw.to] > 0) {
         _userPendingWithdrawalCounters[pw.to] = _userPendingWithdrawalCounters[pw.to] - 1;
      }
      delete _pendingWithdrawals[hashId];
   }

   function approvePendingWithdrawal(
      bytes32 hashId,
      bool confirm
   ) external onlyWithdrawalApproveWallet nonReentrant {
      PendingWithdrawal storage withdrawal = _pendingWithdrawals[hashId];

      if (confirm) {
         _usdToken.transfer(withdrawal.to, withdrawal.amount);
         _increaseWithdrawCounters(withdrawal.to, withdrawal.amount);
         _updateWithdrawalStat(withdrawal.to, block.number, 0);

         emit Withdraw(
            withdrawal.to,
            bytes(withdrawal.transactionId),
            withdrawal.amount,
            withdrawal.signature,
            uint64(block.timestamp)
         );
      } else {
         emit WithdrawDeclinedByAdmin(
            withdrawal.to,
            bytes(withdrawal.transactionId),
            withdrawal.amount,
            withdrawal.signature,
            uint64(block.timestamp)
         );
      }

      _removePendingWithdrawal(hashId);
   }

   // last name: getSuperOwner2()
   function getSuperOwner2() external view returns (address) {
      return _superOwner;
   }

   // blast --------------------------------------------------------

   function configureBlastGovernor(address governorAddress) external onlyOwnerRole {
      IBlast(_BLAST).configureGovernor(governorAddress);

      emit EventConfigureBlastGovernor(governorAddress);
   }

   function configureBlastOperator(
      address blastPointsContractAddress,
      address blastPointsOperator
   ) external onlyOwnerRole {
      IBlastPoints(blastPointsContractAddress).configurePointsOperator(blastPointsOperator);

      emit EventConfigureBlastOperator(blastPointsContractAddress, blastPointsOperator);
   }

   function configureBlastYieldModes(
      address usdbYieldAddress,
      address wethYieldAddress,
      uint8 usdbYieldMode,
      uint8 wethYieldMode
   ) external onlyOwnerRole {
      IERC20Rebasing(usdbYieldAddress).configure(IERC20Rebasing.YieldMode(usdbYieldMode));
      IERC20Rebasing(wethYieldAddress).configure(IERC20Rebasing.YieldMode(wethYieldMode));

      emit EventConfigureBlastYieldModes(usdbYieldMode, wethYieldMode);
   }

   function claimBlastYieldAll(
      address recipient,
      address usdbYieldAddress,
      address wethYieldAddress,
      uint256 wethAmount,
      uint256 usdbAmount
   ) external onlyOwnerRole returns (uint256 amountWETH, uint256 amountUSDB, uint256 amountGas) {
      amountWETH = IERC20Rebasing(usdbYieldAddress).claim(recipient, wethAmount);
      amountUSDB = IERC20Rebasing(wethYieldAddress).claim(recipient, usdbAmount);
      amountGas = IBlast(_BLAST).claimMaxGas(address(this), recipient);

      emit EventClaimBlastYieldAll(recipient, amountWETH, amountUSDB, amountGas);
   }

   function claimBlastGas(
      address _recipient,
      uint256 _minClaimRateBips
   ) external onlyOwnerRole returns (uint256 amount) {
      if (_minClaimRateBips == 0) {
         amount = _BLAST.claimMaxGas(address(this), _recipient);
      } else {
         amount = _BLAST.claimGasAtMinClaimRate(address(this), _recipient, _minClaimRateBips);
      }

      emit EventClaimBlastGas(_recipient, amount);
   }
}
