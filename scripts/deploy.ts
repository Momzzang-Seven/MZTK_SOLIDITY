import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const issuerAddress = process.env.ISSUER_ADDRESS || "";
  const tokenAddress = process.env.TOKEN_ADDRESS || "";

  if (!issuerAddress || !tokenAddress) {
    throw new Error("Please set ISSUER_ADDRESS and TOKEN_ADDRESS in .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const Voucher = await ethers.getContractFactory("Voucher");
  const voucher = await Voucher.deploy(issuerAddress, tokenAddress);
  await voucher.waitForDeployment();

  console.log("Voucher deployed at:", await voucher.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
