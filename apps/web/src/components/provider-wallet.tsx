import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { useMemo, type JSX } from 'react'

interface ProviderWalletProps {
  children: JSX.Element | JSX.Element[]
}

export default function ProviderWallet({ children }: ProviderWalletProps) {
  const network = 'https://rpc.gorbagana.wtf'

  const wallets = useMemo(() => [new BackpackWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
