const InvoiceFactory = artifacts.require("InvoiceFactory");
const TronWeb = require('tronweb');

contract("InvoiceFactory", accounts => {
  const seller = accounts[1];
  const salt = TronWeb.utils.sha3("test-invoice-1");

  it("should deploy a new InvoiceForwarder", async () => {
    const factory = await InvoiceFactory.deployed();
    await factory.createInvoice(salt, seller, { from: accounts[0] });
    const deployed = await factory.deployedInvoices(salt);
    assert.notEqual(deployed, "0x0000000000000000000000000000000000000000", "InvoiceForwarder not deployed");
  });
});