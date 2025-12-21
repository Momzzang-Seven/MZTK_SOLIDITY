// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMy1155 {
    function safeMint7702(address to, uint256 id, uint256 amount) external;
}

contract MultiTokenHelper {
    function mintBadge(address nftAddress, uint256 id) external {
        IMy1155(nftAddress).safeMint7702(address(this), id, 1);
    }
}