// frontend/components/SideNavBar.tsx
import { ConnectWallet } from "@thirdweb-dev/react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './SideNavBar.css';

interface SideNavBarProps {
  onWalletConnect: (connected: boolean) => void;
}

function SideNavBar({ onWalletConnect }: SideNavBarProps) {
  return (
    <>
    <div className="side-nav-bar">
      <div className="trigger"></div>
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
