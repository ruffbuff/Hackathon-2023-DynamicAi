import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { ConnectWallet, useAddress, useBalance } from "@thirdweb-dev/react";
import { BsBackpack2, BsCake2, BsWallet2 } from "react-icons/bs";
import { RiNftLine } from "react-icons/ri";
import { FaBurn } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import './SideNavBar.css';

function SideNavBar() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarVisible(false);
    }
  };

  const walletAddress = useAddress();
  const walletBalanceResult = useBalance();

  const CustomWalletButton = () => {
    const displayAddress = walletAddress
      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
      : 'Not Connected';

    const isConnected = walletAddress != null;
    const walletBalance = walletBalanceResult.data ? walletBalanceResult.data : null;

    const formattedBalance = walletBalance 
      ? Number(walletBalance.displayValue).toFixed(3)
      : '';

    return (
      <div className={`sidebar-wallet-link ${isConnected ? '' : 'disconnected'}`}>
        <BsWallet2 className="sidebar-icon" />
        <div>
          <span>{displayAddress}</span>
          {isConnected && walletBalance && (
            <>
              <br />
              <small style={{ color: 'gray', fontSize: '14px' }}>
                {`${formattedBalance} ${walletBalance.symbol}`}
              </small>
            </>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  return (
    <>
      {!isSidebarVisible && (
        <button className="open-sidebar-btn" onClick={() => setIsSidebarVisible(true)}>Open</button>
      )}
      <div ref={sidebarRef} className={`side-nav-bar ${isSidebarVisible ? 'visible' : ''}`}>
        <a href="/" className="d-block mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4">Welcome</span>
        </a>
        <ConnectWallet
          theme={"dark"}
          className={`custom-connect-button ${!walletAddress ? 'disconnected' : ''}`}
          btnTitle={!walletAddress ? "Connect Wallet" : ""}
          modalTitle={"Choose your Wallet"}
          switchToActiveChain={true}
          modalSize={"compact"}
          welcomeScreen={{
            title: "Welcome!",
            subtitle: "",
          }}
          detailsBtn={CustomWalletButton}
        />

        <a href="/" className="sidebar-link">
          <BsCake2 className="sidebar-icon" />
          <span>Mint</span>
        </a>

        <a href="/collection" className="sidebar-link">
          <FaBurn className="sidebar-icon" />
          <span>DeadLine NFTs</span>
        </a>

        <a href="/collection2" className="sidebar-link">
          <RiNftLine className="sidebar-icon" />
          <span>Final NFTs</span>
        </a>

        <a href="/inventory" className="sidebar-link">
          <BsBackpack2 className="sidebar-icon" />
          <span>Inventory</span>
        </a>

      </div>
    </>
  );
}

export default SideNavBar;
