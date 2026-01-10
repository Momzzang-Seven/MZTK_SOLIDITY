// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {SlotDerivation} from "@openzeppelin/contracts/utils/SlotDerivation.sol";
import {StorageSlot} from "@openzeppelin/contracts/utils/StorageSlot.sol";

/**
 * @title BatchCallAndSponsor
 * @notice An educational contract that allows batch execution of calls with nonce and signature verification.
 */
contract BatchCallAndSponsor {
    using ECDSA for bytes32;
    using SlotDerivation for bytes32;
    using SlotDerivation for string; // for "namespace".erc7201Slot()
    using StorageSlot for bytes32; // for slot.getUint256Slot()

    string private constant _NONCE_NAMESPACE = "erc7201:marblex.storage.nonce";

    // todo: remove this only for test
    uint256 public count;
    address public latestSender;
    address public latestTxOrigin;
    address public latestAddressThis;

    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    event CallExecuted(address indexed sender, address indexed to, uint256 value, bytes data);
    event BatchExecuted(uint256 indexed nonce, Call[] calls);
    event AddCount(address indexed msgSender, address indexed txOrigin, uint256 count);

    fallback() external payable {}
    receive() external payable {}

    function getNonce() public view returns (uint256) {
        return _getNonceSlot().value;
    }

    function computeBatchDigest(uint256 _nonce, Call[] calldata calls)
        public
        view
        returns (bytes32 ethSignedMessageHash)
    {
        bytes32 digest = keccak256(abi.encode(block.chainid, _nonce, calls));
        ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(digest);
    }

    function getRecoveredSignerFromBatch(uint256 _nonce, Call[] calldata calls, bytes calldata signature)
        public
        view
        returns (address)
    {
        bytes32 ethSignedMessageHash = computeBatchDigest(_nonce, calls);
        return ECDSA.recover(ethSignedMessageHash, signature);
    }

    function execute(Call[] calldata calls, bytes calldata signature) external payable {
        uint256 currentNonce = getNonce();
        address recovered = getRecoveredSignerFromBatch(currentNonce, calls, signature);

        require(recovered != address(0), "Signature recovery failed");
        require(recovered == address(this), "Invalid signature");

        _executeBatch(recovered, calls, currentNonce);
    }

    function execute(Call[] calldata calls) external payable returns (bytes[] memory) {
        require(msg.sender == address(this), "Invalid authority");
        return _executeBatch(msg.sender, calls, getNonce());
    }

    function addCount() external {
        latestSender = msg.sender;
        latestTxOrigin = tx.origin;
        latestAddressThis = address(this);
        emit AddCount(msg.sender, tx.origin, count);
        count++;
    }

    function _executeBatch(address executor, Call[] calldata calls, uint256 nonceForEvent)
        internal
        returns (bytes[] memory)
    {
        _incrementNonce();
        bytes[] memory returndata = new bytes[](calls.length);
        for (uint256 i = 0; i < calls.length; ++i) {
            returndata[i] = Address.functionCallWithValue(calls[i].to, calls[i].data, calls[i].value);
            emit CallExecuted(executor, calls[i].to, calls[i].value, calls[i].data); // 이벤트 발생
        }
        emit BatchExecuted(nonceForEvent, calls);

        return returndata;
    }

    function _incrementNonce() private {
        StorageSlot.Uint256Slot storage nonceSlot = _getNonceSlot();
        nonceSlot.value++;
    }

    function _getNonceSlot() private pure returns (StorageSlot.Uint256Slot storage) {
        bytes32 baseNonceSlot = _NONCE_NAMESPACE.erc7201Slot();
        return StorageSlot.getUint256Slot(baseNonceSlot);
    }

    // todo 위임한 컨트랙트에서는 호출 시 BAD_DATA 반환 오류, 직접배포한 주소는 정상동작, getNonce 함수는 정상동작함
    function debugNonceSlot() public pure returns (bytes32) {
        return _NONCE_NAMESPACE.erc7201Slot();
    }
}
