// frontend/src/App.tsx
import SideNavBar from './sidenavbar/SideNavBar';
import Header from './header/Header';
import {
  ThirdwebProvider,
  metamaskWallet,
  walletConnect,
  trustWallet,
  rainbowWallet,
} from "@thirdweb-dev/react";

function App() {
  
  return (
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
      <SideNavBar />
      <Header />
    </ThirdwebProvider>
  );
}

export default App;
