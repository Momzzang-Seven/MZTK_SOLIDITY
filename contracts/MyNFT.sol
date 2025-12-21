// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract My1155NFT is ERC1155, Ownable {
    uint256 public constant BETA_BADGE = 0;

    address public helperAddress;

    constructor() ERC1155("ipfs://bafybeicsbt72irmksybjdnimq23b7x3xc6b4niwbqweu2g6mserhy5kehu/{id}.json") Ownable(msg.sender) {}

    function mint(address to, uint256 id, uint256 amount) public onlyOwner {
        _mint(to, id, amount, "");
    }

    function setHelper(address _helper) public onlyOwner {
    helperAddress = _helper;
    }

    function safeMint7702(address to, uint256 id, uint256 amount) public {
    require(msg.sender == helperAddress || msg.sender == owner(), "Not authorized");
    _mint(to, id, amount, "");
}
}