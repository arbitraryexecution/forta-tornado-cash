const { Finding, FindingSeverity, FindingType } = require("forta-agent");

// Addresses of tornado.cash contracts that handle deposits and withdrawals
const TORNADO = {
  "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc": true, // 0.1 ETH
  "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936": true, // 1.0 ETH
  "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf": true, // 10  ETH
  "0xa160cdab225685da1d56aa342ad8841c3b53f291": true  // 100 ETH
}

const handleTransaction = async (txEvent) => {
  const findings = [];
  
  const withdrawSignature = "Withdrawal(address,bytes32,address,uint256)";
  const depositSignature = "Deposit(bytes32,uint32,uint256)";
  
  // Check the 0.1, 1, 10, and 100 ETH tornado.cash contracts
  const tornadoAddress = Object.keys(txEvent.addresses).find(address => TORNADO[address]);
  if (!tornadoAddress) return findings;
  
  const withdrawLog = txEvent.filterEvent(withdrawSignature, tornadoAddress); 
  const depositLog = txEvent.filterEvent(depositSignature, tornadoAddress);
    
  if (withdrawLog.length != 0) {
    
    // Withdrawal address is 0-padded at the beginning of the log data
    // Manually decode it for the finding
    const to = withdrawLog[0].data.slice(26,66);
    findings.push(
      Finding.fromObject({
        name: "Tornado.cash withdrawal",
        description: `Withdrawal to 0x${to}`,
        alertId: "AE-FORTA-0",
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious
      })
    );
  }
  return findings;
};

module.exports = {
  handleTransaction,
};
