//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PolygonSwap {
    address owner;

    address daiAddr = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063; //mumbai dai address
    address usdcAddr = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; //mumbai usdc address
    address polygonProxyAddr = 0xDef1C0ded9bec7F1a1670819833240f027b25EfF; //mumbai 0x proxy address

    modifier onlyOwner() {
        require(owner == msg.sender, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function withdrawDai() external onlyOwner {
        uint256 contractBalance = IERC20(daiAddr).balanceOf(address(this));
        IERC20(daiAddr).transfer(owner, contractBalance);
    }

    function withdrawUcsd() external onlyOwner {
        uint256 contractBalance = IERC20(usdcAddr).balanceOf(address(this));
        IERC20(usdcAddr).transfer(owner, contractBalance);
    }

    function fillQuote(
        // amount to swap -- for approve function
        uint256 amount,
        // // The `sellTokenAddress` field from the API response.
        IERC20 sellToken,
        // // The `buyTokenAddress` field from the API response.
        // IERC20 buyToken,
        // // The `allowanceTarget` field from the API response.
        //address spender,
        // The `to` field from the API response.
        address swapTarget,
        // The `data` field from the API response.
        bytes calldata swapCallData
    )
        external
    // Must attach ETH equal to the `value` field from the API response.
    {
        // require swapTarget == polygonProxyAddr
        require(
            swapTarget == polygonProxyAddr,
            "proxy address isn't the same as swapTarget address! Dubug this"
        );

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        //IERC20 daiCon = IERC20(0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1);
        require(sellToken.approve(swapTarget, 0), "approve to 0 failed");
        require(sellToken.approve(swapTarget, amount), "approve failed");

        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success, ) = swapTarget.call(swapCallData);
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
