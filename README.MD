
# Router PSP - comprehensive automated non-custodial PSP

---

## Development, Build, and Test Instructions


### 1. Prerequisites

#### Ubuntu CLI Dependency Installation

## Install Tronbox globally

```

---

### 2. Local Tron Quickstart Node (Recommended for Testing)

#### Detailed Docker Setup for Local Tron Test Node

1. **Clone and start the official Tron Quickstart local node:**

   - **Step 1: Clone the official repo:**
     ```bash
     git clone https://github.com/TRON-US/docker-tron-quickstart.git
     cd docker-tron-quickstart
     ```

   - **Step 2: Read the latest setup and usage instructions:**
     ```bash
     cat README.md
     ```
     The README contains up-to-date details for running the local node and using the available accounts.

   - **Step 3: Start the local Tron Quickstart node (see README for options):**
     ```bash
     docker run -it -p 9090:9090 --rm --name tron trontools/quickstart:latest
     ```
     > **Note:** The initial download of the Docker image may take several minutes depending on your internet speed, as the image is large. Subsequent runs will be much faster.
     - This starts a private Tron network at `http://127.0.0.1:9090` with pre-funded test accounts.
     - You will see a list of available accounts and private keys in the container logs. Use any of these for local development.
     - You can view the accounts at any time:
       ```bash
       curl http://127.0.0.1:9090/admin/accounts
       ```
     - To stop the node, press `Ctrl+C` in the terminal running Docker.

2. **Configure `tronbox.js` for local development:**
   ```js
   module.exports = {
     networks: {
       development: {
         privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
         fullHost: 'http://127.0.0.1:9090',
         network_id: '*'
       },
       // ...shasta config...
     },
     compilers: {
       solc: {
         version: '0.8.20'
       }
     }
   };
   ```
   Use any of the private keys printed by Quickstart for local testing.

---


2. **Configure `tronbox.js` for local development:**
   ```js
   module.exports = {
     networks: {
       development: {
         privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
         fullHost: 'http://127.0.0.1:9090',
         network_id: '*'
       },
       // ...shasta config...
     },
     compilers: {
       solc: {
         version: '0.8.20'
       }
     }
   };
   ```
   Use any of the private keys printed by Quickstart for local testing.

### 3. Building and Migrating Contracts

**Compile contracts:**
```bash
tronbox compile
```

**Deploy contracts to local node:**
```bash
tronbox migrate --network development --reset
```

**Deploy contracts to Shasta testnet:**
```bash
tronbox migrate --network shasta --reset
```

 > **Note:** Deploying to Shasta requires testnet TRX. Use the [Shasta Faucet](https://shasta.tronex.io/join/getJoinPage) to fund your deployer account.

### 4. Running Tests

**Run tests on local node (recommended, no TRX cost):**
```bash
tronbox test
```

**Run tests on Shasta (uses real testnet TRX):**
```bash
tronbox test --network shasta
```

### 5. Troubleshooting

- If you see `connect ECONNREFUSED 127.0.0.1:9090`, ensure the Quickstart node is running.
- If you see `invalid address` errors, check that addresses are in the correct format (hex, no `0x` prefix for Tron).
- If you see `not enough bandwidth/energy`, fund your testnet account.
- For `tronweb` errors in tests, use the correct import and instantiation:
  ```js
  const TronWeb = require('tronweb');
  const tronWeb = new TronWeb({ fullHost: 'http://127.0.0.1:9090' });
  // or use TronWeb.utils.sha3(...)
  ```

### 6. Useful Links

- [Tron Quickstart Docker](https://hub.docker.com/r/trontools/quickstart)
- [Tron Quickstart GitHub](https://github.com/TRON-US/docker-tron-quickstart)
- [Tronbox Documentation](https://github.com/tronprotocol/tron-box)
- [Shasta Faucet](https://shasta.tronex.io/join/getJoinPage)

---
