const { ethers } = require("hardhat");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const qs = require("qs");
const fetch = require("node-fetch");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(owner.address);
  const amount = ethers.utils.parseEther("2"); //amount of Dai we want to transfer to Aave

  const Swap = await ethers.getContractFactory("Swap");
  const swap = await Swap.deploy();

  await swap.deployed();

  console.log(`Swap contract deployed at:  ${swap.address}`);
  //console.log(data); //This is the exchange proxy on Optimism

  //using the Dai contract address on Optimism mainnet
  const daiContract = await ethers.getContractAt(
    ERC20ABI,
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    owner
  );

  const usdcContract = await ethers.getContractAt(
    ERC20ABI,
    "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    owner
  );

  console.log(`usdc address: ${usdcContract.address}`);

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
  const num2 = await usdcContract.balanceOf(owner.address);

  console.log(
    `Address ${owner.address} has USDC balance ${ethers.utils
      .formatEther(`${num2}`)
      .toString()}`
  );

  console.log("---------------------------------------------------------");
  console.log("----------Transfer 10 Dai from user to contract--------");
  console.log("---------------------------------------------------------");

  console.log(
    `owner has a Dai balance of: ${await daiContract.balanceOf(owner.address)}`
  );

  await daiContract.approve(vaultDai.address, amount);
  await daiContract.transferFrom(owner.address, vaultDai.address, amount);

  console.log(
    `owner has Dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(owner.address)}`)
      .toString()}, hi, owner should have 100 fewer dai tokens`
  );

  console.log(
    `vault contract has Dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(vaultDai.address)}`)
      .toString()}`
  );

  console.log("---------------------------------------------------------");
  console.log("-------Swap 10 Dai to USCD from the Vault contract----------");
  console.log("---------------------------------------------------------");

  const params = {
    // Not all token symbols are supported. The address of the token can be used instead.
    sellToken: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    buyToken: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    // Note that the DAI token uses 18 decimal places, so `sellAmount` is `100 * 10^18`.
    sellAmount: amount.toString(),
  };

  // make http get request for USDC to Dai
  const response = await fetch(
    `https://optimism.api.0x.org/swap/v1/quote?${qs.stringify(params)}`
  );

  const {
    data,
    to,
    value,
    gas,
    gasPrice,
    sellTokenAddress,
    buyTokenAddress,
    allowanceTarget,
    from,
  } = await response.json();

  // console.log(`to: ${to}, value: ${value}`);
  // console.log(`allowanceTarget: ${allowanceTarget}`);
  // console.log(`sellTokenAddress: ${sellTokenAddress}`);
  // console.log(`buyTokenAddress: ${buyTokenAddress}`);
  // //console.log(`data: ${data}`);
  console.log(`amount: ${amount}`);
  console.log(`gas: ${gas}`);
  console.log(`gasPrice: ${gasPrice}`);
  console.log(`from: ${from}`);

  //swap to USDC

  console.log(
    `vault contract now has USDC balance before swap:  ${ethers.utils
      .formatEther(`${await usdcContract.balanceOf(vaultDai.address)}`)
      .toString()}`
  );

  // const txResponse = await owner.sendTransaction({
  //   from: vaultDai.address,
  //   to: to,
  //   data: data,
  //   value: value,
  //   gasPrice: gasPrice,
  //   gasLimit: gas,
  // });
  // const txReceipt = await txResponse.wait();

  // console.log(txReceipt);

  await swap.fillQuote(
    amount,
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    //usdcContract,
    "0xDEF1ABE32c034e558Cdd535791643C58a13aCC10",
    "0xDEF1ABE32c034e558Cdd535791643C58a13aCC10",
    data
  );

  console.log(
    `vault contract now has USDC balance after swap:  ${ethers.utils
      .formatEther(`${await usdcContract.balanceOf(vaultDai.address)}`)
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
