import { expect } from "chai";
import { network } from "hardhat";

describe("Voucher Contract", function () {
  it("should deploy Voucher contract", async function () {
    const { ethers } = await network.connect();

    const [deployer] = await ethers.getSigners();
    const Voucher = await ethers.getContractFactory("Voucher");
    const voucher = await Voucher.deploy(deployer.address, deployer.address);
    await voucher.waitForDeployment();

    expect(await voucher.deployer()).to.equal(deployer.address);
  });
});
