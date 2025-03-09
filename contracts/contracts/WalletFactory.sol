// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MultiSigAAWallet.sol";
import "@account-abstraction/contracts/core/EntryPoint.sol";

contract WalletFactory {
    event WalletCreated(
        address indexed wallet,
        address[] owners,
        uint requiredSignatures
    );

    mapping(address => bool) public isDeployed;
    mapping(address => address) public userWallets;
    address[] public wallets;
    IEntryPoint public immutable entryPoint;

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
    }

    function createWallet(
        address[] memory _owners,
        uint _requiredSignatures
    ) external returns (address) {
        require(_owners.length > 0, "At least 1 owner required");
        require(
            _requiredSignatures > 0 && _requiredSignatures <= _owners.length,
            "Invalid signature count"
        );

        MultiSigAAWallet wallet = new MultiSigAAWallet(entryPoint);
        wallet.initialize_wallet(_owners, _requiredSignatures);
        wallets.push(address(wallet));
        isDeployed[address(wallet)] = true;
        userWallets[msg.sender] = address(wallet);

        emit WalletCreated(address(wallet), _owners, _requiredSignatures);
        return address(wallet);
    }

    function getWallets() external view returns (address[] memory) {
        return wallets;
    }

    function getUserWallet(address user) external view returns (address) {
        return userWallets[user];
    }
}
