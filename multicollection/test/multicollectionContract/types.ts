import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

import { Users } from "../../misc/types";
import { MulticollectionContract } from "../../typechain-types/contracts/MulticollectionContract";

export interface MulticollectionContextBase extends Users {
   superOwnerMulticollectionContract: MulticollectionContract;
   ownerMulticollectionContract: MulticollectionContract;
   user1MulticollectionContract: MulticollectionContract;
   user2MulticollectionContract: MulticollectionContract;
}

declare module "mocha" {
   export interface Context extends MulticollectionContextBase {
      loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
   }
}

export type Fixture<T> = () => Promise<T>;

export interface Signers {
   admin: SignerWithAddress;
   user1: SignerWithAddress;
   user2: SignerWithAddress;
}

export enum EvenName {
   Claim = "Claim",
}
