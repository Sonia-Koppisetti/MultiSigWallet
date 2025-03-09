// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/samples/SimpleAccount.sol";

contract MultiSigAAWallet is SimpleAccount {
    event Deposit(address indexed sender, uint amount);
    event TransactionCreated(
        uint indexed txId,
        address indexed to,
        uint value,
        address token
    );
    event TransactionSigned(uint indexed txId, address indexed signer);
    event TransactionExecuted(uint indexed txId);

    struct Transaction {
        address to;
        uint value;
        address token; // ERC20 token address (0x0 for ETH)
        bool executed;
        uint signatureCount;
    }

    mapping(uint => mapping(address => bool)) public isSigned;
    address[] public owners;
    mapping(uint => Transaction) public transactions;
    uint public txCount;
    uint public requiredSignatures;
    bool private _initialized;

    constructor(IEntryPoint _entryPoint) SimpleAccount(_entryPoint) {}

    function initialize_wallet(
        address[] memory _owners,
        uint _requiredSignatures
    ) public {
        require(!_initialized, "Already initialized");
        require(_owners.length > 0, "At least 1 owner required");
        require(
            _requiredSignatures > 0 && _requiredSignatures <= _owners.length,
            "Invalid signature count"
        );

        owners = _owners;
        requiredSignatures = _requiredSignatures;
        _initialized = true;
    }

    function submitTransaction(
        address _to,
        uint _value,
        address _token
    ) external onlyOwner {
        uint txId = txCount++;
        transactions[txId] = Transaction(_to, _value, _token, false, 0);
        emit TransactionCreated(txId, _to, _value, _token);
    }

    function signTransaction(uint _txId) external onlyOwner {
        require(!isSigned[_txId][msg.sender], "Already signed");
        require(!transactions[_txId].executed, "Transaction already executed");

        transactions[_txId].signatureCount++;
        isSigned[_txId][msg.sender] = true;
        emit TransactionSigned(_txId, msg.sender);

        if (transactions[_txId].signatureCount >= requiredSignatures) {
            executeTransaction(_txId);
        }
    }

    function executeTransaction(uint _txId) public {
        Transaction storage txn = transactions[_txId];
        require(
            txn.signatureCount >= requiredSignatures,
            "Not enough signatures"
        );
        require(!txn.executed, "Already executed");

        txn.executed = true;

        if (txn.token == address(0)) {
            (bool success, ) = txn.to.call{value: txn.value}("");
            require(success, "ETH Transfer Failed");
        } else {
            IERC20 token = IERC20(txn.token);
            require(token.transfer(txn.to, txn.value), "Token Transfer Failed");
        }

        emit TransactionExecuted(_txId);
    }

    function isOwner(address account) public view returns (bool) {
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == account) return true;
        }
        return false;
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransaction(
        uint _txId
    )
        external
        view
        returns (
            address to,
            uint value,
            address token,
            bool executed,
            uint signatureCount
        )
    {
        Transaction memory txn = transactions[_txId];
        return (txn.to, txn.value, txn.token, txn.executed, txn.signatureCount);
    }

    function getTransactionCount() external view returns (uint) {
        return txCount;
    }
}
