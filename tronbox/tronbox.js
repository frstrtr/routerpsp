require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY_SHASTA;

module.exports = {
  networks: {
    development: {
      // These are the default settings for Tronbox's local development network
      // privateKey: 'your_private_key_here', // You can use any dummy key for local
      privateKey: privateKey, // You can use any dummy key for local
      userFeePercentage: 100,
      feeLimit: 1e9,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '*'
    },
    shasta: {
      privateKey: privateKey,
      userFeePercentage: 100,
      feeLimit: 1e9,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '*'
    }
  },
  compilers: {
    solc: {
      version: "0.8.20"
    }
  }
};
