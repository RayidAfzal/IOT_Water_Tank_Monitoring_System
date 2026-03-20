import React from 'react';
import collegeLogo from '../assets/college-logo.png';

const Navbar = ({ onToggleSidebar, isDarkMode, toggleTheme }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="hamburger-btn" onClick={onToggleSidebar}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>

        <div className="logo">
          <img src={collegeLogo} alt="College Logo" className="logo-img" />
        </div>
      </div>

      <div className="navbar-title-group">
        <h1 className="navbar-title">IoT Water Monitoring Dashboard</h1>
        <span className="navbar-subtitle">College Research Affiliate Program</span>
        <span className="navbar-status">● Live</span>
</div>

      <div className="navbar-right">
        <button
          className={`theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <span className="toggle-thumb">
            {isDarkMode ? '🌙' : '☀️'}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;