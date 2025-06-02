// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./multicollection/AddressItems.sol";

contract MulticollectionContract is
   Initializable,
   OwnableUpgradeable,
   ERC721Upgradeable,
   AccessControlUpgradeable,
   UUPSUpgradeable,
   AddressItems
{
   function initialize(
      address superOwner_,
      string memory name_,
      string memory symbol_
   ) public initializer {
      __ERC721_init(name_, symbol_);
      __Ownable_init(superOwner_);
      __AccessControl_init();
      __UUPSUpgradeable_init();

      _superOwner = superOwner_;

      _grantRole(SUPER_OWNER_ROLE, _superOwner);
      _grantRole(OWNER_ROLE, _superOwner);

      _defaultNftOwner = address(0);
   }

   function _authorizeUpgrade(address newImplementation) internal override onlySuperOwnerRole {}

   bytes32 private constant SUPER_OWNER_ROLE = keccak256("SUPER_OWNER_ROLE");
   bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");
   using EnumerableSet for EnumerableSet.UintSet;

   address private _superOwner;
   uint256 private _tokenIdCounter;

   bool private _isCommonTokenUri;
   string private _uri;
   string private _uriPostfix;
   string private _contractMetadataUrl;
   EnumerableSet.UintSet private _lockedTokens;

   address public _defaultNftOwner;
   bytes32 private constant DEFAULT_NFT_OWNER_ROLE = keccak256("DEFAULT_NFT_OWNER_ROLE");

   // modifiers -------------------------------------------

   modifier onlySuperOwnerRole() {
      require(
         hasRole(SUPER_OWNER_ROLE, _msgSender()),
         "Only SuperOwner has rights to call this function"
      );
      _;
   }

   modifier onlyOwnerRole() {
      require(hasRole(OWNER_ROLE, _msgSender()), "Only Owner has rights to call this function");
      _;
   }

   modifier onlyDefaultNftOwnerRole() {
      require(hasRole(DEFAULT_NFT_OWNER_ROLE, _msgSender()), "Only Default Nft Owner has rights to call this function");
      _;
   }

   event Mint(address indexed to, uint256 indexed assetNumber, uint64 timestamp);
   event Burn(address indexed account, uint256 tokenId, uint64 timestamp);
   event ContractURIUpdated();

   // functions -------------------------------------------

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

   function transferDefaultNftOwnerOwnership(address to) public onlyOwnerRole {
      if (_defaultNftOwner != address(0)) {
         _revokeRole(DEFAULT_NFT_OWNER_ROLE, _defaultNftOwner);
      }
      _defaultNftOwner = to;
      _grantRole(DEFAULT_NFT_OWNER_ROLE, to);
   }

   function superOwner() public view returns (address) {
      return _superOwner;
   }

   function emitContractURIUpdated() external onlyOwner {
      emit ContractURIUpdated();
   }

   function tokenIsLocked(uint256 tokenId) public view returns (bool) {
      return _lockedTokens.contains(tokenId);
   }

   function lockToken(uint256 tokenId, bool lock) public onlyOwnerRole {
      if (lock) {
         if (tokenIsLocked(tokenId)) {
            return;
         }
         _lockedTokens.add(tokenId);
         return;
      }
      if (tokenIsLocked(tokenId)) {
         _lockedTokens.remove(tokenId);
      }
   }

   function _mint(address to) private returns (uint256) {
      uint256 tokenId = _tokenIdCounter;
      _tokenIdCounter = _tokenIdCounter + 1;
      addTokenToAddressItems(to, tokenId);
      _safeMint(to, tokenId);
      return tokenId;
   }

   function mint(address to, bool lock) public onlyOwnerRole {
      uint256 assetNumber = _mint(to);
      if (lock) {
         lockToken(assetNumber, true);
      }
      emit Mint(to, assetNumber, uint64(block.timestamp));
   }

   function mint(address to, uint32 count, bool lock) public onlyOwnerRole {
      for (uint32 i = 0; i < count; i++) {
         mint(to, lock);
      }
   }

   function mintBatch(address[] calldata addresses, bool lock) public onlyOwnerRole {
      for (uint32 i = 0; i < addresses.length; i++) {

         mint(addresses[i], lock);
      }
   }

   function burn(uint256 tokenId) public onlyOwnerRole {
      address tokenOwner = ownerOf(tokenId);
      removeTokenFromAddressItems(tokenOwner, tokenId);
      _burn(tokenId);
      if (tokenIsLocked(tokenId)) {
         lockToken(tokenId, false);
      }
      emit Burn(tokenOwner, tokenId, uint64(block.timestamp));
   }

   function transferFrom(address from, address to, uint256 tokenId) public virtual override {
      require(
         tokenIsLocked(tokenId) == false,
         "Execution reverted [0]. The collection item may prohibit transfer. Please reach out to the collection owner to troubleshoot."
      );
      transferTokenInAddressItems(from, to, tokenId);
      super.transferFrom(from, to, tokenId);
   }

   function transferFromAndLock(address from, address to, uint256 tokenId) public onlyDefaultNftOwnerRole {
      require(
         tokenIsLocked(tokenId) == false,
         "Execution reverted [1]. The collection item may prohibit transfer. Please reach out to the collection owner to troubleshoot."
      );
      transferTokenInAddressItems(from, to, tokenId);
      lockToken(tokenId, true);
      super.transferFrom(from, to, tokenId);
   }

   function getTokenCount() public view returns (uint256) {
      return _tokenIdCounter;
   }

   function setCommonTokenUri(bool isCommonTokenUri) external onlyOwnerRole {
      _isCommonTokenUri = isCommonTokenUri;
   }

   function getCommonTokenUri() external view returns (bool) {
      return _isCommonTokenUri;
   }

   // last test-name: getURI6
   function getURI6() external view returns (string memory) {
      return _uri;
   }

   function setURI(string memory uri) external onlyOwnerRole {
      _uri = uri;
   }

   function setContractMetadataURI(string memory uri) external onlyOwnerRole {
      _contractMetadataUrl = uri;
   }

   function getURIPostfix() external view returns (string memory) {
      return _uriPostfix;
   }

   function setURIPostfix(string memory uriPostfix) external onlyOwnerRole {
      _uriPostfix = uriPostfix;
   }

   function tokenURI(uint256 tokenId) public view override returns (string memory) {
      return
         _isCommonTokenUri
            ? string.concat(_uri, "token", _uriPostfix)
            : string.concat(_uri, Strings.toString(tokenId), _uriPostfix);
   }

   function contractURI() public view returns (string memory) {
      return _contractMetadataUrl;
   }

   // AccessControlUpgradeable::supportsInterface()
   function supportsInterface(
      bytes4 interfaceId
   ) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
      return super.supportsInterface(interfaceId);
   }
}
