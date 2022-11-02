const { ethers } = require("hardhat");
const ERC20ABI = require("../ABI/ERC20ABI.json");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(owner.address);
  const amount = ethers.utils.parseEther("5"); //amount of Dai we want to transfer to Aave

  //using the Dai contract address on Optimism mainnet
  const daiContract = await ethers.getContractAt(
    ERC20ABI,
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    owner
  );

  const Vault = await ethers.getContractFactory("VaultDai");
  const vaultDai = await Vault.deploy();

  await vaultDai.deployed();

  console.log(`Vault contract deployed to ${vaultDai.address}`);

  const num1 = await vaultDai.checkDaiBalance(owner.address);

  console.log(
    `Address ${owner.address} has Dai balance ${ethers.utils
      .formatEther(`${num1}`)
      .toString()}`
  );

  console.log("---------------------------------------------------------");
  console.log("------------Transfer Dai from user to contract-----------");
  console.log("---------------------------------------------------------");

  await daiContract.approve(vaultDai.address, amount);
  await daiContract.transferFrom(owner.address, vaultDai.address, amount);
  await vaultDai.approveDaiToAave(amount);
  console.log(
    `contract has dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(vaultDai.address)}`)
      .toString()}`
  );

  const aTokensVault = await vaultDai.getADaiBalanceVault();
  console.log(
    `contract address: ${vaultDai.address} has balance AaveToken:  ${aTokensVault}`
  );
  const daiAllowance = await vaultDai.checkDaiAllowance();
  console.log(
    `Dai allowance is ${ethers.utils.formatEther(daiAllowance.toString())}`
  );

  console.log("---------------------------------------------------------");
  console.log("------------Transfer Dai from contract to Aave-----------");
  console.log("---------------------------------------------------------");

  await vaultDai.supplyDaiToAave(amount);

  const aaveTokensVault = await vaultDai.getADaiBalanceVault();
  const aaveTokensUser = await vaultDai.getADaiBalanceUser(owner.address);

  console.log(
    `contract address: ${
      vaultDai.address
    } has balance AaveToken:  ${ethers.utils.formatEther(
      aaveTokensVault.toString()
    )}`
  );
  console.log(
    `owner address: ${owner.address} has balance AaveToken:  ${aaveTokensUser}`
  );

  const contractDaiBalance = await daiContract.balanceOf(vaultDai.address);
  console.log(
    `contract address ${
      vaultDai.address
    } has Dai balance: ${ethers.utils.formatEther(
      contractDaiBalance.toString()
    )}`
  );

  console.log("---------------------------------------------------------");
  console.log("-------Withdraw Dai from from Aave back to contract------");
  console.log("---------------------------------------------------------");

  // await vaultDai.approveADaiWtihdrawlFromAave(amount);
  // const ADaiAllowance = await vaultDai.checkADaiAllowance();
  // console.log(
  //   `Aave token allowance is ${ethers.utils.formatEther(
  //     ADaiAllowance.toString()
  //   )}`
  // );
  await vaultDai.withdrawDaiFromAave(amount);

  const newAaveTokensVault = await vaultDai.getADaiBalanceVault();

  console.log(
    `contract address: ${
      vaultDai.address
    } has balance AaveToken after withdrawl:  ${ethers.utils.formatEther(
      newAaveTokensVault.toString()
    )}`
  );
  console.log(
    `owner address: ${owner.address} has balance AaveToken after withdrawl:  ${aaveTokensUser}`
  );

  const vDai = await daiContract.balanceOf(vaultDai.address);
  console.log(
    `Contract address ${
      vaultDai.address
    } has Dai balance ${ethers.utils.formatEther(vDai.toString())}`
  );

  console.log("---------------------------------------------------------");
  console.log("-------Withdraw Dai from from contract back to user------");
  console.log("---------------------------------------------------------");

  await vaultDai.returnDaiToUser(amount);

  const vDai1 = await daiContract.balanceOf(vaultDai.address);
  console.log(
    `Contract address ${
      vaultDai.address
    } has Dai balance ${ethers.utils.formatEther(vDai1.toString())}`
  );

  const userDai = await daiContract.balanceOf(owner.address);
  console.log(
    `User address ${owner.address} has Dai balance ${ethers.utils.formatEther(
      userDai.toString()
    )}`
  );
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
