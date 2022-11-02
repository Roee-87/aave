// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  const Check = await ethers.getContractFactory("Check");
  const check = await Check.deploy();

  await check.deployed();

  const Vault = await ethers.getContractFactory("TestVault");
  const vault = await Vault.deploy();

  await vault.deployed();

  console.log(`Check contract deployed to ${check.address}`);
  console.log(`Vault contract deployed to ${vault.address}`);

  const addr1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  //const addr2 = "0x2FA9B4f9A126b8E7B76666a24370D6087CbDeDDd";

  const num1 = await check.checkDaiBalance(addr1);
  //const num2 = await check.checkDaiBalance(addr2);

  console.log(`Address ${addr1} has Dai balance ${num1}`);
  //console.log(`Address ${addr1} has Dai balance ${num2}`);

  await vault.approveDaiToAave(1000);
  console.log(`pool address is:  ${await vault.getPoolAddress()}`);
  console.log(`my dai balance is ${await vault.getDaiBalance()}`);
  console.log(await vault.checkDaiBalance(vault.address));
  const val = await vault.checkAllowance();
  //await vault.supplyDaiToAave(1000);
  console.log(`allowance is ${val}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
