const TronWeb = require('tronweb');

// Configure TronWeb instance
const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io', // or your local node
  privateKey: 'YOUR_OWNER_PRIVATE_KEY' // Replace with the private key of the delegator
});

// Parameters
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // Replace with your deployed InvoiceForwarder address
const amount = 100; // Amount of TRX to freeze and delegate
const resource = 'ENERGY'; // or 'BANDWIDTH'

async function delegateResource() {
  try {
    // Freeze TRX and delegate resource to the contract
    const tx = await tronWeb.transactionBuilder.delegateResource(
      contractAddress,
      amount,
      resource,
      tronWeb.defaultAddress.base58
    );
    // Sign and broadcast the transaction
    const signedTx = await tronWeb.trx.sign(tx);
    const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
    console.log('Delegation result:', receipt);
  } catch (err) {
    console.error('Delegation failed:', err);
  }
}

delegateResource();