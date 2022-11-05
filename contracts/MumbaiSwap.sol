//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MumbaiSwap {
    address daiAddr = 0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B; //mumbai dai address
    address usdcAddr = 0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2; //mumbai usdc address
    address mumbai0xProxyAddr = 0xF471D32cb40837bf24529FCF17418fC1a4807626; //mumbai 0x proxy address

    function approveUsdcSwap(uint256 _amount) external {
        IERC20(usdcAddr).approve(mumbai0xProxyAddr, _amount);
    }

    function fillQuote(
        // amount to swap -- for approve function
        uint256 amount,
        // // The `sellTokenAddress` field from the API response.
        IERC20 sellToken,
        // // The `buyTokenAddress` field from the API response.
        // IERC20 buyToken,
        // // The `allowanceTarget` field from the API response.
        address spender,
        // The `to` field from the API response.
        address swapTarget,
        // The `data` field from the API response.
        bytes calldata swapCallData
    )
        external
    // Must attach ETH equal to the `value` field from the API response.
    {
        // ...

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        //IERC20 daiCon = IERC20(0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1);
        require(sellToken.approve(swapTarget, 0), "approve to 0 failed");
        require(sellToken.approve(swapTarget, amount), "approve failed");

        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success, bytes memory res) = swapTarget.call(swapCallData);
        require(success, "SWAP_CALL_FAILED");
        // Refund any unspent protocol fees to the sender.
        //msg.sender.transfer(address(this).balance);

        // ...
    }

    function getDaiBalance() public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(msg.sender);
    }

    function checkDaiBalance(address addr) public view returns (uint256) {
        return IERC20(daiAddr).balanceOf(addr);
    }

    function returnDaiToUser(uint256 _amount) public {
        address addr = msg.sender;
        IERC20(daiAddr).transfer(addr, _amount);
    }
}
