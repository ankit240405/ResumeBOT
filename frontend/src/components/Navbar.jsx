import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav style={{
      ...styles.navbar,
      background: scrolled 
        ? "rgba(255, 255, 255, 0.98)" 
        : "#FFFFFF",
      boxShadow: scrolled 
        ? "0 2px 12px rgba(0, 0, 0, 0.06)" 
        : "0 1px 0 rgba(0, 0, 0, 0.05)"
    }}>
      <div style={styles.logoSection}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="url(#logoGradient)"/>
                <path d="M20 6L10 14L20 22L30 14L20 6Z" fill="white"/>
                <path d="M10 22L20 30L30 22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 28L20 36L30 28" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="14" r="2" fill="#10B981"/>
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981"/>
                    <stop offset="100%" stopColor="#059669"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={styles.logoText}>
              <span style={styles.companyName}>
                Resume<span style={styles.accent}>BOT</span>
              </span>
              <span style={styles.companyTagline}>
                AI Resume Analyzer
              </span>
            </div>
          </div>
        </Link>
      </div>

      <button 
        style={{
          ...styles.mobileMenuButton,
          background: mobileMenuOpen ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
        }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-menu-button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6L18 18" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <>
              <path d="M3 12H21" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </>
          )}
        </svg>
      </button>

      <div style={styles.navLinks} className="desktop-nav">
        <SignedIn>
          <Link to="/upload" style={styles.navLink} className="nav-link">
            <div style={styles.linkContent}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.linkIcon}>
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Upload Resume</span>
            </div>
          </Link>
          
          <Link to="/profile" style={styles.navLink} className="nav-link">
            <div style={styles.linkContent}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.linkIcon}>
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M5.337 18C6.066 15.347 8.782 13.5 12 13.5C15.218 13.5 17.934 15.347 18.663 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>User Profile</span>
            </div>
          </Link>
          
          <div style={styles.userButtonContainer}>
            <div style={styles.userBadge} className="user-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '6px'}}>
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={styles.userBadgeText}>Verified User</span>
            </div>
            <div style={styles.userButtonWrapper}>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: 40,
                      height: 40,
                      border: "2px solid #10B981"
                    }
                  }
                }}
              />
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <Link to="/login" style={styles.loginLink} className="login-link">
            <div style={styles.linkContent}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.linkIcon}>
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sign In</span>
            </div>
          </Link>
        </SignedOut>
      </div>

      <div style={{
        ...styles.mobileMenu,
        display: mobileMenuOpen ? 'flex' : 'none'
      }} className="mobile-menu">
        <SignedIn>
          <Link to="/upload" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.linkContent}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.linkIcon}>
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Upload Resume</span>
            </div>
          </Link>
          
          <Link to="/profile" style={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.linkContent}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.linkIcon}>
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M5.337 18C6.066 15.347 8.782 13.5 12 13.5C15.218 13.5 17.934 15.347 18.663 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>User Profile</span>
            </div>
          </Link>
          
          <div style={styles.mobileUserSection}>
            <div style={styles.mobileUserBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={styles.userBadgeText}>Verified User</span>
            </div>
            <div style={styles.mobileUserButton}>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: 44,
                      height: 44,
                      border: "2px solid #10B981"
                    }
                  }
                }}
              />
            </div>
          </div>
        </SignedIn>
        
        <SignedOut>
          <Link to="/login" style={styles.mobileLoginLink} onClick={() => setMobileMenuOpen(false)}>
            <div style={styles.linkContent}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.linkIcon}>
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sign In</span>
            </div>
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: "14px 40px",
    background: "#FFFFFF",
    color: "#111827",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #F3F4F6",
    transition: "all 0.3s ease",
    flexWrap: 'wrap',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },

  mobileMenuButton: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },

  mobileMenu: {
    flexDirection: 'column',
    position: 'fixed',
    top: '70px',
    left: 0,
    right: 0,
    background: "#FFFFFF",
    padding: '20px',
    borderTop: "1px solid #F3F4F6",
    borderBottom: "1px solid #F3F4F6",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
    zIndex: 999
  },

  mobileNavLink: {
    color: "#4B5563",
    textDecoration: "none",
    padding: "14px 16px",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    fontSize: "0.95rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    marginBottom: '8px',
    background: '#F9FAFB'
  },

  mobileLoginLink: {
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "white",
    textDecoration: "none",
    padding: "14px 24px",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
    justifyContent: 'center',
    marginTop: '8px'
  },

  mobileUserSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #F3F4F6"
  },

  mobileUserBadge: {
    display: "flex",
    alignItems: "center",
    background: "rgba(16, 185, 129, 0.08)",
    padding: "10px 16px",
    borderRadius: "20px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    width: '100%',
    justifyContent: 'center'
  },

  mobileUserButton: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0
  },

  logoLink: {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    alignItems: "center"
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  logoIcon: {
    width: "34px",
    height: "34px",
    flexShrink: 0
  },

  logoText: {
    display: "flex",
    flexDirection: "column"
  },

  companyName: {
    fontSize: "1.4rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.2,
    whiteSpace: 'nowrap'
  },

  accent: {
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text"
  },

  companyTagline: {
    fontSize: "0.7rem",
    color: "#6B7280",
    fontWeight: "500",
    letterSpacing: "0.3px",
    whiteSpace: 'nowrap'
  },

  navLinks: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flexWrap: 'wrap'
  },

  navLink: {
    color: "#4B5563",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    whiteSpace: 'nowrap'
  },

  linkContent: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  linkIcon: {
    color: "#10B981",
    flexShrink: 0
  },

  userButtonContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  userBadge: {
    display: "flex",
    alignItems: "center",
    background: "rgba(16, 185, 129, 0.08)",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    whiteSpace: 'nowrap'
  },

  userBadgeText: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#10B981"
  },

  userButtonWrapper: {
    marginLeft: "5px"
  },

  loginLink: {
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "white",
    textDecoration: "none",
    padding: "10px 24px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
    whiteSpace: 'nowrap'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .nav-link:hover {
    background: rgba(16, 185, 129, 0.08);
    color: #111827;
    transform: translateY(-1px);
  }

  .nav-link:hover svg {
    stroke: #10B981;
  }

  .login-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .user-badge:hover {
    background: rgba(16, 185, 129, 0.12);
  }

  .mobile-menu-button:hover {
    background: rgba(16, 185, 129, 0.08) !important;
  }

  .mobile-nav-link:hover {
    background: rgba(16, 185, 129, 0.12);
    color: #111827;
    transform: translateX(5px);
  }

  .mobile-nav-link:hover svg {
    stroke: #10B981;
  }

  .mobile-login-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  @media (max-width: 1100px) {
    .user-badge {
      display: none !important;
    }
  }

  @media (max-width: 1024px) {
    .navbar {
      padding: 12px 30px !important;
    }
    
    .nav-link {
      padding: 8px 12px !important;
      font-size: 0.85rem !important;
    }
    
    .login-link {
      padding: 10px 18px !important;
      font-size: 0.85rem !important;
    }
  }

  @media (max-width: 900px) {
    .desktop-nav {
      display: none !important;
    }
    
    .mobile-menu-button {
      display: flex !important;
    }
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 12px 20px !important;
    }
    
    .company-name {
      font-size: 1.2rem !important;
    }
    
    .company-tagline {
      display: none !important;
    }
    
    .mobile-menu {
      padding: 16px !important;
      top: 65px !important;
    }
    
    .mobile-nav-link {
      padding: 14px 18px !important;
      font-size: 0.95rem !important;
      margin-bottom: 6px !important;
    }
    
    .mobile-login-link {
      padding: 14px 20px !important;
      font-size: 0.95rem !important;
      margin-top: 10px !important;
    }
  }

  @media (max-width: 640px) {
    .mobile-menu {
      padding: 14px !important;
      top: 60px !important;
    }
    
    .mobile-nav-link {
      padding: 12px 16px !important;
      font-size: 0.9rem !important;
    }
    
    .mobile-login-link {
      padding: 12px 18px !important;
      font-size: 0.9rem !important;
    }
  }

  @media (max-width: 480px) {
    .navbar {
      padding: 10px 15px !important;
    }
    
    .logo-text {
      display: none !important;
    }
    
    .mobile-menu {
      padding: 12px !important;
      top: 58px !important;
    }
    
    .mobile-nav-link {
      padding: 10px 14px !important;
      font-size: 0.85rem !important;
    }
    
    .mobile-login-link {
      padding: 10px 16px !important;
      font-size: 0.85rem !important;
    }
    
    .mobile-user-section {
      margin-top: 15px !important;
      padding-top: 15px !important;
    }
  }

  @media (max-width: 360px) {
    .navbar {
      padding: 8px 12px !important;
    }
    
    .logo-icon svg {
      width: 28px !important;
      height: 28px !important;
    }
    
    .mobile-menu {
      padding: 10px !important;
      top: 55px !important;
    }
    
    .mobile-nav-link {
      padding: 8px 12px !important;
      font-size: 0.8rem !important;
    }
    
    .mobile-login-link {
      padding: 8px 14px !important;
      font-size: 0.8rem !important;
    }
  }

  @media (min-width: 901px) {
    .mobile-menu {
      display: none !important;
    }
    
    .mobile-menu-button {
      display: none !important;
    }
    
    .desktop-nav {
      display: flex !important;
    }
  }

  @media (max-width: 600px) and (orientation: landscape) {
    .mobile-menu {
      position: fixed;
      top: 60px;
      bottom: 0;
      overflow-y: auto;
      max-height: 70vh;
      padding: 12px !important;
    }
    
    .mobile-nav-link {
      padding: 10px 12px !important;
      margin-bottom: 4px !important;
      font-size: 0.85rem !important;
    }
    
    .mobile-login-link {
      padding: 10px 14px !important;
      font-size: 0.85rem !important;
    }
  }

  @media (min-width: 1200px) {
    .navbar {
      padding: 14px 60px !important;
    }
    
    .nav-links {
      gap: 20px !important;
    }
    
    .nav-link {
      font-size: 0.95rem !important;
      padding: 10px 20px !important;
    }
    
    .login-link {
      font-size: 0.95rem !important;
      padding: 12px 28px !important;
    }
  }

  @media (min-width: 1440px) {
    .navbar {
      padding: 16px 80px !important;
    }
    
    .company-name {
      font-size: 1.5rem !important;
    }
    
    .company-tagline {
      font-size: 0.75rem !important;
    }
  }

  @media (min-width: 1920px) {
    .navbar {
      padding: 18px 100px !important;
    }
    
    .logo-icon {
      width: 38px !important;
      height: 38px !important;
    }
    
    .company-name {
      font-size: 1.6rem !important;
    }
    
    .nav-link {
      font-size: 1rem !important;
      padding: 12px 24px !important;
    }
    
    .login-link {
      font-size: 1rem !important;
      padding: 14px 32px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;