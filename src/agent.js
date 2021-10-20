const { Finding, FindingSeverity, FindingType } = require('forta-agent');
const ethers = require('ethers');

// Addresses of tornado.cash contracts that handle deposits and withdrawals
// There are contract addresses for 0.1, 1, 10, and 100 ETH denominations
const TORNADO = require('./addresses.json');

// Set up ABI so we can parse logs and decode events using ethers
const abi = ['event Withdrawal(address to, bytes32 nullifierHash, address indexed relayer, uint256 fee)'];
const iface = new ethers.utils.Interface(abi);

const handleTransaction = async (txEvent) => {
  const findings = [];

  // Check each of the tornado.cash contracts
  const tornadoAddress = Object.keys(txEvent.addresses).find((address) => TORNADO[address]);
  if (!tornadoAddress) return findings;

  const parsedLogs = txEvent.logs.map((log) => iface.parseLog(log));

  // If the tx contains events that match the abi, parsedLogs will have entries
  if (parsedLogs.length !== 0) {
    // If called from a contract, there could be multiple withdrawal events in one tx
    parsedLogs.forEach((log) => {
      const to = log.args[0].toLowerCase();
      const amount = TORNADO[tornadoAddress];

      findings.push(
        Finding.fromObject({
          name: 'Tornado.cash withdrawal',
          description: `Withdrawal of ${amount} ETH to ${to}`,
          alertId: 'AE-TORNADO-WITHDRAWAL',
          severity: FindingSeverity.Medium,
          type: FindingType.Suspicious,
          metadata: {
            to,
            amount: amount.toString(),
          },
          everestId: '0x55d07cab60a86966a01680e2242c4af4080a5566',
        }),
      );
    });
  }
  return findings;
};

module.exports = {
  handleTransaction,
};
