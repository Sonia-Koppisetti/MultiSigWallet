// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/core/Helpers.sol";

contract Paymaster is BasePaymaster {
    mapping(address => bool) private whitelist;

    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    )
        internal
        view
        override
        returns (bytes memory context, uint256 validationData)
    {
        (userOpHash, maxCost);
        address user = userOp.sender;

        context = hex"";

        if (whitelist[user]) {
            validationData = SIG_VALIDATION_SUCCESS;
            return (context, validationData);
        } else {
            validationData = SIG_VALIDATION_FAILED;
            return (context, validationData);
        }
    }

    function addAddress(address user) external onlyOwner {
        whitelist[user] = true;
    }

    function removeAddress(address user) external onlyOwner {
        whitelist[user] = false;
    }

    function checkWhitelist(address user) external view returns (bool) {
        return whitelist[user];
    }
}
