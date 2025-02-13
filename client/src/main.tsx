import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth'

import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import ErrorBoundary from './ErrorBoundary.tsx'
import { Toaster } from 'sonner'
import { defineChain } from "viem";
import { OCConnect } from '@opencampus/ocid-connect-js'
import { BrowserRouter } from 'react-router'

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
});

const openCampusChain = defineChain({
  id: 656476,
  network: "Open Campus Codex",
  name: "Open Campus Codext",
  nativeCurrency: {
    name: "EDU",
    symbol: "EDU",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
    default: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Scout",
      url: "https://opencampus-codex.blockscout.com/",
    },
  },
  contracts: {
  },
  testnet: true,
});


const opts = {
  redirectUri: 'http://localhost:5173/redirect',
  referralCode: 'PARTNER6'
}

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
          },
          defaultChain: openCampusChain,
          supportedChains: [openCampusChain],
        }}
      >
        <OCConnect opts={opts} sandboxMode={true}>
          <BrowserRouter>
            <App />
          </BrowserRouter>

        </OCConnect>

        <Toaster />

      </PrivyProvider>
    </ErrorBoundary>



  </StrictMode>,
)
