// frontend/src/header/Header.tsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';

function Header() {
  return (
    <div className="header-container">
      <div className="content-box">
        <div className="image-box">
          <img src="path_to_image.jpg" alt="Description" className="img-fluid"/>
        </div>
        <div className="info-box">
          <h2>Header</h2>
          <p>Info here.</p>
        </div>
        <div className="additional-info-box">
          <p>More info here.</p>
        </div>
      </div>
    </div>
  );
}

export default Header;
