import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-plate small">
              <img src="chef logo.jpg" alt="logo" className="logo-img" />
            </div>
            <div>
              <span className="logo-text">Campus Bites</span>
              <span className="logo-sub">SPNREC, Araria, Canteen</span>
            </div>
          </div>
          <p className="footer-tagline">Fueling student life, one bite at a time.</p>
          <div className="footer-socials">
            {}
            <a href="#" className="social-btn" aria-label="Instagram" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>

            {}
            <a href="#" className="social-btn" aria-label="WhatsApp" title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>

            {}
            <a href="#" className="social-btn" aria-label="Facebook" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Campus Bites, SPNREC Araria. All rights reserved. Made with love for students.</p>
        </div>


        {/* .........................Developer Credit Section......................... */}

        <div className="footer-bottom">
          <p>Website design &amp; built by</p>
          <a href="https://www.linkedin.com/in/ritesh-kumar-825063340/" target="_blank" rel="noreferrer" className="developer-link">
            <strong>Ritesh Kumar </strong>
            <span className="developer-subtitle"> (Front-End Developer) | </span>
          </a>
        

        
          <a href="#" target="_blank" rel="noreferrer" className="developer-link">
            <strong>  Harsh Raj </strong>
            <span className="developer-subtitle"> (Back-End Developer) | </span>
          </a>
        
          <a href="https://www.linkedin.com/in/rashtra-bhushan-694314299/" target="_blank" rel="noreferrer" className="developer-link">
            <strong>  Rashtra Bhushan </strong>
            <span className="developer-subtitle"> (Animation &amp; Design) </span>
          </a>
        </div>
        
        
      </div>
    </footer>
  );
}
