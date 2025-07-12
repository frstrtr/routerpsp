const TronWebModule = require('tronweb');
const TronWeb = TronWebModule.TronWeb; // <--- Access the TronWeb property
const tronWeb = new TronWeb({ fullHost: 'https://api.shasta.trongrid.io' });
console.log(tronWeb);