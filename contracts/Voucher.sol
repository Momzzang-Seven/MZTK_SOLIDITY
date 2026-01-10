// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voucher {
    IERC20 public rewardToken;
    mapping (bytes32 => uint256) public voucherAmounts;
    mapping(bytes32 => bool) public usedVouchers;

    constructor(address _token) {
        rewardToken = IERC20(_token);
    }

    function issueVoucher(bytes32 code, uint256 amount) external {
        require(voucherAmounts[code] == 0, "Voucher already issued");
        voucherAmounts[code] = amount;
    }

    function redeemVoucher(bytes32 code) external {
        uint256 amount = voucherAmounts[code];
        require(!usedVouchers[code], "Voucher already used");
        require(amount > 0, "Invalid voucher code");

        usedVouchers[code] = true;
        require(rewardToken.transfer(msg.sender, amount), "Token transfer failed");
    }
}