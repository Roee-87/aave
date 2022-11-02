// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  const Vault = await ethers.getContractFactory("VaultDai");
  const vaultDai = await Vault.deploy();

  await vaultDai.deployed();

  console.log(`Vault contract deployed to ${vaultDai.address}`);

  const addr1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const num1 = await vaultDai.checkDaiBalance(addr1);

  console.log(`Address ${addr1} has Dai balance ${num1}`);
  //console.log(`Address ${addr1} has Dai balance ${num2}`);

  await vaultDai.approveDaiToAave(1000);
  console.log(`pool address is:  ${await vaultDai.getPoolAddress()}`);
  console.log(`my dai balance is ${await vaultDai.getDaiBalance()}`);
  const val = await vaultDai.checkAllowance();
  //await vault.supplyDaiToAave(1000);
  console.log(`allowance is ${val}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
