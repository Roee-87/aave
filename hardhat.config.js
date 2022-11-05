require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";
const MATIC_RPC_URL = process.env.MATIC_RPC_URL;
POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: "https://polygon-mainnet.g.alchemy.com/v2/DWQwRdeh1rp2H4l1aaw1p2OXDHhHYgsF",
      },
      chainId: 137,
    },
    polygon: {
      chainID: 137,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      url: POLYGON_RPC_URL,
      saveDeployments: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  },
};
