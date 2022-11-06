//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract PolygonVaultDai {
    address daiAddr = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063; //polygon POS
    address poolProviderAddress = 0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb; //polygon POS
    address poolAddress = 0x794a61358D6845594F94dc1DB02A252b5b4814aD; //polygon POS
    address aDaiToken = 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE; //polygon POS

    address owner;
    IPool pool;

    modifier onlyOwner() {
        require(owner == msg.sender, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getPoolAddress() public view returns (address) {
        return IPoolAddressesProvider(poolProviderAddress).getPool();
    }

    function approveAavePoolDai(uint256 _amount) external {
        IERC20(daiAddr).approve(getPoolAddress(), _amount);
    }

    function supplyDaiToAave(uint256 _amount) public onlyOwner {
        address poolAddr = getPoolAddress();
        //IERC20(daiAddr).approve(poolAddr, _amount);
        pool = IPool(poolAddr);
        pool.supply(daiAddr, _amount, address(this), 0);
    }

    // function approveADaiWtihdrawlFromAave(uint256 _amount) public {
    //     IERC20(aDaiToken).approve(getPoolAddress(), _amount);
    // }

    function withdrawDaiFromAave(uint256 _amount) public onlyOwner {
        address poolAddr = getPoolAddress();
        pool = IPool(poolAddr);
        //function withdraw(address asset, uint256 amount, address to)
        pool.withdraw(daiAddr, _amount, address(this));
    }

    function checkDaiAllowance() public view returns (uint256) {
        return IERC20(daiAddr).allowance(address(this), getPoolAddress());
    }

    function getDaiBalance() public view returns (uint256) {
        address user = msg.sender;
        return IERC20(daiAddr).balanceOf(user);
    }

    function getADaiBalanceVault() public view returns (uint256) {
        return IERC20(aDaiToken).balanceOf(address(this));
    }

    function getADaiBalanceUser() public view returns (uint256) {
        return IERC20(aDaiToken).balanceOf(address(this));
    }

    function checkADaiAllowance() public view returns (uint256) {
        return IERC20(daiAddr).allowance(msg.sender, getPoolAddress());
    }

    // function checkDaiBalance(address addr) public view returns (uint256) {
    //     return IERC20(daiAddr).balanceOf(addr);
    // }

    function returnDaiToUser(uint256 _amount) public onlyOwner {
        address addr = msg.sender;
        IERC20(daiAddr).transfer(addr, _amount);
    }
}
