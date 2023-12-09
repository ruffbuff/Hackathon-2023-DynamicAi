// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import {
  ThirdwebProvider,
  metamaskWallet,
  walletConnect,
  trustWallet,
  rainbowWallet,
} from "@thirdweb-dev/react";
import SideNavBar from './sidenavbar/SideNavBar';
import Header from './header/Header';
import Inventory from './pages/Inventory';
import Collection from './pages/Collection';
import Collection2 from './pages/Collection2';

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname === '/';

  return (
    <>
      <SideNavBar />
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<div></div>} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/collection2" element={<Collection2 />} />
      </Routes>
    </>
  );
}

function App() {
  
  return (
    <Router>
      <ThirdwebProvider
        activeChain="mumbai"
        clientId={process.env.REACT_APP_THIRDWEB_CLIENT_ID}
        supportedWallets={[
          metamaskWallet({ recommended: true }),
          walletConnect(),
          trustWallet(),
          rainbowWallet(),
        ]}
        >
        <AppContent />
      </ThirdwebProvider>
    </Router>
  );
}

export default App;
