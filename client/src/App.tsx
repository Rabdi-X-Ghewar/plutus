import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'

import { usePrivy, useWallets } from '@privy-io/react-auth';
import HomeBeforeLogin from './pages/HomeBeforeLogin';
import HomeAfterLogin from './pages/HomeAfterLogin';
import Home from './pages/Home';
import { addUserToDatabase } from './apiClient';
import { useEffect } from 'react';
import WalletTracker from './pages/WalletTracker';
import Profile from './pages/Profile';

function App() {

  const { authenticated, user } = usePrivy();
  useEffect(() => {
    if (authenticated) {
      addUserToDatabase(user);
    }

  }, [user]);
  // console.log(JSON.stringify(user));
  const { wallets } = useWallets();
  console.log(JSON.stringify(wallets));
  return (
    <BrowserRouter>
      {authenticated ? <HomeAfterLogin /> : <HomeBeforeLogin />}
      <div className="ml-64 px-3">
        <Routes>
          {authenticated && (
            <>
              <Route path="/profile" element={<Profile />} />
              <Route path="/watcher" element={<WalletTracker />} />
            </>
          )}
        </Routes>
      </div>

    </BrowserRouter>
  )
}

export default App
