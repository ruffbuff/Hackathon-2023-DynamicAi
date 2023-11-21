import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";
import { BsBackpack2, BsCake2 } from "react-icons/bs";
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
          <span className="fs-4">LOGOorBRANhere</span>
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

        <a href="/" className="sidebar-link">
          <BsCake2 className="sidebar-icon" />
          <span>Minft NFT</span>
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
