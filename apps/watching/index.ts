import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'

// Configuration
const RONIN_RPC_URL = 'https://ronin.lgns.net/rpc'
const WALLET_ADDRESS = '0x445ba6f9f553872fa9cdc14f5c0639365b39c140'
const USDC_CONTRACT_ADDRESS = '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc'
const CHECK_INTERVAL = 20000 // 10 seconds
const CSV_FILE_PATH = path.join(process.cwd(), 'usdc_balance_history.csv')

// ERC-20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
]

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(RONIN_RPC_URL)
const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, provider)

// Initialize CSV file with headers if it doesn't exist
function initializeCsvFile() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const headers = 'timestamp,datetime,block_number,usdc_balance_raw,usdc_balance_formatted,ron_balance_raw,ron_balance_formatted\n'
    fs.writeFileSync(CSV_FILE_PATH, headers)
    console.log(`Created CSV file: ${CSV_FILE_PATH}`)
  } else {
    console.log(`CSV file already exists: ${CSV_FILE_PATH}`)
  }
}

// Append data to CSV file
function appendToCsv(
  timestamp: number,
  datetime: string,
  blockNumber: number,
  usdcBalanceRaw: string,
  usdcBalanceFormatted: string,
  ronBalanceRaw: string,
  ronBalanceFormatted: string,
) {
  const row = `${timestamp},${datetime},${blockNumber},${usdcBalanceRaw},${usdcBalanceFormatted},${ronBalanceRaw},${ronBalanceFormatted}\n`
  fs.appendFileSync(CSV_FILE_PATH, row)
}

// Get USDC balance
async function getUsdcBalance(): Promise<{
  balance: bigint
  formattedBalance: string
}> {
  try {
    // Check if contract methods exist
    if (!usdcContract.balanceOf || !usdcContract.decimals) {
      throw new Error('Contract methods not available')
    }

    // Get USDC balance
    const balance = (await usdcContract.balanceOf(WALLET_ADDRESS)) as bigint

    // Get USDC decimals (should be 6 for USDC)
    const decimals = (await usdcContract.decimals()) as bigint

    // Format balance to human readable form
    const formattedBalance = ethers.formatUnits(balance, decimals)

    return {
      balance,
      formattedBalance,
    }
  } catch (error) {
    console.error('Error fetching USDC balance:', error)
    throw error
  }
}

// Get RON balance (native token)
async function getRonBalance(): Promise<{
  balance: bigint
  formattedBalance: string
}> {
  try {
    // Get RON balance (native token)
    const balance = await provider.getBalance(WALLET_ADDRESS)

    // RON has 18 decimals (standard for native tokens)
    const formattedBalance = ethers.formatEther(balance)

    return {
      balance,
      formattedBalance,
    }
  } catch (error) {
    console.error('Error fetching RON balance:', error)
    throw error
  }
}

// Get both balances and current block
async function getBalances(): Promise<{
  usdcBalance: bigint
  usdcFormattedBalance: string
  ronBalance: bigint
  ronFormattedBalance: string
  blockNumber: number
}> {
  try {
    // Get current block number and both balances in parallel
    const [blockNumber, usdcResult, ronResult] = await Promise.all([provider.getBlockNumber(), getUsdcBalance(), getRonBalance()])

    return {
      usdcBalance: usdcResult.balance,
      usdcFormattedBalance: usdcResult.formattedBalance,
      ronBalance: ronResult.balance,
      ronFormattedBalance: ronResult.formattedBalance,
      blockNumber,
    }
  } catch (error) {
    console.error('Error fetching balances:', error)
    throw error
  }
}

// Main monitoring function
async function monitorBalances() {
  console.log(`Starting balance monitoring...`)
  console.log(`Wallet Address: ${WALLET_ADDRESS}`)
  console.log(`USDC Contract: ${USDC_CONTRACT_ADDRESS}`)
  console.log(`Check Interval: ${CHECK_INTERVAL}ms (${CHECK_INTERVAL / 1000}s)`)
  console.log(`CSV Output: ${CSV_FILE_PATH}`)
  console.log('Press Ctrl+C to stop monitoring\n')

  // Initialize CSV file
  initializeCsvFile()

  let consecutiveErrors = 0
  const maxConsecutiveErrors = 5

  const monitoringLoop = async () => {
    try {
      const { usdcBalance, usdcFormattedBalance, ronBalance, ronFormattedBalance, blockNumber } = await getBalances()

      const timestamp = Date.now()
      const datetime = new Date(timestamp).toISOString()

      // Log to console
      console.log(`[${datetime}] Block: ${blockNumber}`)
      console.log(`  USDC Balance: ${usdcFormattedBalance}`)
      console.log(`  RON Balance: ${ronFormattedBalance}`)

      // Append to CSV
      appendToCsv(timestamp, datetime, blockNumber, usdcBalance.toString(), usdcFormattedBalance, ronBalance.toString(), ronFormattedBalance)

      // Reset error counter on successful fetch
      consecutiveErrors = 0
    } catch (error) {
      consecutiveErrors++
      console.error(`Error ${consecutiveErrors}/${maxConsecutiveErrors}:`, error)

      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.error('Too many consecutive errors. Stopping monitoring.')
        process.exit(1)
      }
    }

    // Schedule next check
    setTimeout(monitoringLoop, CHECK_INTERVAL)
  }

  // Start monitoring
  monitoringLoop()
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nMonitoring stopped by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nMonitoring stopped')
  process.exit(0)
})

// Start the monitoring
monitorBalances().catch((error) => {
  console.error('Failed to start monitoring:', error)
  process.exit(1)
})
