import { Signer, getBytes, keccak256, solidityPackedKeccak256, toUtf8Bytes } from "ethers";

export function keccak256FromStr(data: string) {
   return keccak256(toUtf8Bytes(data));
}

export async function signMessage(
   signer: Signer,
   types: readonly string[],
   values: readonly any[],
) {
   const hash = solidityPackedKeccak256(types, values);
   const messageHashBin = getBytes(hash);
   return await signer.signMessage(messageHashBin);
}
