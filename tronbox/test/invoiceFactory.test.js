const InvoiceFactory = artifacts.require("InvoiceFactory");
const TronWeb = require('tronweb');

contract("InvoiceFactory", accounts => {
  // When using a single private key in tronbox.js, only accounts[0] is available.
  // We'll use the deployer's address as the seller for this test.
  const seller = accounts[0];
  const salt = TronWeb.utils.crypto.sha3("test-invoice-1");

  it("should deploy a new InvoiceForwarder", async () => {
    const factory = await InvoiceFactory.deployed();
    const tx = await factory.createInvoice(salt, seller, { from: accounts[0] });
    assert.isNotNull(tx, "Transaction should have been successful");
    const deployed = await factory.deployedInvoices(salt);
    assert.notEqual(deployed, "0x0000000000000000000000000000000000000000", "InvoiceForwarder not deployed");
  });
});