// frontend/components/SideNavBar.tsx
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './SideNavBar.css';
import React, { useState } from 'react';

function SideNavBar() {

  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const address = useAddress();

  React.useEffect(() => {
    if (address) {
      console.log(`Wallet connected: ${address}`);
    }
  }, [address]);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleSidebarClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div className={`side-nav-bar ${isSidebarVisible ? 'visible' : ''}`} onClick={handleSidebarClick}>
      <div className="trigger" onClick={toggleSidebar}></div>
      <a href="/" className="d-block mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">LogoHere</span>
      </a>
      <ConnectWallet
        theme={"dark"}
        btnTitle={"Connect Machine"}
        modalTitle={"Choose your Machine!"}
        switchToActiveChain={true}
        modalSize={"compact"}
        welcomeScreen={{
          title: "Welcome!",
          subtitle: "",
        }}
      />
      <ul className="nav nav-pills flex-column mb-auto">
      </ul>
    </div>
  );
}

export default SideNavBar;
