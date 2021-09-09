const {
  EventType,
  TransactionEvent,
  FindingType,
  FindingSeverity,
  Finding,
  Network,
} = require('forta-agent');
const { handleTransaction } = require('./tornado-withdrawal');

// Log data from a 10 ETH withdrawal from tornado.cash
const logs = [
  {
    address: '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf',
    topics: [
      '0xe9e508bad6d4c3227e881ca19068f099da81b5164dd6d62b2eaf1e8bc6c34931',
      '0x0000000000000000000000007d3bb46c78b0c4949639ce34896bfd875b97ad08',
    ],
    data: '0x0000000000000000000000000d6df47d3ae23217daaf453b709e22dbd4b2c0011fe7033b101f01b7ac1bc8084ec0e3b118272fa391a0716e1e6b48e666e66a7d00000000000000000000000000000000000000000000000000afdbfcdc61c000',
    logIndex: 93,
    blockNumber: 11493512,
    blockHash: '0xe8a5f6ef72df595812744699c18e543c178df2abfb85df9d10b010563aab9e1d',
    transactionIndex: 135,
    transactionHash: '0x0949113a0935cb6184b41ba8e34982ce65918124f72a7baccddb547cafa93a48',
    removed: false,
  },
];

describe('tornado cash withdrawal', () => {
  const createTxEvent = ({ addresses }) => {
    const addrs = { ...addresses };
    const tx = { hash: logs[0].transactionHash };
    return new TransactionEvent(EventType.BLOCK, Network.MAINNET, tx, { logs }, [], addrs, null);
  };

  describe('handleTransaction', () => {
    it('flags tornado.cash withdrawals', async () => {
      const address = '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf';
      const txEvent = createTxEvent(
        { addresses: { [address]: true } },
      );

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Tornado.cash withdrawal',
          description: 'Withdrawal to 0x0d6df47d3ae23217daaf453b709e22dbd4b2c001',
          alertId: 'AE-TORNADO-WITHDRAW',
          protocol: 'ethereum',
          severity: FindingSeverity.Medium,
          type: FindingType.Suspicious,
          metadata: {
            to: '0x0d6df47d3ae23217daaf453b709e22dbd4b2c001',
            hash: logs[0].transactionHash,
          },
          everestId: '0x55d07cab60a86966a01680e2242c4af4080a5566',
        }),
      ]);
    });
  });
});
