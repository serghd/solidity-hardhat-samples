export type StringNumber = string | number;

export interface JsonMetadata {
   name: string;
   image: string;
   banner?: string;
   description: string;
}

export interface ContractData {
   name: string;
   symbol: string;
   uri?: string;
}
