//This script will deploy your InvoiceFactory to the Shasta testnet.
// You'll need to hardcode the Shasta USDT token address (TG3XXyLgjRGLFySgFNpCxiR4vC1Mca53vB) in this script, 
// as it's passed to the factory's constructor.

const InvoiceFactory = artifacts.require("InvoiceFactory");

// Shasta USDT token address (TRC-20) in HEX format, NO '0x' prefix
const USDT_ADDRESS = "41a614f803b6fd780986a42c78ec9c7f77e6ded13c";

module.exports = async function(deployer) {
  await deployer.deploy(InvoiceFactory, USDT_ADDRESS);
};
