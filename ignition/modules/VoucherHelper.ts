import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VoucherHelperModule", (m) => {
  const helper = m.contract("My7702VoucherHelper", []);

  return { helper };
});
