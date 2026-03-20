import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/node-creation"
            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
            </svg>
            <span>Node Creation</span>
          </NavLink>

          <NavLink
            to="/prediction"
            className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-icon">🤖</span>
            <span>Prediction</span>
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;