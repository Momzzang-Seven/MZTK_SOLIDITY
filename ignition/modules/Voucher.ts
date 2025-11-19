import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VoucherModule", (m) => {
  const issuer = process.env.ISSUER_ADDRESS!;
  const token = process.env.TOKEN_ADDRESS!;

  const voucher = m.contract("Voucher", [issuer, token]);

  return { voucher };
});
