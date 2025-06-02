import { Users } from "../../misc/types";
import { PaymentsContractBlast } from "../../typechain-types/contracts/PaymentsContractBlast";
import { TestUSD } from "../../typechain-types/contracts/TestUSD";

export interface ContextBase extends Users {
   superOwnerPaymentsContractBlast: PaymentsContractBlast;
   superOwnerUsdTestContract: TestUSD;
   ownerPaymentsContractBlast: PaymentsContractBlast;
   user1PaymentsContractBlast: PaymentsContractBlast;
   user2PaymentsContractBlast: PaymentsContractBlast;
   ownerUsdTestContract: TestUSD;
   user1UsdTestContract: TestUSD;
}

export enum EventName {
   Deposit = "Deposit",
   Withdraw = "Withdraw",
}
