// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IVoucher {
    function redeemVoucher(bytes32 voucherCode) external;
}

contract My7702VoucherHelper {
    function redeemForUser(address voucherContract, bytes32 code) external {
        IVoucher(voucherContract).redeemVoucher(code);
    }
}