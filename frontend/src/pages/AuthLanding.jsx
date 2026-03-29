import { SignIn, useClerk } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

export default function AuthLanding() {
  const { openSignIn } = useClerk();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.animatedBackground}>
        {[...Array(isMobile ? 3 : 6)].map((_, i) => (
          <div key={i} style={getFloatingElementStyle(i, isMobile)}></div>
        ))}
      </div>

      <div style={{
        ...styles.container,
        ...(isMobile ? styles.containerMobile : {})
      }}>
        <div style={{
          ...styles.leftPanel,
          ...(isMobile ? styles.leftPanelMobile : {})
        }}>
          <div style={styles.leftContent}>
            <div style={styles.logoSection}>
              <div style={{
                ...styles.logoMain,
                ...(isMobile ? { marginBottom: '15px' } : {})
              }}>
                <svg width={isMobile ? "48" : "64"} height={isMobile ? "48" : "64"} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <h1 style={{
                  ...styles.companyName,
                  ...(isMobile ? { fontSize: '2rem' } : {})
                }}>
                  Resume<span style={styles.accent}>BOT</span>
                </h1>
                <p style={{
                  ...styles.companyTagline,
                  ...(isMobile ? { fontSize: '0.9rem' } : {})
                }}>
                  AI Resume Intelligence
                </p>
              </div>
            </div>

            {!isMobile && (
              <>
                <div style={styles.heroSection}>
                  <div style={styles.heroBadge}>
                    <span style={styles.badgeIcon}>✨</span>
                    <span style={styles.badgeText}>AI-Powered Analysis</span>
                  </div>
                  <h2 style={styles.heroTitle}>
                    Optimize Your Resume with<br/>
                    <span style={styles.heroHighlight}>Smart ATS Technology</span>
                  </h2>
                  <p style={styles.heroDescription}>
                    Get instant compatibility scores, intelligent feedback, and expert insights to maximize your career opportunities.
                  </p>
                </div>

                <div style={styles.featuresGrid}>
                  <div style={styles.featureCard}>
                    <div style={styles.featureIcon}>📊</div>
                    <div style={styles.featureContent}>
                      <h3 style={styles.featureTitle}>ATS Score Analysis</h3>
                      <p style={styles.featureDesc}>Real-time compatibility check</p>
                    </div>
                  </div>
                  <div style={styles.featureCard}>
                    <div style={styles.featureIcon}>🤖</div>
                    <div style={styles.featureContent}>
                      <h3 style={styles.featureTitle}>AI Career Mentor</h3>
                      <p style={styles.featureDesc}>Personalized guidance</p>
                    </div>
                  </div>
                  <div style={styles.featureCard}>
                    <div style={styles.featureIcon}>⚡</div>
                    <div style={styles.featureContent}>
                      <h3 style={styles.featureTitle}>Optimization Tips</h3>
                      <p style={styles.featureDesc}>Actionable improvements</p>
                    </div>
                  </div>
                  <div style={styles.featureCard}>
                    <div style={styles.featureIcon}>📈</div>
                    <div style={styles.featureContent}>
                      <h3 style={styles.featureTitle}>Career Analytics</h3>
                      <p style={styles.featureDesc}>Track your progress</p>
                    </div>
                  </div>
                </div>

                
                <div style={styles.statsSection}>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>99%</div>
                    <div style={styles.statLabel}>Accuracy Rate</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>Real-time</div>
                    <div style={styles.statLabel}>ATS Analysis</div>
                  </div>
                  <div style={styles.statItem}>
                    <div style={styles.statNumber}>Instant</div>
                    <div style={styles.statLabel}>Results</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        
        <div style={{
          ...styles.rightPanel,
          ...(isMobile ? styles.rightPanelMobile : {})
        }}>
          <div style={styles.rightContent}>
            <div style={{
              ...styles.loginCard,
              ...(isMobile ? styles.loginCardMobile : {})
            }}>
             
              <div style={styles.cardHeader}>
                <div style={styles.welcomeSection}>
                  <h2 style={{
                    ...styles.welcomeTitle,
                    ...(isMobile ? { fontSize: '1.8rem' } : {})
                  }}>
                    Welcome Back
                  </h2>
                  <p style={{
                    ...styles.welcomeSubtitle,
                    ...(isMobile ? { fontSize: '0.95rem' } : {})
                  }}>
                    {isMobile 
                      ? "Sign in to analyze your resume" 
                      : "Sign in to access your ATS scanner and career insights"}
                  </p>
                </div>
                {!isMobile && (
                  <div style={styles.securityBadge}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12L11 14L15 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={styles.securityText}>Secure & Encrypted</span>
                  </div>
                )}
              </div>

              
              <button
                style={{
                  ...styles.loginBtn,
                  ...(isMobile ? { padding: '16px', fontSize: '1rem' } : {})
                }}
                onClick={() => openSignIn({})}
              >
                {!isMobile && (
                  <svg style={styles.btnIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 12H4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 7L20 12L15 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                Continue to Login / Signup
              </button>

            
              {isMobile && (
                <div style={styles.mobileStats}>
                  <div style={styles.mobileStat}>
                    <div style={styles.mobileStatNumber}>99%</div>
                    <div style={styles.mobileStatLabel}>Accuracy</div>
                  </div>
                  <div style={styles.mobileStat}>
                    <div style={styles.mobileStatNumber}>Real-time</div>
                    <div style={styles.mobileStatLabel}>Analysis</div>
                  </div>
                  <div style={styles.mobileStat}>
                    <div style={styles.mobileStatNumber}>Instant</div>
                    <div style={styles.mobileStatLabel}>Results</div>
                  </div>
                </div>
              )}

              
              <div style={styles.hiddenClerk}>
                <SignIn routing="path" path="/login" />
              </div>

            
              <div style={{
                ...styles.simpleFooter,
                ...(isMobile ? { paddingTop: '15px' } : {})
              }}>
                <p style={{
                  ...styles.copyright,
                  ...(isMobile ? { fontSize: '0.7rem' } : {})
                }}>
                  © 2026 ResumeBOT. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getFloatingElementStyle = (i, isMobile) => ({
  position: 'absolute',
  background: `linear-gradient(45deg, 
    rgba(16, 185, 129, ${0.03 + i * 0.01}), 
    rgba(5, 150, 105, ${0.02 + i * 0.01})
  )`,
  borderRadius: i % 2 === 0 ? '50%' : '20px',
  width: isMobile ? `${40 + i * 15}px` : `${80 + i * 25}px`,
  height: isMobile ? `${40 + i * 15}px` : `${80 + i * 25}px`,
  top: `${(i * (isMobile ? 30 : 20)) % 100}%`,
  left: `${(i * (isMobile ? 25 : 15)) % 100}%`,
  animation: `float ${20 + i * 5}s infinite ease-in-out`,
  filter: isMobile ? 'blur(20px)' : 'blur(30px)',
  opacity: isMobile ? 0.3 : 0.5
});

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden'
  },
  
  container: {
    display: 'flex',
    maxWidth: '1400px',
    width: '100%',
    background: 'white',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.25)',
    minHeight: '850px',
    zIndex: 1,
    position: 'relative'
  },
  
  containerMobile: {
    flexDirection: 'column',
    minHeight: 'auto',
    maxWidth: '100%',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  },
  
  leftPanel: {
    flex: 1.2,
    background: 'linear-gradient(160deg, #0f172a 0%, #111827 100%)',
    color: 'white',
    padding: '60px 50px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  
  leftPanelMobile: {
    padding: '30px 25px',
    flex: 'none',
    height: 'auto',
    minHeight: '280px'
  },
  
  leftContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  
  logoSection: {
    marginBottom: '50px'
  },
  
  logoMain: {
    marginBottom: '20px'
  },
  
  logoText: {
    flex: 1
  },
  
  companyName: {
    fontSize: '3rem',
    fontWeight: '800',
    letterSpacing: '-1px',
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  accent: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  companyTagline: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    fontWeight: '500',
    margin: '0',
    letterSpacing: '0.5px'
  },
  
  heroSection: {
    marginBottom: '50px'
  },
  
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '10px 20px',
    borderRadius: '50px',
    marginBottom: '25px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  
  badgeIcon: {
    fontSize: '18px'
  },
  
  badgeText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#f8fafc'
  },
  
  heroTitle: {
    fontSize: '2.6rem',
    fontWeight: '800',
    lineHeight: '1.2',
    margin: '0 0 20px 0',
    color: '#f8fafc'
  },
  
  heroHighlight: {
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  heroDescription: {
    fontSize: '1.1rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
    margin: '0',
    maxWidth: '550px'
  },
  
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '50px'
  },
  
  featureCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  
  featureIcon: {
    fontSize: '24px',
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  featureContent: {
    flex: 1
  },
  
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 5px 0',
    color: '#f8fafc'
  },
  
  featureDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: '0',
    lineHeight: '1.4'
  },
  
  statsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '30px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  
  statItem: {
    textAlign: 'center'
  },
  
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '5px'
  },
  
  statLabel: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    letterSpacing: '1px'
  },
  
  rightPanel: {
    flex: 1,
    background: '#ffffff',
    padding: '60px 50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  rightPanelMobile: {
    padding: '30px 25px',
    flex: 'none'
  },
  
  rightContent: {
    width: '100%',
    maxWidth: '450px'
  },
  
  loginCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px'
  },
  
  loginCardMobile: {
    padding: '30px 25px',
    borderRadius: '16px',
    boxShadow: 'none'
  },
  
  cardHeader: {
    marginBottom: '40px'
  },
  
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  
  welcomeTitle: {
    fontSize: '2.3rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px 0'
  },
  
  welcomeSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0',
    lineHeight: '1.5'
  },
  
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #dcfce7'
  },
  
  securityText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#059669'
  },
  
  loginBtn: {
    width: '100%',
    padding: '18px 24px',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
    marginBottom: '30px'
  },
  
  btnIcon: {
    width: '20px',
    height: '20px'
  },
  
  mobileStats: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '25px 0',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  
  mobileStat: {
    textAlign: 'center',
    flex: 1
  },
  
  mobileStatNumber: {
    fontSize: '1.3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '3px'
  },
  
  mobileStatLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  hiddenClerk: {
    display: 'none'
  },
  
  simpleFooter: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  
  copyright: {
    fontSize: '0.8rem',
    color: '#6b7280',
    margin: '0'
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { 
      transform: translate(0, 0) rotate(0deg); 
    }
    25% { 
      transform: translate(30px, -20px) rotate(5deg); 
    }
    50% { 
      transform: translate(-20px, 15px) rotate(-5deg); 
    }
    75% { 
      transform: translate(15px, 20px) rotate(3deg); 
    }
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
  }

  /* Tablet Responsive */
  @media (max-width: 1024px) {
    .container {
      max-width: 95% !important;
      min-height: 700px !important;
    }
    
    .left-panel, .right-panel {
      padding: 40px 30px !important;
    }
    
    .company-name {
      font-size: 2.5rem !important;
    }
    
    .hero-title {
      font-size: 2.2rem !important;
    }
    
    .features-grid {
      gap: 15px !important;
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .container {
      flex-direction: column !important;
      min-height: auto !important;
      border-radius: 20px !important;
      margin: 10px !important;
    }
    
    .left-panel {
      padding: 25px 20px !important;
      min-height: 250px !important;
    }
    
    .right-panel {
      padding: 25px 20px !important;
    }
    
    .company-name {
      font-size: 2rem !important;
    }
    
    .welcome-title {
      font-size: 1.8rem !important;
    }
    
    .login-btn {
      padding: 16px !important;
      font-size: 1rem !important;
    }
  }

  /* Small Mobile */
  @media (max-width: 480px) {
    .page {
      padding: 10px !important;
    }
    
    .container {
      margin: 5px !important;
      border-radius: 16px !important;
    }
    
    .company-name {
      font-size: 1.6rem !important;
    }
    
    .welcome-title {
      font-size: 1.5rem !important;
    }
    
    .mobile-stats {
      flex-direction: column;
      gap: 15px;
    }
    
    .mobile-stat {
      flex: none;
    }
  }
`;
document.head.appendChild(styleSheet);