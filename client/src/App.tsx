import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'

import { usePrivy, useWallets } from '@privy-io/react-auth';
import HomeBeforeLogin from './pages/HomeBeforeLogin';
import HomeAfterLogin from './pages/HomeAfterLogin';

function App() {

  const { authenticated } = usePrivy();

  const { wallets } = useWallets();
  console.log(JSON.stringify(wallets));
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authenticated ? <HomeAfterLogin /> : <HomeBeforeLogin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
