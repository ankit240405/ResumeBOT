import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export default function Upload() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.includes("pdf") || 
          droppedFile.name.match(/\.(doc|docx)$/i)) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload only PDF or Word documents");
      }
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload a valid resume file");
      setShowErrorPopup(true);
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const fd = new FormData();
      fd.append("resume", file);

      const res = await fetch("/api/analyze",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (!res.ok) throw new Error("Resume analysis failed");

      const json = await res.json();

      navigate("/result", { state: { result: json } });
    } catch (err) {
      console.error(err);
      setError("Could not analyze resume. Please try again.");
      setShowErrorPopup(true);
    }

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundElements}>
        {[...Array(isMobile ? 3 : 6)].map((_, i) => (
          <div 
            key={i} 
            style={{
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
            }}
          />
        ))}
      </div>

      {showErrorPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: isMobile ? '25px' : '32px',
            maxWidth: isMobile ? '90%' : '440px',
            width: '100%',
            border: '1px solid #E5E7EB',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(0)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: isMobile ? '60px' : '72px',
                height: isMobile ? '60px' : '72px',
                borderRadius: '50%',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <svg 
                  width={isMobile ? "32" : "36"} 
                  height={isMobile ? "32" : "36"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: '#EF4444' }}
                >
                  <path d="M12 9V12M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h3 style={{
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: '700',
              color: '#111827',
              textAlign: 'center',
              marginBottom: '12px',
              lineHeight: '1.3'
            }}>
              Please upload a valid Resume
            </h3>

            <p style={{
              fontSize: isMobile ? '0.95rem' : '1rem',
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '28px'
            }}>
              {error}
            </p>

            <div style={{
              background: '#F9FAFB',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '28px',
              border: '1px solid #E5E7EB'
            }}>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#10B981' }}>
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                File Requirements
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981'
                  }}></div>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#6B7280'
                  }}>PDF or Word (.doc, .docx) format</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981'
                  }}></div>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#6B7280'
                  }}>Maximum file size: 10MB</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981'
                  }}></div>
                  <span style={{
                    fontSize: '0.85rem',
                    color: '#6B7280'
                  }}>No password-protected files</span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowErrorPopup(false);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: isMobile ? '14px 20px' : '16px 24px',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  color: '#374151',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
                Go Back
              </button>
              
              <button
                onClick={() => {
                  setShowErrorPopup(false);
                  document.getElementById('file-upload')?.click();
                }}
                style={{
                  flex: 1,
                  padding: isMobile ? '14px 20px' : '16px 24px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                  <path d="M17 8L12 3L7 8" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                  <path d="M12 3V15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        ...styles.container,
        ...(isMobile && styles.containerMobile),
        ...(isTablet && styles.containerTablet),
      }}>
        <div style={{
          ...styles.leftPanel,
          ...(isMobile && styles.leftPanelMobile),
          ...(isTablet && styles.leftPanelTablet),
        }}>
          <div style={styles.leftContent}>
            <div style={styles.heroSection}>
              <div style={styles.heroBadge}>
                <span style={styles.badgeIcon}>✨</span>
                <span style={styles.badgeText}>AI-Powered Analysis</span>
              </div>
              <h1 style={{
                ...styles.heroTitle,
                ...(isMobile && { fontSize: '1.8rem', lineHeight: '1.3' }),
                ...(isTablet && { fontSize: '2.2rem' }),
              }}>
                Upload Your Resume for{" "}
                <span style={styles.heroHighlight}>Professional ATS Analysis</span>
              </h1>
              <p style={{
                ...styles.heroDescription,
                ...(isMobile && { fontSize: '0.95rem' }),
                ...(isTablet && { fontSize: '1.1rem' }),
              }}>
                Get instant compatibility scores, keyword optimization, and expert feedback 
                to maximize your resume's performance with applicant tracking systems.
              </p>
            </div>

            {isMobile ? (
              <div style={styles.mobileProgress}>
                <div style={styles.mobileStep}>
                  <div style={styles.mobileStepNumber}>1</div>
                  <div style={styles.mobileStepContent}>
                    <h4 style={styles.mobileStepTitle}>Upload Resume</h4>
                    <p style={styles.mobileStepDesc}>PDF or Word document</p>
                  </div>
                </div>
                <div style={styles.mobileStep}>
                  <div style={styles.mobileStepNumber}>2</div>
                  <div style={styles.mobileStepContent}>
                    <h4 style={styles.mobileStepTitle}>AI Analysis</h4>
                    <p style={styles.mobileStepDesc}>Instant ATS scanning</p>
                  </div>
                </div>
                <div style={styles.mobileStep}>
                  <div style={{...styles.mobileStepNumber, ...styles.mobileStepNumberInactive}}>3</div>
                  <div style={styles.mobileStepContent}>
                    <h4 style={styles.mobileStepTitle}>Get Results</h4>
                    <p style={styles.mobileStepDesc}>Detailed insights & tips</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.progressSteps}>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>1</div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Upload Resume</h3>
                    <p style={styles.stepDesc}>PDF or Word document</p>
                  </div>
                </div>
                <div style={styles.stepDivider}></div>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>2</div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>AI Analysis</h3>
                    <p style={styles.stepDesc}>Instant ATS scanning</p>
                  </div>
                </div>
                <div style={styles.stepDivider}></div>
                <div style={styles.step}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberInactive}}>3</div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Get Results</h3>
                    <p style={styles.stepDesc}>Detailed insights & tips</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              ...styles.featuresGrid,
              ...(isMobile && { 
                gridTemplateColumns: '1fr',
                gap: '12px',
                marginBottom: '25px'
              }),
              ...(isTablet && { 
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }),
            }}>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>📊</div>
                <div style={styles.featureContent}>
                  <h3 style={styles.featureTitle}>ATS Score</h3>
                  <p style={styles.featureDesc}>Compatibility rating</p>
                </div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🔍</div>
                <div style={styles.featureContent}>
                  <h3 style={styles.featureTitle}>Keyword Analysis</h3>
                  <p style={styles.featureDesc}>Missing keywords</p>
                </div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>📝</div>
                <div style={styles.featureContent}>
                  <h3 style={styles.featureTitle}>Format Check</h3>
                  <p style={styles.featureDesc}>Structure analysis</p>
                </div>
              </div>
              <div style={styles.featureCard}>
                <div style={styles.featureIcon}>🎯</div>
                <div style={styles.featureContent}>
                  <h3 style={styles.featureTitle}>Optimization Tips</h3>
                  <p style={styles.featureDesc}>Actionable advice</p>
                </div>
              </div>
            </div>

            <div style={{
              ...styles.statsSection,
              ...(isMobile && { 
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'center'
              }),
            }}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>99%</div>
                <div style={styles.statLabel}>Accuracy Rate</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>Real-time</div>
                <div style={styles.statLabel}>ATS System</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>Instant</div>
                <div style={styles.statLabel}>Results</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          ...styles.rightPanel,
          ...(isMobile && styles.rightPanelMobile),
          ...(isTablet && styles.rightPanelTablet),
        }}>
          <div style={styles.rightContent}>
            <div style={{
              ...styles.uploadCard,
              ...(isMobile && styles.uploadCardMobile),
              ...(isTablet && styles.uploadCardTablet),
            }}>
              <div style={styles.cardHeader}>
                <h2 style={styles.uploadTitle}>Upload Your Resume</h2>
                <p style={styles.uploadSubtitle}>Drop your PDF or Word document to begin analysis</p>
              </div>

              <div 
                style={{
                  ...styles.dropzone,
                  ...(isMobile && styles.dropzoneMobile),
                  ...(isTablet && styles.dropzoneTablet),
                  borderColor: isDragging ? "#10B981" : error ? "#EF4444" : "#E5E7EB",
                  backgroundColor: isDragging ? "#F0FDF4" : "#FFFFFF"
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                
                <div style={{
                  ...styles.dropzoneContent,
                  ...(isMobile && { padding: '30px 20px' }),
                  ...(isTablet && { padding: '40px 25px' }),
                }}>
                  <div style={styles.uploadIcon}>
                    {file ? (
                      <div style={styles.fileIcon}>
                        <svg width={isMobile ? "48" : "56"} height={isMobile ? "48" : "56"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H9H8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ) : (
                      <div style={styles.uploadIconCircle}>
                        <svg width={isMobile ? "36" : "48"} height={isMobile ? "36" : "48"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17 8L12 3L7 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 3V15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.uploadText}>
                    {file ? (
                      <>
                        <div style={styles.fileName}>{file.name}</div>
                        <div style={styles.fileSize}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to Analyze
                        </div>
                        <div style={styles.fileChange}>Click to change file</div>
                      </>
                    ) : (
                      <>
                        <div style={styles.dropzoneTitle}>
                          {isDragging ? "Drop your file here" : "Drag & drop your resume"}
                        </div>
                        <div style={styles.dropzoneSubtitle}>or click to browse files</div>
                        <div style={styles.fileTypes}>Supported: PDF, DOC, DOCX • Max 10MB</div>
                      </>
                    )}
                  </div>
                  
                  {file && (
                    <button 
                      style={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {error && !showErrorPopup && (
                <div style={styles.errorBox}>
                  <div style={styles.errorIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9V12M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={styles.errorText}>{error}</div>
                </div>
              )}

              <button
                style={{
                  ...styles.analyzeBtn,
                  opacity: loading || !file ? 0.6 : 1,
                  cursor: loading || !file ? "not-allowed" : "pointer"
                }}
                onClick={handleUpload}
                disabled={loading || !file}
              >
                {loading ? (
                  <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <span>Analyzing Resume...</span>
                  </div>
                ) : (
                  <>
                    <svg style={styles.btnIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Start ATS Analysis</span>
                  </>
                )}
              </button>

              <div style={styles.securityNote}>
                <div style={styles.securityIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={styles.securityText}>Your resume is processed securely and never stored on our servers</p>
              </div>

              <div style={styles.trustBadges}>
                <div style={styles.trustBadge}>🔒 Encrypted scanning</div>
                <div style={styles.trustBadge}>🛡️ Secure & Private</div>
                <div style={styles.trustBadge}>⚡ Instant Results</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -20px) rotate(5deg); }
          50% { transform: translate(-20px, 15px) rotate(-5deg); }
          75% { transform: translate(15px, 20px) rotate(3deg); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: 'relative',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  
  backgroundElements: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  
  container: {
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    gap: '40px',
    alignItems: 'stretch',
    position: 'relative',
    zIndex: 1,
  },
  
  containerMobile: {
    flexDirection: 'column',
    gap: '25px',
  },
  
  containerTablet: {
    gap: '30px',
  },
  
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  
  leftPanelMobile: {
    width: '100%',
  },
  
  leftPanelTablet: {
    flex: 1,
  },
  
  leftContent: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid #E5E7EB',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  heroSection: {
    marginBottom: '32px',
  },
  
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F0FDF4',
    padding: '6px 14px',
    borderRadius: '30px',
    marginBottom: '20px',
    border: '1px solid #DCFCE7',
  },
  
  badgeIcon: {
    fontSize: '14px',
  },
  
  badgeText: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#059669',
  },
  
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    margin: '0 0 16px 0',
    color: '#111827',
  },
  
  heroHighlight: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  heroDescription: {
    fontSize: '1rem',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: '0',
  },
  
  progressSteps: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px',
    background: '#F9FAFB',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #E5E7EB',
  },
  
  mobileProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '25px',
  },
  
  mobileStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  mobileStepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  
  mobileStepNumberInactive: {
    background: '#E5E7EB',
    color: '#9CA3AF',
  },
  
  mobileStepContent: {
    flex: 1,
  },
  
  mobileStepTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    margin: '0 0 3px 0',
    color: '#111827',
  },
  
  mobileStepDesc: {
    fontSize: '0.8rem',
    color: '#6B7280',
    margin: '0',
  },
  
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  
  stepNumber: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '1rem',
  },
  
  stepNumberInactive: {
    background: '#E5E7EB',
    color: '#9CA3AF',
  },
  
  stepContent: {
    flex: 1,
  },
  
  stepTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: '#111827',
  },
  
  stepDesc: {
    fontSize: '0.8rem',
    color: '#6B7280',
    margin: '0',
  },
  
  stepDivider: {
    width: '30px',
    height: '2px',
    background: '#E5E7EB',
    margin: '0 8px',
  },
  
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '32px',
  },
  
  featureCard: {
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  
  featureIcon: {
    fontSize: '20px',
    width: '40px',
    height: '40px',
    background: '#F0FDF4',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  
  featureContent: {
    flex: 1,
  },
  
  featureTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    margin: '0 0 3px 0',
    color: '#111827',
  },
  
  featureDesc: {
    fontSize: '0.75rem',
    color: '#6B7280',
    margin: '0',
  },
  
  statsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '24px',
    borderTop: '1px solid #E5E7EB',
    marginTop: 'auto',
  },
  
  statItem: {
    textAlign: 'center',
    flex: 1,
  },
  
  statNumber: {
  fontSize: '1.6rem',
  fontWeight: '800',
  color: '#10B981',
  marginBottom: '4px',
},
  
  statLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
    letterSpacing: '0.5px',
  },
  
  rightPanel: {
    flex: 1,
  },
  
  rightPanelMobile: {
    width: '100%',
  },
  
  rightPanelTablet: {
    flex: 1,
  },
  
  rightContent: {
    height: '100%',
  },
  
  uploadCard: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid #E5E7EB',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  uploadCardMobile: {
    padding: '24px 20px',
  },
  
  uploadCardTablet: {
    padding: '28px 24px',
  },
  
  cardHeader: {
    marginBottom: '24px',
  },
  
  uploadTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  
  uploadSubtitle: {
    fontSize: '0.9rem',
    color: '#6B7280',
    margin: '0',
  },
  
  dropzone: {
    borderRadius: '16px',
    border: '2px dashed #E5E7EB',
    background: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  
  dropzoneMobile: {
    borderRadius: '12px',
  },
  
  dropzoneTablet: {},
  
  dropzoneContent: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  uploadIcon: {
    marginBottom: '20px',
  },
  
  uploadIconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#F0FDF4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10B981',
    border: '2px solid #DCFCE7',
  },
  
  fileIcon: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10B981',
  },
  
  uploadText: {
    textAlign: 'center',
    width: '100%',
  },
  
  dropzoneTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '6px',
  },
  
  dropzoneSubtitle: {
    fontSize: '0.9rem',
    color: '#6B7280',
    marginBottom: '10px',
  },
  
  fileTypes: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    background: '#F9FAFB',
    padding: '4px 12px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  
  fileName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '5px',
    wordBreak: 'break-word',
  },
  
  fileSize: {
    fontSize: '0.85rem',
    color: '#6B7280',
    marginBottom: '6px',
  },
  
  fileChange: {
    fontSize: '0.8rem',
    color: '#10B981',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  
  removeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#FEE2E2',
    border: 'none',
    color: '#EF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FEF2F2',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #FEE2E2',
  },
  
  errorIcon: {
    color: '#EF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  
  errorText: {
    color: '#DC2626',
    fontSize: '0.85rem',
    flex: 1,
  },
  
  analyzeBtn: {
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    marginBottom: '20px',
  },
  
  btnIcon: {
    width: '18px',
    height: '18px',
  },
  
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#F0FDF4',
    borderRadius: '10px',
    border: '1px solid #DCFCE7',
    marginBottom: '20px',
  },
  
  securityIcon: {
    color: '#10B981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  
  securityText: {
    fontSize: '0.8rem',
    color: '#065F46',
    margin: '0',
  },
  
  trustBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  
  trustBadge: {
    fontSize: '0.7rem',
    color: '#6B7280',
    background: '#F9FAFB',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid #E5E7EB',
  },
};