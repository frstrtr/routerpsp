// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InvoiceForwarder
 * @dev This contract is deployed for each individual invoice. Its sole purpose is to
 * receive a single TRC-20 payment and forward it to the seller's wallet when commanded
 * by the factory. If the factory is unresponsive, the seller can recover funds after 3 days after the first emergency request.
 */
contract InvoiceForwarder {
    address public owner; // The Factory contract's address
    address public sellerWallet; // The seller's final wallet
    address public usdtTokenAddress; // The TRC-20 USDT token address
    uint256 public emergencyTimelockStart;
    uint256 public constant EMERGENCY_DELAY = 3 days;

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
        _transferAll(false);
    }

    /**
     * @dev Emergency function: allows the seller to recover funds after 3 days from first emergency request.
     */
    function emergencyRecover() external {
        require(msg.sender == sellerWallet, "Only seller can recover");
        if (emergencyTimelockStart == 0) {
            require(
                IERC20(usdtTokenAddress).balanceOf(address(this)) > 0,
                "No funds to recover"
            );
            emergencyTimelockStart = block.timestamp;
            revert("Emergency timelock started. Try again after 3 days.");
        }
        require(
            block.timestamp >= emergencyTimelockStart + EMERGENCY_DELAY,
            "Timelock not expired"
        );
        _transferAll(true);
    }

    function _transferAll(bool isEmergency) internal {
        IERC20 usdt = IERC20(usdtTokenAddress);
        uint256 balance = usdt.balanceOf(address(this));
        if (balance > 0) {
            require(usdt.transfer(sellerWallet, balance), "Transfer failed");
            if (isEmergency) {
                emergencyTimelockStart = 0; // Reset after successful emergency recovery
            }
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
