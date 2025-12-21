import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyNFTModule", (m) => {
  const nft = m.contract("My1155NFT", []);

  //   const helper = m.contract("MultiTokenHelper", []);

  //   m.call(nft, "setHelper", [helper]);

  //   return { nft, helper };
  return { nft };
});
