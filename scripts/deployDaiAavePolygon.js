const { ethers } = require("hardhat");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const vaultABI = require("../ABI/vaultABI.json");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(owner.address);
  const amount = ethers.utils.parseEther("1"); //amount of Dai we want to transfer to Aave

  // const PolygonVaultDai = await ethers.getContractFactory("PolygonVaultDai");
  // const polygonVaultDai = await PolygonVaultDai.deploy();

  // await polygonVaultDai.deployed();
  const polygonVaultDai = await ethers.getContractAt(
    vaultABI,
    "0xCfb9c5813535AbE7664Ea4D6192b22c81B08E63a"
  );

  console.log(
    `polygonVaultDai contract deployed at:  ${polygonVaultDai.address}`
  );

  //using the Dai contract address on Polygon POS mainnet
  const daiContract = await ethers.getContractAt(
    ERC20ABI,
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" //polygon dai address"
  );

  const num1 = await daiContract.balanceOf(owner.address);

  console.log(
    `Address ${owner.address} has Dai balance ${ethers.utils
      .formatEther(`${num1}`)
      .toString()}`
  );

  const num2 = await daiContract.balanceOf(polygonVaultDai.address);

  console.log(
    `Polygon Vault Contract at address: ${
      owner.address
    } has Dai balance ${ethers.utils.formatEther(`${num2}`).toString()}`
  );

  // console.log("---------------------------------------------------------");
  // console.log("----------Transfer 2 Dai from user to contract--------");
  // console.log("---------------------------------------------------------");

  // await daiContract.transfer(polygonVaultDai.address, amount);

  // console.log(
  //   `owner has Dai balance of: ${ethers.utils
  //     .formatEther(`${await daiContract.balanceOf(owner.address)}`)
  //     .toString()}, hi, owner should have ${amount} fewer Dai tokens`
  // );

  // console.log(
  //   `vault contract has Dai balance of: ${ethers.utils
  //     .formatEther(`${await daiContract.balanceOf(polygonVaultDai.address)}`)
  //     .toString()}`
  // );

  // console.log("---------------------------------------------------------");
  // console.log("-------Supply Dai to Aave from the Vault contract--------");
  // console.log("---------------------------------------------------------");

  // await polygonVaultDai.approveAavePoolDai(amount);
  // const aTokensVault = await polygonVaultDai.getADaiBalanceVault();
  // console.log(
  //   `contract address: ${polygonVaultDai.address} has balance AaveToken:  ${aTokensVault}`
  // );
  // const daiAllowance = await polygonVaultDai.checkDaiAllowance();
  // console.log(
  //   `Dai allowance is ${ethers.utils.formatEther(daiAllowance.toString())}`
  // );

  // await polygonVaultDai.supplyDaiToAave(amount);

  // const aaveTokensVault = await polygonVaultDai.getADaiBalanceVault();

  // console.log(
  //   `contract address: ${
  //     polygonVaultDai.address
  //   } has balance AaveToken:  ${ethers.utils.formatEther(
  //     aaveTokensVault.toString()
  //   )}`
  // );

  // const contractDaiBalance = await daiContract.balanceOf(
  //   polygonVaultDai.address
  // );
  // console.log(
  //   `contract address ${
  //     polygonVaultDai.address
  //   } has Dai balance: ${ethers.utils.formatEther(
  //     contractDaiBalance.toString()
  //   )}`
  // );

  console.log("---------------------------------------------------------");
  console.log("-------Withdraw Dai from from Aave back to contract------");
  console.log("---------------------------------------------------------");

  // await polygonVaultDai.approveADaiWtihdrawlFromAave(amount);
  // const ADaiAllowance = await polygonVaultDai.checkADaiAllowance();
  // console.log(
  //   `Aave token allowance is ${ethers.utils.formatEther(
  //     ADaiAllowance.toString()
  //   )}`
  // );
  await polygonVaultDai.withdrawDaiFromAave(amount);

  const newAaveTokensVault = await polygonVaultDai.getADaiBalanceVault();

  console.log(
    `contract address: ${
      polygonVaultDai.address
    } has balance AaveToken after withdrawl:  ${ethers.utils.formatEther(
      newAaveTokensVault.toString()
    )}`
  );

  const vDai = await daiContract.balanceOf(polygonVaultDai.address);
  console.log(
    `Contract address ${
      polygonVaultDai.address
    } has Dai balance ${ethers.utils.formatEther(vDai.toString())}`
  );

  console.log("---------------------------------------------------------");
  console.log("-------Withdraw Dai from from contract back to user------");
  console.log("---------------------------------------------------------");

  await polygonVaultDai.returnDaiToUser(amount);

  const vDai1 = await daiContract.balanceOf(polygonVaultDai.address);
  console.log(
    `Contract address ${
      polygonVaultDai.address
    } has Dai balance ${ethers.utils.formatEther(vDai1.toString())}`
  );

  const userDai = await daiContract.balanceOf(owner.address);
  console.log(
    `User address ${owner.address} has Dai balance ${ethers.utils.formatEther(
      userDai.toString()
    )}`
  );
  const aaveTokenLeft = await polygonVaultDai.getADaiBalanceVault();
  console.log(`Vault has this much left over aaave token:  ${aaveTokenLeft}`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
