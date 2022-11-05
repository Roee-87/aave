//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract VaultDai {
    address daiAddr = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063; //polygon POS
    address poolProviderAddress = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb; //polygon POS
    address poolAddress = 0x794a61358D6845594F94dc1DB02A252b5b4814aD; //polygon POS
    address aDaiToken = 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE; //polygon POS

    IPool pool;

    function getPoolAddress() public view returns (address) {
        return IPoolAddressesProvider(poolProviderAddress).getPool();
    }

    function approveDaiToAave(uint256 _amount) public {
        IERC20(daiAddr).approve(getPoolAddress(), _amount);
    }

    function supplyDaiToAave(uint256 _amount) public {
        address supplier = msg.sender;
        address poolAddr = getPoolAddress();
        pool = IPool(poolAddr);
        pool.supply(daiAddr, _amount, supplier, 0);
        //(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
    }

    function approveADaiWtihdrawlFromAave(uint256 _amount) public {
        IERC20(aDaiToken).approve(getPoolAddress(), _amount);
    }

    function withdrawDaiFromAave(uint256 _amount) public {
        address user = msg.sender;
        address poolAddr = getPoolAddress();
        pool = IPool(poolAddr);
        //function withdraw(address asset, uint256 amount, address to)
        pool.withdraw(daiAddr, _amount, user);
    }

    function getDaiBalance() public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(msg.sender);
    }

    function getADaiBalanceVault() public view returns (uint256) {
        return IERC20(aDaiToken).balanceOf(address(this));
    }

    function getADaiBalanceUser(address addr) public view returns (uint256) {
        return IERC20(aDaiToken).balanceOf(addr);
    }

    function checkDaiAllowance() public view returns (uint256) {
        return IERC20(daiAddr).allowance(address(this), getPoolAddress());
    }

    function checkADaiAllowance() public view returns (uint256) {
        return IERC20(daiAddr).allowance(msg.sender, getPoolAddress());
    }

    function checkDaiBalance(address addr) public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(addr);
    }

    function returnDaiToUser(uint256 _amount) public {
        address addr = msg.sender;
        IERC20(daiAddr).transfer(addr, _amount);
    }
}
