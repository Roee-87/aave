//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {L2Encoder} from "@aave/core-v3/contracts/misc/L2Encoder.sol";
import {IL2Pool} from "@aave/core-v3/contracts/interfaces/IL2Pool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract VaultUSDC {
    address usdcAddr = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607; //optimism USDC token contract
    address poolProviderAddress = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb;
    address poolAddress = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;
    address aUsdcToken = 0x625E7708f30cA75bfd92586e17077590C60eb4cD; //optimism aUSDC token contract
    L2Encoder encoder;
    IL2Pool pool;

    // IPoolAddressesProvider addrProvider;

    function getPoolAddress() public view returns (address) {
        return IPoolAddressesProvider(poolProviderAddress).getPool();
    }

    function approveUsdcToAave(uint256 _amount) public {
        IERC20(usdcAddr).approve(getPoolAddress(), _amount);
    }

    function supplyUsdcToAave(uint256 _amount) public {
        bytes32 args = L2Encoder(0x9abADECD08572e0eA5aF4d47A9C7984a5AA503dC)
            .encodeSupplyParams(usdcAddr, _amount, 0);
        pool = IL2Pool(poolAddress);
        pool.supply(args);
    }

    function withdrawUsdcFromAave(uint256 _amount) public {
        bytes32 args = encoder.encodeWithdrawParams(usdcAddr, _amount);
        pool.withdraw(args);
    }

    function getDaiBalance() public view returns (uint256) {
        return IERC20(usdcAddr).balanceOf(msg.sender);
    }

    function getUsdcBalance() public view returns (uint256) {
        return IERC20(aUsdcToken).balanceOf(msg.sender);
    }

    function checkAllowance() public view returns (uint256) {
        return IERC20(usdcAddr).allowance(msg.sender, getPoolAddress());
    }

    function checkUsdcBalance(address addr) public view returns (uint256) {
        return IERC20(usdcAddr).balanceOf(addr);
    }

    function transferUsdc(address adr) public {
        IERC20(usdcAddr).transfer(adr, 10);
    }
}
