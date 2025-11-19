// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voucher {
    address public deployer;
    address public issuer;
    IERC20 public rewardToken;

    mapping(bytes32 => bool) public usedVouchers;
    mapping(bytes32 => uint256) public voucherAmounts;

    event VoucherIssued(bytes32 indexed voucherCode, uint256 amount);
    event VoucherRedeemed(bytes32 indexed voucherCode, address indexed redeemer, uint256 amount);

    constructor(address _issuer, address _token) {
        deployer = msg.sender;
        issuer = _issuer;
        rewardToken = IERC20(_token);
    }

    function issueVoucher(bytes32 voucherCode, uint256 amount) external {
        // 누구나 발급이 가능하도록 주석 처리
        // require(msg.sender == issuer, "Only issuer can issue");
        require(!usedVouchers[voucherCode], "Voucher already exists");

        usedVouchers[voucherCode] = false;
        voucherAmounts[voucherCode] = amount;

        emit VoucherIssued(voucherCode, amount);
    }

    function redeemVoucher(bytes32 voucherCode) external {
        require(!usedVouchers[voucherCode], "Voucher already used");
        usedVouchers[voucherCode] = true;

        uint256 amount = voucherAmounts[voucherCode];
        rewardToken.transfer(msg.sender, amount);

        emit VoucherRedeemed(voucherCode, msg.sender, amount);
    }

    function setIssuer(address _issuer) external {
        require(msg.sender == deployer, "Only deployer can change issuer");
        issuer = _issuer;
    }
}