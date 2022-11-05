const { run, ethers } = require("hardhat");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const contractABI = require("../ABI/contractABI.json");
const qs = require("qs");
const fetch = require("node-fetch");

const polygonProxyAddr = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";
const daiAddr = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; //polygon dai address
const usdcAddr = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; //polygon usdc address
const contractAddr = "0x35dE2b1DBe623B4B92157b3B3D1185670bC92013";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(owner.address);

  const amount = ethers.utils.parseUnits("2", 6); //amount of USDC ($2) we want to to swap to Dai. USDC uses 6 decimal places

  // Deploy to Polygon mainnet
  // const PolygonSwap = await ethers.getContractFactory("PolygonSwap");
  // const polygonSwap = await PolygonSwap.deploy();

  // await polygonSwap.deployed();

  // console.log(`Polygon Swap contract deployed at:  ${polygonSwap.address}`);

  //create instances of the USDC and Dai contract address on polygon
  const daiContract = await ethers.getContractAt(ERC20ABI, daiAddr);
  const usdcContract = await ethers.getContractAt(ERC20ABI, usdcAddr);
  const polygonSwap = await ethers.getContractAt(contractABI, contractAddr);

  await polygonSwap.withdrawDai();
  await polygonSwap.withdrawUsdc();

  console.log(`Polygon Swap contract deployed at:  ${polygonSwap.address}`);

  console.log("---------------------------------------------------------");
  console.log("Deploying vault contract, creating instances of dai and usdc");
  console.log("---------------------------------------------------------");

  console.log(`Polygon Swap contract deployed at:  ${polygonSwap.address}`);
  console.log(`USDC contract address:  ${usdcContract.address}`);
  console.log(`DAI contract address:  ${daiContract.address}`);

  console.log("---------------------------------------------------------");
  console.log("----------Transfer 1.5 USDC from user to contract---------");
  console.log("---------------------------------------------------------");

  console.log(
    `owner has a USDC balance of: ${ethers.utils
      .formatUnits(`${await usdcContract.balanceOf(owner.address)}`, 6)
      .toString()} before deposit`
  );

  console.log(
    `Polygon vault contract has USDC balance of: ${ethers.utils
      .formatUnits(`${await usdcContract.balanceOf(polygonSwap.address)}`, 6)
      .toString()} before user deposit`
  );

  await usdcContract.transfer(polygonSwap.address, amount);

  console.log(
    `owner has USDC balance of: ${ethers.utils
      .formatUnits(`${await usdcContract.balanceOf(owner.address)}`, 6)
      .toString()}, hi, owner should have 1 fewer USDC tokens`
  );

  //deposit ucsd from user to polygonSwap
  //await usdcContract.transfer(polygonSwap.address, amount);

  console.log(
    `Polygon vault contract has USDC balance of: ${ethers.utils
      .formatUnits(`${await usdcContract.balanceOf(polygonSwap.address)}`, 6)
      .toString()} AFTER user deposit`
  );

  console.log("---------------------------------------------------------");
  console.log("-----------0x api call: 1.5 USDC to Dai -------------------");
  console.log("---------------------------------------------------------");

  const params = {
    // Not all token symbols are supported. The address of the token can be used instead.
    sellToken: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    buyToken: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    // Note that the DAI token uses 18 decimal places, so `sellAmount` is `100 * 10^18`.
    sellAmount: amount.toString(),
    //takerAddress: MumbaiSwap.address, // we cannot use a smart contract addres in this value according to 0x documentation
  };

  // make http get request for USDC to Dai
  // manually inputting https://api.0x.org/swap/v1/quote?buyToken=DAI&sellAmount=2000000&sellToken=USDC

  const response = await fetch(
    `https://polygon.api.0x.org/swap/v1/quote?${qs.stringify(params)}`
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
  } = await response.json();

  //check that the proxy address is the same as "to"
  console.log(`proxy address:  ${polygonProxyAddr}`);
  console.log(`'to' address:  ${to}`);
  console.log(`allowanceTarget, ${allowanceTarget}`);
  console.log(`value: ${value}`);
  console.log(`sellTokenAddress:  ${sellTokenAddress}`);
  console.log(`buyTokenAddress: ${buyTokenAddress}`);
  console.log(`gas: ${gas}`);
  console.log(`gasPrice: ${gasPrice}`);
  console.log(`data: ${data}`);
  //check vault contract balance for usdc and dai before swap

  console.log("---------------------------------------------------------");
  console.log("-------Swap 1.5 USDC to Dai from the Vault contract----------");
  console.log("---------------------------------------------------------");

  console.log(
    `Polygon swap contract has USDC balance of: ${ethers.utils
      .formatUnits(`${await usdcContract.balanceOf(polygonSwap.address)}`, 6)
      .toString()} BEFORE 0x swap`
  );

  console.log(
    `Polygon swap contract has Dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(polygonSwap.address)}`)
      .toString()}BEFORE 0x swap`
  );

  //in ethers.js, we can send a transaction from a provider (the signer from line 13) to send a transaction
  //   const receipt = await owner.sendTransaction({
  //     from: polygonSwap.address, // This is probably where we specify the taker address (our vault contract)
  //     to: to,
  //     data: data,
  //     value: value, //should be 0 because we aren't using ETH in this transaction
  //     gasPrice: gasPrice,
  //     gas: gas,
  //   });

  //call the fillQuote() function
  await polygonSwap.fillQuote(amount, usdcAddr, to, data);
  //tx.wait(10);

  //check vault contract balance for usdc and dai AFTER swap
  console.log(
    `After Swap the Polygon Swap contract has USDC balance of: ${ethers.utils
      .formatUnits(`${await usdcContract.balanceOf(polygonSwap.address)}`, 6)
      .toString()}`
  );

  console.log(
    `After Swap the Polygon Swap contract has Dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(polygonSwap.address)}`)
      .toString()}`
  );

  //withdraw everything

  await polygonSwap.withdrawDai();
  await polygonSwap.withdrawUsdc();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
