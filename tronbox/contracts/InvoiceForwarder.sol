// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InvoiceForwarder
 * @dev This contract is deployed for each individual invoice. Its sole purpose is to
 * receive a single TRC-20 payment and forward it to the seller's wallet when commanded
 * by the factory.
 */
contract InvoiceForwarder {
    address public owner; // The Factory contract's address
    address public sellerWallet; // The seller's final wallet
    address public usdtTokenAddress; // The TRC-20 USDT token address

    constructor(address _sellerWallet, address _usdt, address _factory) {
        owner = _factory;
        sellerWallet = _sellerWallet;
        usdtTokenAddress = _usdt;
    }

    /**
     * @dev Sweeps the entire USDT balance of this contract to the seller's wallet.
     * Can only be called by the owner (the Factory contract).
     */
    function sweepTokens() external {
        require(msg.sender == owner, "Only owner can sweep");

        // Define the TRC-20 interface to interact with the USDT contract.
        // We only need the balanceOf and transfer functions.
        IERC20 usdt = IERC20(usdtTokenAddress);
        uint256 balance = usdt.balanceOf(address(this));

        if (balance > 0) {
            require(usdt.transfer(sellerWallet, balance), "Transfer failed");
        }
    }
}

/**
 * @dev A minimal interface for the TRC-20 standard.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
}
