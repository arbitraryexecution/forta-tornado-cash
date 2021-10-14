const { Finding, FindingSeverity, FindingType } = require('forta-agent');

// Addresses of tornado.cash contracts that handle deposits and withdrawals
// There are contract addresses for 0.1, 1, 10, and 100 ETH denominations
const TORNADO = require('./addresses.json');

const handleTransaction = async (txEvent) => {
  const findings = [];

  const withdrawSignature = 'Withdrawal(address,bytes32,address,uint256)';

  // Check each of the tornado.cash contracts
  const tornadoAddress = Object.keys(txEvent.addresses).find((address) => TORNADO[address]);
  if (!tornadoAddress) return findings;

  const withdrawLog = txEvent.filterEvent(withdrawSignature, tornadoAddress);
  console.log(withdrawLog);

  if (withdrawLog.length !== 0) {
    // Withdrawal address is 0-padded at the beginning of the log data
    // Manually decode it for the finding
    const to = withdrawLog[0].data.slice(26, 66);
    findings.push(
      Finding.fromObject({
        name: 'Tornado.cash withdrawal',
        description: `Withdrawal to 0x${to}`,
        alertId: 'AE-TORNADO-WITHDRAW',
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
        metadata: {
          to: `0x${to}`,
          hash: txEvent.hash,
          amount: `${TORNADO[tornadoAddress]} ETH`,
        },
        everestId: '0x55d07cab60a86966a01680e2242c4af4080a5566',
      }),
    );
  }
  return findings;
};

module.exports = {
  handleTransaction,
};
