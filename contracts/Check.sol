//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Check {
    address daiAddr = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;

    function checkDaiBalance(address addr) public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(addr);
    }

    function addressBalance(address addr) public view returns (uint256) {
        return addr.balance;
    }
}
