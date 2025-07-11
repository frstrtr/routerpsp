require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY_SHASTA;

module.exports = {
  networks: {
    development: {
      // Use the first private key from Tron Quickstart local node
      privateKey: '6dcfab3ec2eccc3d7524f2c03209c55002b94a3e75811a252baf0751e24fd1d6',
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
