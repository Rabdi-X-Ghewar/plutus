import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth'

import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import ErrorBoundary from './ErrorBoundary.tsx'
import { Toaster } from 'sonner'

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PrivyProvider
        appId='cm6kt4h9p002lzv9jj5zvecdr'

        config={{
          externalWallets: {
            solana: {
              connectors: solanaConnectors,
            }
          },
          loginMethods: ['email'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            walletList: [
              'metamask', 'coinbase_wallet', 'rainbow', 'wallet_connect', 'phantom', 'safe', 'detected_wallets',
            ]
          }
        }}
      >
        <App />
        <Toaster />

      </PrivyProvider>
    </ErrorBoundary>



  </StrictMode>,
)
