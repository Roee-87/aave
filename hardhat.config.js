require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: "https://opt-mainnet.g.alchemy.com/v2/6OvPlQ_ldNHTEMgwkqYYuWb3RojwroMU",
      },
      chainId: 10,
    },
    tenderly: {
      chainId: 1,
      url: "https://rpc.tenderly.co/fork/4648324a-43a2-4865-99ac-4a603b6dda68",
    },
    tenderlyOpt: {
      chainId: 10,

      url: "https://rpc.tenderly.co/fork/d59ec60a-7ada-4f09-ae15-4f355f261c2e",
    },
  },
};
