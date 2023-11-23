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

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname === '/';

  return (
    <>
      <SideNavBar />
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<div>Main Content Here</div>} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/collection" element={<Collection />} />
      </Routes>
    </>
  );
}

function App() {
  
  return (
    <Router>
      <ThirdwebProvider
        activeChain="mumbai"
        clientId="cb0bcf9cb91ad584a61a6c9d1210fb17"
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
