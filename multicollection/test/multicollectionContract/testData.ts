import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { keccak256FromStr } from "~common/cryptography";

import { toUnixTime } from "./utils";

export const invTestData = {
   uri: "https://test.com/",
   uriPostfix: ".json",
   tokenCount: 5,
   tokenId0: BigInt(0),
   tokenId1: BigInt(1),
   tokenId2: BigInt(2),
   tokenId3: BigInt(3),
   tokenId4: BigInt(4),
   nullAddress: "0x0000000000000000000000000000000000000000",
};

export const petobotErrorMessage = {
   onlySuperOwnerOrPermittedOwner:
      "Only superOwner or owner who has permission can call this function",
   invalidTokenId: "ERC721: invalid token ID",
   couldntFindIndex: "Couldn't find index",
   callerIsNotTokenOwnerOrApproved: "ERC721: caller is not token owner or approved",
   callerIsNotTokenOwnerOrApproved2: "ERC721InsufficientApproval",
   invalidProof: "Invalid proof",
   addressHasAlreadyBeenAdded: "This address has already been added",
   invalidSignature: "Invalid signature",
   sessionIdWasUsedBefore: "This sessionId was used before",
};

export const whitelist = [
   "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
   "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
   "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
   "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
   "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
];

export enum Roles {
   SUPER_OWNER_ROLE = "0x8b1505cddb35f62ac075d7162e97e437accb1359b84bdfe7c73611681f2dc87c",
   OWNER_ROLE = "0xb19546dff01e856fb3f010c267a7b1c60363cf8a4664e21cc89c26224620214e",
}

const sessionId0 = uuidv4();
const sessionId1 = uuidv4();

export const invSeedData = {
   timeDelta: 300,
   signatureForce:
      "0x6ca1f91cf29e4fb5ed57a194cf64337a6f83b6da8cbd4cd8b040c19bd9b3b0f660f55fd22bb484ab9c60de6f5a54dc5483e80cb51e2877e86c325fb31123bbdb1c",
   now: toUnixTime(),
   nowPlus1h: toUnixTime(dayjs().add(1, "hour").toDate()),
   tokenCount1: 1,
   tokenCount2: 2,
   sessionId0,
   sessionId1,
   sessionIdHash0: keccak256FromStr(sessionId0),
   sessionIdHash1: keccak256FromStr(sessionId1),
};

export const fnName = {
   mint1P: "mint(address,bool)",
   mint2P: "mint(address,uint32,bool)",
   safeTransferFrom3P: "safeTransferFrom(address,address,uint256)",
   safeTransferFrom4P: "safeTransferFrom(address,address,uint256,bytes)",
} as const;
