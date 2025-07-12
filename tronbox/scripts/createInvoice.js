require('dotenv').config();
const TronWeb = require('tronweb');
const TronWebConstructor = TronWeb.TronWeb; // <-- Use this for compatibility

// Load sensitive data from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY_SHASTA; // .env: SENDER_PRIVATE_KEY=your_private_key
const FACTORY_ADDRESS = 'TAQMz9XY7ULfDEB6S6a7oA8nvQopWrFiHa'; // Your deployed InvoiceFactory address

// Paste your ABI here as a JS array:
const FACTORY_ABI = [


    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_usdtTokenAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "addr",
                "type": "address"
            }
        ],
        "name": "DebugAddress",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "DebugBytes",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "salt",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "sellerWallet",
                "type": "address"
            }
        ],
        "name": "InvoiceCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_salt",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "_sellerWallet",
                "type": "address"
            }
        ],
        "name": "createInvoice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "deployedInvoices",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_salt",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "_bytecode",
                "type": "bytes"
            }
        ],
        "name": "getAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "_salt",
                "type": "bytes32"
            }
        ],
        "name": "triggerSweep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdtTokenAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }


];

// Set sellerWallet to a valid TRON address
const sellerWallet = 'TFBoqncCC2GWUrfGKrTUD8zbsEW2uhRmb7'; // Example, replace with real seller address
const invoiceId = 'INVOICE-001'; // Any unique string or number for your invoice

// Helper: convert to bytes32 (keccak256 hash of invoiceId)
const salt = TronWeb.utils.crypto.sha3(invoiceId)

const tronWeb = new TronWebConstructor({
    fullHost: 'https://api.shasta.trongrid.io',
    privateKey: PRIVATE_KEY
});

async function createInvoice() {
    const contract = await tronWeb.contract(FACTORY_ABI, FACTORY_ADDRESS);
    const owner = await contract.owner().call();
    console.log('Factory owner:', owner);

    try {
        const tx = await contract.createInvoice(salt, sellerWallet).send({ feeLimit: 100_000_000 });
        console.log('Transaction hash:', tx);
        const receipt = await waitForReceipt(tronWeb, tx);
        console.log('Transaction receipt:', receipt);

        // Decode resMessage if present
        if (receipt && receipt.resMessage) {
            const resMessageDecoded = Buffer.from(receipt.resMessage, 'hex').toString();
            console.log('Decoded resMessage:', resMessageDecoded);
        }

        // Decode contractResult if present
        if (receipt && receipt.contractResult && receipt.contractResult.length > 0) {
            const reasonHex = receipt.contractResult[0];
            // Solidity revert reason is ABI encoded, skip first 4 + 32 + 32 bytes (function selector + offset + length)
            if (reasonHex.length >= 138) {
                const reason = Buffer.from(reasonHex.slice(138), 'hex').toString();
                console.log('Decoded contractResult (revert reason):', reason);
            } else {
                console.log('contractResult (raw):', reasonHex);
            }
        }

        if (receipt && receipt.result && receipt.result !== 'SUCCESS') {
            console.error('Transaction failed:', receipt);
        }
    } catch (err) {
        console.error('Error deploying invoice:', err);
    }

    const deployed = await contract.deployedInvoices(salt).call();
    console.log('Deployed invoice address for salt:', deployed);
}

async function checkOwner() {
    const contract = await tronWeb.contract(FACTORY_ABI, FACTORY_ADDRESS);
    const owner = await contract.owner().call();
    console.log('Factory owner (SC hex):', owner);
    console.log('Factory owner (SC base58):', tronWeb.address.fromHex(owner));
    console.log('Sender (PK base58):', tronWeb.address.fromPrivateKey(PRIVATE_KEY));
}
checkOwner();

createInvoice();
// require(msg.sender == owner, "Caller is not the owner");
// require(deployedAddress != address(0), "Deployment failed");
// require(deployedAddress == predictedAddress, "Address mismatch");

async function waitForReceipt(tronWeb, txID, maxTries = 20, interval = 3000) {
    for (let i = 0; i < maxTries; i++) {
        const receipt = await tronWeb.trx.getTransactionInfo(txID);
        if (receipt && Object.keys(receipt).length > 0) {
            return receipt;
        }
        await new Promise(res => setTimeout(res, interval));
    }
    throw new Error('Transaction receipt not found after waiting.');
}