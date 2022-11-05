const { run, ethers } = require("hardhat");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const qs = require("qs");
const fetch = require("node-fetch");

const polygonProxyAddr = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF";
const daiAddr = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"; //polygon dai address
const usdcAddr = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; //polygon usdc address

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(owner.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
