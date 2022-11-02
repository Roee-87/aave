//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {L2Encoder} from "@aave/core-v3/contracts/misc/L2Encoder.sol";
import {IL2Pool} from "@aave/core-v3/contracts/interfaces/IL2Pool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract TestVault {
    address daiAddr = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
    address poolProviderAddress = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb;
    address poolAddress = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;
    address aDaiToken = 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE;
    L2Encoder encoder;
    IL2Pool pool;

    // IPoolAddressesProvider addrProvider;

    function getPoolAddress() public view returns (address) {
        return IPoolAddressesProvider(poolProviderAddress).getPool();
    }

    function approveDaiToAave(uint256 _amount) public {
        IERC20(daiAddr).approve(getPoolAddress(), _amount);
    }

    function supplyDaiToAave(uint256 _amount) public {
        bytes32 args = L2Encoder(0x9abADECD08572e0eA5aF4d47A9C7984a5AA503dC)
            .encodeSupplyParams(daiAddr, _amount, 0);
        pool = IL2Pool(poolAddress);
        pool.supply(args);
    }

    function withdrawDaiFromAave(uint256 _amount) public {
        bytes32 args = encoder.encodeWithdrawParams(daiAddr, _amount);
        pool.withdraw(args);
    }

    function getDaiBalance() public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(msg.sender);
    }

    function getADaiBalance() public view returns (uint256) {
        return IERC20(aDaiToken).balanceOf(msg.sender);
    }

    function checkAllowance() public view returns (uint256) {
        return IERC20(daiAddr).allowance(msg.sender, getPoolAddress());
    }

    function checkDaiBalance(address addr) public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(addr);
    }

    function transferDai(address adr) public {
        IERC20(daiAddr).transfer(adr, 10);
    }
}
