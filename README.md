This code simulates a user depositing an amount of Dai into a smart contract (vaultDai), which then deposits that Dai into Aave. The code then executes a withdrawl of Dai back to the smart contract, and then returns that Dai back to the original user. This repot can be cloned, yarn init should install all of the required dependencies.

# Deploying funds to Aave using forked Optimism mainnet

Step 1: Add a new network to Metamask called Optimism-Hardhat-Fork and manually configure the following settings:
RPC-URL: http://127.0.0.1:8545/  
 ChainID: 10

Step 2: Configure your hardhat.config.js file to enable hardhat to fork a mainnet. I'm using an alchemy RPC-URL to fork Optimism

    hardhat: {
      forking: {
        enabled: true,
        url: "https://opt-mainnet.g.alchemy.com/v2/<YOUR RPC API KEY FOR OPTIMISM HERE>",
      },
      chainId: 10,
    }

Step 3: Spin up the local node using hh node --network localhost. Import a test account into Metamask

Step 3: Use uniswap front end to load up on the tokens that you need. Hardhat provides you with 10,000 testEth.

Step 5: hh run scripts/deployDai.js --netowrk localhost
This deploys the contract and run the script

Token contracts for Polygon:
polygon USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
polygon Dai: 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063
polygon usdt: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F

polygon aToken usdc: 0x625E7708f30cA75bfd92586e17077590C60eb4cD
polygon aToken Dai: 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE
polygon aToken usdt: 0x6ab707Aca953eDAeFBc4fD23bA73294241490620
