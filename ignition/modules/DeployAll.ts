import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployAllModule", (m) => {
  const batchCall = m.contract("BatchCallAndSponsor");

  const tokenAddress = process.env.TOKEN_ADDRESS!;
  const voucher = m.contract("Voucher", [tokenAddress]);

  return { batchCall, voucher };
});
