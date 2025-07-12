# Router PSP - comprehensive automated non-custodial PSP

---

## Development, Build, and Test Instructions

### Prerequisites

- **Node.js 16.x** (required for Tronbox 2.2.5 compatibility)
  - Install with [nvm](https://github.com/nvm-sh/nvm):
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 16
    nvm use 16
    ```
- **Tronbox 2.2.5** (for local Quickstart compatibility)
    ```bash
    sudo npm uninstall -g tronbox
    sudo npm install -g tronbox@2.2.5
    ```
- **Docker** (for running the local Tron Quickstart node)
    ```bash
    sudo apt update
    sudo apt install docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER  # Add user to docker group
    # Log out and log back in for group changes to take effect
    ```

### Local Development and Testing (No Testnet TRX Required)

#### 1. Start the Local Tron Quickstart Node

- Clone the official repo and follow its README for the latest details:
    ```bash
    git clone https://github.com/TRON-US/docker-tron-quickstart.git
    cd docker-tron-quickstart
    cat README.md
    ```
- Start the node (initial download may take several minutes):
    ```bash
    # You can try different versions if you encounter migration errors
    docker run -it -p 9090:9090 --rm --name tron trontools/quickstart:2.1.0
    # or
    docker run -it -p 9090:9090 --rm --name tron trontools/quickstart:2.0.22
    # or use latest (may not work for migrations)
    docker run -it -p 9090:9090 --rm --name tron trontools/quickstart:latest
    ```
    - The node will print available accounts and private keys
    - To view accounts at any time: `curl http://127.0.0.1:9090/admin/accounts`
    - To stop the node, press `Ctrl+C`
    
**Note:** Contract migration and testing with Tronbox 2.2.5 and the Quickstart node is often unreliable and may fail with Solidity 0.8.x contracts. Use this setup mainly for TronWeb development and contract compilation. For full deployment and testing, use the Shasta testnet.

#### 2. Configure `tronbox.js` for Local Development

```js
module.exports = {
  networks: {
    development: {
      privateKey: '6dcfab3ec2eccc3d7524f2c03209c55002b94a3e75811a252baf0751e24fd1d6', // Use any Quickstart private key
      userFeePercentage: 100,
      feeLimit: 1e9,
      fullHost: 'http://127.0.0.1:9090',
      network_id: '*'
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
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
```

#### 3. Build, Migrate, and Test Contracts

**Compile contracts:**
```bash
tronbox compile
```

**Deploy contracts to local node:**
```bash
tronbox migrate --network development --reset
# Note: This may fail with "Contract has not been deployed on the network" or similar errors.
```

**Run tests locally:**
```bash
tronbox test --network development
# Note: This may also fail due to migration issues on Quickstart.
```

### Shasta Testnet Deployment

For testnet deployment:
1. Get test TRX from the faucet: [https://shasta.tronex.io/join/getJoinPage](https://shasta.tronex.io/join/getJoinPage)

- You may join the tg TRON developer group by https://t.me/TronOfficialDevelopersGroupEn and use the command

```!shasta TRONaddress to obtain the test tokens.```

2. Deploy to Shasta: `tronbox migrate --network shasta --reset`

3. You need to enter the Shasta USDT address: TG3XXyLgjRGLFySgFNpCxiR4vC1Mca53vB
---

### Troubleshooting

**Common Issues with Local Development:**

1. **"Contract has not been deployed" error with Tronbox 2.2.5 (all Quickstart versions):**
   - This is a known bug with Tronbox 2.2.5 and the Quickstart node (all versions, including 2.1.0, 2.0.22, and latest), especially with Solidity 0.8.x contracts.
   - Ensure the Quickstart node is fully started and showing account list
   - Wait 1-2 minutes after starting the node before attempting migration
   - Try compilation first: `tronbox compile` (should work without errors)
   - If migration still fails, this is expected—use the Shasta testnet for reliable migration and testing

2. **"TypeError: logger.error is not a function":**
   - Switch to Node.js 16: `nvm use 16`
   - Verify version: `node --version` (should show v16.x.x)

3. **Local node not responding:**
   - Check if Docker container is running: `docker ps`
   - Verify node endpoint: `curl http://127.0.0.1:9090/admin/accounts`
   - Restart the Quickstart container if needed

**Important Notes:**
* Always use Node.js 16.x with Tronbox 2.2.5 to avoid compatibility errors
* The local Quickstart node provides free testing without consuming real TRX, but is only reliable for contract compilation and TronWeb development
* Use `nvm use 16` before running Tronbox commands if you have multiple Node versions
* Local Tronbox 2.2.5 with Quickstart is not reliable for contract migration or testing with Solidity 0.8.x—compilation works, but migration and tests may fail
* For reliable contract deployment and testing, use the Shasta testnet (requires a small amount of test TRX)
