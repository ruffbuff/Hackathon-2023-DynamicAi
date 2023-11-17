// frontend/components/SideNavBar.tsx
import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './SideNavBar.css';

function SideNavBar() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsSidebarVisible(false); // Hide the sidebar
    }
  };

  React.useEffect(() => {
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
    </>
  );
}

export default SideNavBar;