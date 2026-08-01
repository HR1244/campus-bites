import React, { useEffect, useRef, useState } from 'react';

export default function Navbar({
  theme,
  toggleTheme,
  navOpen,
  setNavOpen,
  navScrolled,
  activeSection,
  cartCount,
  onCartClick,
  currentUser,
  onLoginClick,
  onLogout,
  onAddProductClick,
  onAdminDashboardClick,
  onMyOrdersClick
}) {
  const [bump, setBump] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(t);
  }, [cartCount]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'xerox', label: 'Xerox' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar${navScrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <div className="logo-plate">
            <img src="chef logo.jpg" alt="logo" className="logo-img" />
          </div>
          <div>
            <span className="logo-text">Campus Bites</span>
            <span className="logo-sub">SPNREC, Araria Canteen</span>
          </div>
        </div>

        <ul className={`nav-links${navOpen ? ' open' : ''}`} id="navLinks">
          {navLinks.map(link => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`nav-link${activeSection === link.id ? ' active' : ''}`}
                id={`nl-${link.id}`}
                onClick={() => setNavOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            id="themeToggle"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
          >
            <span className="theme-icon" id="themeIcon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {!(currentUser && currentUser.role === 'admin') && (
            <button className="cart-btn" id="cartBtn" aria-label="Open cart" onClick={onCartClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              <span className={`cart-badge${bump ? ' bump' : ''}`} id="cartBadge">{cartCount}</span>
            </button>
          )}

          {currentUser ? (
            <div className="user-profile-wrapper">
              <button 
                className="user-badge-btn" 
                onClick={() => setDropdownOpen(o => !o)}
                title={currentUser.name}
              >
                {currentUser.name[0].toUpperCase()}
              </button>
              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <div className="user-info-name">{currentUser.name}</div>
                    <div className="user-info-detail">{currentUser.email || currentUser.phone}</div>
                    <span className={`user-role-badge ${currentUser.role}`}>
                      {currentUser.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <hr className="dropdown-divider" />
                  <button 
                    className="dropdown-item" 
                    onClick={() => { setDropdownOpen(false); onMyOrdersClick(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    My Orders
                  </button>
                  {currentUser.role === 'admin' && (
                    <>
                      <button 
                        className="dropdown-item admin-item" 
                        onClick={() => { setDropdownOpen(false); onAdminDashboardClick(); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                        Admin Dashboard
                      </button>
                      <button 
                        className="dropdown-item admin-item" 
                        onClick={() => { setDropdownOpen(false); onAddProductClick(); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Product
                      </button>
                    </>
                  )}
                  <button 
                    className="dropdown-item logout-item" 
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-login-btn" onClick={onLoginClick}>
              Login
            </button>
          )}

          <button className="hamburger" id="hamburger" aria-label="Toggle menu" onClick={() => setNavOpen(o => !o)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
