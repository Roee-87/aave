const {
  deployments,
  getNamedAccounts,
  network,
  run,
  ethers,
} = require("hardhat");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const qs = require("qs");
const fetch = require("node-fetch");

const mumbai0xProxyAddr = "0xF471D32cb40837bf24529FCF17418fC1a4807626";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(owner.address);

  const amount = ethers.utils.parseEther("2"); //amount of USDC ($2) we want to to swap to Dai

  // Deploy to Mumbai Testnet
  const MumbaiSwap = await ethers.getContractFactory("MumbaiSwap");
  const mumbaiSwap = await MumbaiSwap.deploy();

  await mumbaiSwap.deployed();

  console.log(`Swap contract deployed at:  ${mumbaiSwap.address}`);

  // Mumbai testnet tokens
  //using the USDC and Dai contract address on Mumbai
  const daiContract = await ethers.getContractAt(
    ERC20ABI,
    "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
    owner
  );

  const usdcContract = await ethers.getContractAt(
    ERC20ABI,
    "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2",
    owner
  );

  console.log("---------------------------------------------------------");
  console.log("----------Transfer 2 USDC from user to contract---------");
  console.log("---------------------------------------------------------");

  console.log(
    `owner has a USDC balance of: ${await usdcContract.balanceOf(
      owner.address
    )}`
  );

  await usdcContract.approve(mumbaiSwap.address, amount);
  await usdcContract.transferFrom(owner.address, mumbaiSwap.address, amount);

  console.log(
    `owner has USDC balance of: ${ethers.utils
      .formatEther(`${await usdcContract.balanceOf(owner.address)}`)
      .toString()}, hi, owner should have 2 fewer USDC tokens`
  );

  console.log(
    `Mumbai vault contract has USDC balance of: ${ethers.utils
      .formatEther(`${await usdcContract.balanceOf(mumbaiSwap.address)}`)
      .toString()}`
  );

  console.log("---------------------------------------------------------");
  console.log("-------Swap 2 USDC to Dai from the Vault contract----------");
  console.log("---------------------------------------------------------");

  // approve the 0x proxy to do the swap.  DO THIS BEFORE THE API call
  await usdcContract.approve(mumbai0xProxyAddr, amount);

  const params = {
    // Not all token symbols are supported. The address of the token can be used instead.
    sellToken: "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2",
    buyToken: "0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B",
    // Note that the DAI token uses 18 decimal places, so `sellAmount` is `100 * 10^18`.
    sellAmount: amount.toString(),
    //takerAddress: MumbaiSwap.address, // we cannot use a smart contract addres in this value according to 0x documentation
  };

  //0xf471d32cb40837bf24529fcf17418fc1a4807626 this is exchange proxy address for Mumbai. "to"

  // make http get request for USDC to Dai
  // manually inputting https://api.0x.org/swap/v1/quote?buyToken=DAI&sellAmount=2000000000000000000&sellToken=USDC

  const response = await fetch(
    `https://mumbai.api.0x.org/swap/v1/quote?${qs.stringify(params)}`
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
  console.log(`proxy address:  ${mumbai0xProxyAddr}`);
  console.log(`'to' address:  ${to}`);

  //check vault contract balance for usdc and dai before swap
  console.log(
    `Mumbai vault contract has USDC balance of: ${ethers.utils
      .formatEther(`${await usdcContract.balanceOf(mumbaiSwap.address)}`)
      .toString()}`
  );

  console.log(
    `Mumbai vault contract has Dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(mumbaiSwap.address)}`)
      .toString()}`
  );

  //in ethers.js, we can send a transaction from a provider (the signer from line 13) to send a transaction
  const receipt = await owner.sendTransaction({
    from: mumbaiSwap.address, // This is probably where we specify the taker address (our vault contract)
    to: to,
    data: data,
    value: value, //should be 0 because we aren't using ETH in this transaction
    gasPrice: gasPrice,
    gas: gas,
  });

  //check vault contract balance for usdc and dai AFTER swap
  console.log(
    `After Swap the Mumbai vault contract has USDC balance of: ${ethers.utils
      .formatEther(`${await usdcContract.balanceOf(mumbaiSwap.address)}`)
      .toString()}`
  );

  console.log(
    `After Swap the Mumbai vault contract has Dai balance of: ${ethers.utils
      .formatEther(`${await daiContract.balanceOf(mumbaiSwap.address)}`)
      .toString()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
