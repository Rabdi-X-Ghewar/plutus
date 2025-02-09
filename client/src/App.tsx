import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './App.css'

import { usePrivy, useWallets } from '@privy-io/react-auth';
import HomeBeforeLogin from './pages/HomeBeforeLogin';
import HomeAfterLogin from './pages/HomeAfterLogin';
// import Home from './pages/Home';
import { addUserToDatabase } from './apiClient';
import { useEffect } from 'react';
import WalletTracker from './pages/WalletTracker';
import Profile from './pages/Profile';
import SavedWalletsPage from './pages/SavedWalletsPage';
import AgentDetails from './pages/AgentDetails';

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
              <Route path="/" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/watcher" element={<WalletTracker />} />
              <Route path="/send" element={<SavedWalletsPage />} />
              <Route path="/agent" element={<AgentDetails/>}/>
            </>
          )}
        </Routes>
      </div>

    </BrowserRouter>
  )
}

export default App
