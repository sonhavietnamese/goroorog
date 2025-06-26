# USDC Balance Monitor for Ronin Blockchain

This script monitors the USDC balance of a specific wallet address on the Ronin blockchain every 2 seconds and stores the data in a CSV file.

## Features

- ✅ Monitors USDC balance every 2 seconds
- ✅ Stores data in CSV format with timestamps
- ✅ Includes both raw and formatted balance values
- ✅ Records block numbers for each check
- ✅ Error handling with automatic retries
- ✅ Graceful shutdown on Ctrl+C

## Configuration

The script is pre-configured with:

- **Wallet Address**: `0x445ba6f9f553872fa9cdc14f5c0639365b39c140`
- **USDC Contract**: `0x0b7007c13325c48911f73a2dad5fa5dcbf808adc` (Ronin mainnet)
- **RPC Endpoint**: `https://api-gateway.skymavis.com/rpc`
- **Check Interval**: 2 seconds

## Installation

```bash
bun install
```

## Usage

### Start monitoring:
```bash
bun start
```

### Or run in development mode with auto-reload:
```bash
bun dev
```

### Stop monitoring:
Press `Ctrl+C` to stop the monitoring gracefully.

## Output

The script creates a CSV file named `usdc_balance_history.csv` in the current directory with the following columns:

- `timestamp`: Unix timestamp in milliseconds
- `datetime`: ISO string format of the date and time
- `block_number`: Ronin blockchain block number
- `usdc_balance_raw`: Raw balance value (in smallest USDC units)
- `usdc_balance_formatted`: Human-readable balance (in USDC)

### Example CSV output:
```csv
timestamp,datetime,block_number,usdc_balance_raw,usdc_balance_formatted
1735123456789,2024-12-25T12:30:56.789Z,28000123,1500000000,1500.0
1735123458789,2024-12-25T12:30:58.789Z,28000124,1500000000,1500.0
```

## Console Output

The script provides real-time console output showing:
- Current block number
- USDC balance in human-readable format
- Timestamp of each check
- Any errors that occur

### Example console output:
```
Starting USDC balance monitoring...
Wallet Address: 0x445ba6f9f553872fa9cdc14f5c0639365b39c140
USDC Contract: 0x0b7007c13325c48911f73a2dad5fa5dcbf808adc
Check Interval: 2000ms (2s)
CSV Output: /path/to/usdc_balance_history.csv
Press Ctrl+C to stop monitoring

[2024-12-25T12:30:56.789Z] Block: 28000123, USDC Balance: 1500.0
[2024-12-25T12:30:58.789Z] Block: 28000124, USDC Balance: 1500.0
```

## Error Handling

- The script will retry on network errors
- After 5 consecutive errors, the script will stop automatically
- All errors are logged to the console with timestamps

## Customization

To monitor a different address or token, edit the configuration constants in `index.ts`:

```typescript
const WALLET_ADDRESS = '0x445ba6f9f553872fa9cdc14f5c0639365b39c140';
const USDC_CONTRACT_ADDRESS = '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc';
const CHECK_INTERVAL = 2000; // milliseconds
```

## Technical Details

- Built with Bun runtime and TypeScript
- Uses ethers.js v6 for blockchain interactions
- Connects to Ronin blockchain via official RPC endpoint
- USDC uses 6 decimal places on Ronin
- Data is appended to CSV file in real-time

## Requirements

- Bun runtime
- Internet connection
- Access to Ronin blockchain RPC endpoint
