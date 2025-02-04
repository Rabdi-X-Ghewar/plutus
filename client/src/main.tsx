import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <PrivyProvider
        appId='cm6kt4h9p002lzv9jj5zvecdr'
        config={{
          loginMethods: ['email'],
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
          }
        }}
      >
        <App />
      </PrivyProvider>


  </StrictMode>,
)
