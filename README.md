# Tornado.cash Withdrawal

## Description

This agent detects withdrawals from tornado.cash. It currently monitors the 0.1, 1.0, 10, and 100 ETH contracts.

## Supported Chains

- Ethereum

## Alerts

- AE-TORNADO-WITHDRAW
  - Fired when an account withdraws any amount from tornado.cash
  - Severity is always set to "medium"
  - Type is always set to "suspicious"

## Test Data

The agent behaviour can be verified with the following transaction:

- 0x0949113a0935cb6184b41ba8e34982ce65918124f72a7baccddb547cafa93a48 (10 ETH withdrawal)
