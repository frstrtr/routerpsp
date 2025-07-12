// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./InvoiceForwarder.sol"; // <-- Add this import

// This is the main factory contract.
contract InvoiceFactory {
    // --- State Variables ---

    address public owner; // The address of the platform owner/administrator.
    address public usdtTokenAddress; // The address of the TRC-20 USDT token contract.

    // A mapping to keep track of the deployed invoice contracts.
    // The key is the 'salt' (e.g., your internal invoice ID), and the value is the deployed contract address.
    mapping(bytes32 => address) public deployedInvoices;

    // --- Events ---

    // This event is emitted every time a new invoice contract is created.
    // Your backend can listen for this event to get the new address.
    event InvoiceCreated(
        bytes32 indexed salt,
        address contractAddress,
        address sellerWallet
    );
    event DebugBytes(bytes data);
    event DebugAddress(address addr);

    // --- Modifiers ---

    // A simple modifier to restrict certain functions to only be callable by the owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // --- Constructor ---

    // The constructor is called only once when the contract is first deployed.
    // It sets the owner of the factory and the address of the USDT token.
    constructor(address _usdtTokenAddress) {
        owner = msg.sender;
        usdtTokenAddress = _usdtTokenAddress;
    }

    // --- Public Functions ---

    /**
     * @dev Deploys a new InvoiceForwarder contract for a specific invoice.
     * @param _salt A unique identifier for the invoice (e.g., keccak256 hash of your internal invoice ID).
     * @param _sellerWallet The final destination wallet for the funds.
     */
    function createInvoice(
        bytes32 _salt,
        address _sellerWallet
    ) public onlyOwner {
        bytes memory bytecode = type(InvoiceForwarder).creationCode;
        emit DebugBytes(bytecode);
        bytes memory args = abi.encode(
            _sellerWallet,
            usdtTokenAddress,
            address(this)
        );
        emit DebugBytes(args);
        bytecode = abi.encodePacked(bytecode, args);
        emit DebugBytes(bytecode);

        address predictedAddress = getAddress(_salt, bytecode);
        emit DebugAddress(predictedAddress);

        address deployedAddress;
        assembly {
            deployedAddress := create2(
                0,
                add(bytecode, 0x20),
                mload(bytecode),
                _salt
            )
        }
        emit DebugAddress(deployedAddress);

        require(deployedAddress != address(0), "Deployment failed");
        require(deployedAddress == predictedAddress, "Address mismatch");

        deployedInvoices[_salt] = deployedAddress;
        emit InvoiceCreated(_salt, deployedAddress, _sellerWallet);
    }

    /**
     * @dev Triggers the token sweep on a specific deployed invoice contract.
     * @param _salt The unique identifier for the invoice to be swept.
     */
    function triggerSweep(bytes32 _salt) public onlyOwner {
        address invoiceAddress = deployedInvoices[_salt];
        require(invoiceAddress != address(0), "Invoice does not exist");

        // Call the sweepTokens function on the specific InvoiceForwarder contract.
        InvoiceForwarder(invoiceAddress).sweepTokens();
    }

    // --- View Functions ---

    /**
     * @dev Predicts the deployment address for a new invoice contract.
     * @param _salt The unique identifier for the invoice.
     * @param _bytecode The creation bytecode of the InvoiceForwarder contract.
     * @return The predicted address.
     */
    function getAddress(
        bytes32 _salt,
        bytes memory _bytecode
    ) public view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(_bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }
}
