import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function Profile() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function fetchScans() {
      try {
        const token = await getToken();
        const res = await fetch("/api/analyze/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setScans(data.scans);
      } catch (err) {
        console.error(err);
        setError("Failed to load scan history");
      } finally {
        setLoading(false);
      }
    }

    fetchScans();
  }, [isLoaded, isSignedIn, getToken]);

  const toggleExpand = (scanId, section) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${scanId}-${section}`]: !prev[`${scanId}-${section}`]
    }));
  };

const getAnalyticsData = () => {
  if (scans.length === 0) return null;

  const scoresOverTime = scans.map(scan => ({
    date: new Date(scan.date),
    hireabilityScore: scan.result.hireability_score,
    contentStrength: scan.result.content_strength,
    formattingScore: scan.result.formatting_score,
    writingQuality: scan.result.writing_quality,
    sectionCompleteness: scan.result.section_completeness,
    roleAlignment: scan.result.role_alignment_score,
    recruiterInterest: scan.result.recruiter_interest_score
  }));

  scoresOverTime.sort((a, b) => a.date - b.date);

  const averageScores = {
    hireability: scoresOverTime.reduce((sum, s) => sum + s.hireabilityScore, 0) / scoresOverTime.length,
    content: scoresOverTime.reduce((sum, s) => sum + s.contentStrength, 0) / scoresOverTime.length,
    formatting: scoresOverTime.reduce((sum, s) => sum + s.formattingScore, 0) / scoresOverTime.length,
    writing: scoresOverTime.reduce((sum, s) => sum + s.writingQuality, 0) / scoresOverTime.length,
    section: scoresOverTime.reduce((sum, s) => sum + s.sectionCompleteness, 0) / scoresOverTime.length,
    role: scoresOverTime.reduce((sum, s) => sum + s.roleAlignment, 0) / scoresOverTime.length,
    recruiter: scoresOverTime.reduce((sum, s) => sum + s.recruiterInterest, 0) / scoresOverTime.length
  };

  const latestScan = scoresOverTime[scoresOverTime.length - 1];
  const firstScan = scoresOverTime[0]; 
  const improvementPercentage = firstScan ? 
    ((latestScan.hireabilityScore - firstScan.hireabilityScore) / firstScan.hireabilityScore * 100).toFixed(1) : 0;

  return {
    scoresOverTime, 
    averageScores,
    latestScan,
    firstScan,
    improvementPercentage,
    totalScans: scans.length,
    highestScore: Math.max(...scoresOverTime.map(s => s.hireabilityScore)),
    lowestScore: Math.min(...scoresOverTime.map(s => s.hireabilityScore)),
    trend: latestScan.hireabilityScore > averageScores.hireability ? 'improving' : 'declining'
  };
};

  const analytics = getAnalyticsData();

  if (!isLoaded || !userLoaded || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ width: '50px', height: '50px', margin: '0 auto 20px' }}>
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="20" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <div style={{ color: '#f8fafc', textAlign: 'center' }}>Loading your analytics dashboard…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: '40px',
          background: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          {error}
        </div>
      </div>
    );
  }

  const CompactScanCard = ({ scan, index, total }) => {
    const score = scan.result.hireability_score;
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    
    return (
      <div style={{
        flex: 1,
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        minWidth: '0',
        width: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '5px' }}>
              Scan #{total - index}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              {new Date(scan.date).toLocaleDateString('en-US', { 
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div style={{
            padding: '6px 14px',
            background: `rgba(${score >= 80 ? '16, 185, 129' : score >= 60 ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
            color: scoreColor,
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '700',
            border: `1px solid rgba(${score >= 80 ? '16, 185, 129' : score >= 60 ? '245, 158, 11' : '239, 68, 68'}, 0.3)`,
            whiteSpace: 'nowrap'
          }}>
            Score: {score.toFixed(1)}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Content Strength:</span>
            <span style={{ color: '#3b82f6', fontWeight: '600' }}>{scan.result.content_strength.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Formatting:</span>
            <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{scan.result.formatting_score.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Writing Quality:</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>{scan.result.writing_quality.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Role Alignment:</span>
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>{scan.result.role_alignment_score.toFixed(1)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {scan.result.strengths?.length > 0 && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'rgba(16, 185, 129, 0.1)'
                }}
                onClick={() => toggleExpand(scan._id, 'strengths')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                    ✓ Strengths ({scan.result.strengths.length})
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#10b981', transition: 'transform 0.3s ease', 
                  transform: expandedSections[`${scan._id}-strengths`] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              
              {expandedSections[`${scan._id}-strengths`] && (
                <div style={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {scan.result.strengths.map((strength, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      fontSize: '13px',
                      color: '#cbd5e1',
                      borderLeft: '3px solid #10b981'
                    }}>
                      {strength}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {scan.result.weaknesses?.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'rgba(239, 68, 68, 0.1)'
                }}
                onClick={() => toggleExpand(scan._id, 'weaknesses')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                    ⚠️ Weaknesses ({scan.result.weaknesses.length})
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#ef4444', transition: 'transform 0.3s ease', 
                  transform: expandedSections[`${scan._id}-weaknesses`] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              
              {expandedSections[`${scan._id}-weaknesses`] && (
                <div style={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {scan.result.weaknesses.map((weakness, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      background: 'rgba(239, 68, 68, 0.05)',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      fontSize: '13px',
                      color: '#cbd5e1',
                      borderLeft: '3px solid #ef4444'
                    }}>
                      {weakness}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {scan.result.role_fit?.length > 0 && (
            <div style={{
              background: 'rgba(168, 85, 247, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.1)',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'rgba(168, 85, 247, 0.1)'
                }}
                onClick={() => toggleExpand(scan._id, 'role_fit')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: '600' }}>
                    ⚡ Role Fit ({scan.result.role_fit.length})
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#a855f7', transition: 'transform 0.3s ease', 
                  transform: expandedSections[`${scan._id}-role_fit`] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              
              {expandedSections[`${scan._id}-role_fit`] && (
                <div style={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {scan.result.role_fit.map((fit, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      background: 'rgba(168, 85, 247, 0.05)',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      fontSize: '13px',
                      color: '#cbd5e1',
                      borderLeft: '3px solid #a855f7'
                    }}>
                      {fit}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {scan.result.improvement_suggestions?.length > 0 && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'rgba(59, 130, 246, 0.1)'
                }}
                onClick={() => toggleExpand(scan._id, 'suggestions')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                    💡 Suggestions ({scan.result.improvement_suggestions.length})
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#3b82f6', transition: 'transform 0.3s ease', 
                  transform: expandedSections[`${scan._id}-suggestions`] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              
              {expandedSections[`${scan._id}-suggestions`] && (
                <div style={{ padding: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  {scan.result.improvement_suggestions.map((suggestion, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      background: 'rgba(59, 130, 246, 0.05)',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      fontSize: '13px',
                      color: '#cbd5e1',
                      borderLeft: '3px solid #3b82f6'
                    }}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: '#f8fafc',
      padding: '20px',
      position: 'relative'
    }}>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            background: `radial-gradient(circle, 
              rgba(${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, 255, ${0.1 + Math.random() * 0.1}) 0%,
              transparent 70%
            )`,
            borderRadius: '50%',
            width: `${Math.random() * 200 + 50}px`,
            height: `${Math.random() * 200 + 50}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 20 + 20}s infinite ease-in-out`,
            filter: 'blur(30px)'
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1600px', margin: '0 auto' }}>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '3px solid #2563eb',
              padding: '3px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              flexShrink: 0
            }}>
              <img
                src={user.imageUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #0f172a'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '18px',
                height: '18px',
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid #0f172a'
              }} />
            </div>

            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  margin: '0',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {user.fullName || user.username}
                </h1>
                <div style={{
                  padding: '6px 16px',
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  color: 'white',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
                  Premium Member
                </div>
              </div>
              
              <p style={{ fontSize: '16px', color: '#94a3b8', margin: '0 0 15px 0' }}>
                {user.primaryEmailAddress?.emailAddress}
              </p>
              
              <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{scans.length}</div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Total Scans</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                    {analytics ? `${analytics.improvementPercentage}%` : '0%'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Overall Improvement</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {analytics ? `${analytics.averageScores.hireability.toFixed(1)}` : '0'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Avg Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                    {analytics && analytics.latestScan ? new Date(analytics.latestScan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Last Scan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {analytics && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#f8fafc',
              margin: '0 0 30px 0',
              textAlign: 'center'
            }}>
              Performance Analytics Dashboard
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#f8fafc', fontWeight: '700' }}>
                  Progress Overview
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Start Score</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                    {analytics.firstScan ? analytics.firstScan.hireabilityScore.toFixed(1) : analytics.latestScan.hireabilityScore.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Current Score</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                    {analytics.latestScan.hireabilityScore.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Improvement</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: analytics.improvementPercentage > 0 ? '#10b981' : '#ef4444' }}>
                    {analytics.improvementPercentage}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, analytics.improvementPercentage + 50))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                  {analytics.trend === 'improving' ? '📈 Performance improving consistently' : '📉 Focus on improvement areas'}
                </div>
              </div>

              <div style={{
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#f8fafc', fontWeight: '700' }}>
                  Score Range
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Highest</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                    {analytics.highestScore.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Lowest</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
                    {analytics.lowestScore.toFixed(1)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>Range</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
                    {(analytics.highestScore - analytics.lowestScore).toFixed(1)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', minWidth: '40px' }}>0</div>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)',
                    borderRadius: '4px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `${analytics.lowestScore}%`,
                      width: `${Math.max(2, analytics.highestScore - analytics.lowestScore)}%`,
                      height: '12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      top: '-2px'
                    }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', minWidth: '40px' }}>100</div>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                  Your score stability: {((analytics.highestScore - analytics.lowestScore) < 20 ? 'Good' : 'Needs Consistency')}
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#f8fafc', fontWeight: '700' }}>
                  Scan Frequency
                </h3>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
                  Average time between scans
                </div>
                {scans.length > 1 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>
                        {Math.max(1, Math.floor((new Date(scans[0].date) - new Date(scans[scans.length - 1].date)) / (1000 * 60 * 60 * 24 * Math.max(1, scans.length - 1))))}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Avg Days</div>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                  {scans.length > 3 ? 'Regular optimization schedule' : 'Consider scanning more frequently'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#f8fafc', fontWeight: '700' }}>
                Score Trend Analysis
              </h3>
              <div style={{
                height: '300px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {analytics.scoresOverTime.length > 1 ? (
                    <>
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {[0, 25, 50, 75, 100].map((line, i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={`${100 - line}%`}
                          x2="100%"
                          y2={`${100 - line}%`}
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="1"
                          strokeDasharray="5,5"
                        />
                      ))}
                      
                      {analytics.scoresOverTime.map((_, i) => {
                        if (i < analytics.scoresOverTime.length - 1) {
                          const x1 = `${(i / (analytics.scoresOverTime.length - 1)) * 100}%`;
                          const x2 = `${((i + 1) / (analytics.scoresOverTime.length - 1)) * 100}%`;
                          return (
                            <line
                              key={`grid-${i}`}
                              x1={x1}
                              y1="0%"
                              x2={x1}
                              y2="100%"
                              stroke="rgba(255, 255, 255, 0.05)"
                              strokeWidth="1"
                            />
                          );
                        }
                        return null;
                      })}
                      
                      <path
                        d={analytics.scoresOverTime.map((scan, i) => {
                          const x = `${(i / (analytics.scoresOverTime.length - 1)) * 100}%`;
                          const y = `${100 - scan.hireabilityScore}%`;
                          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      <path
                        d={`M 0% 100% ${
                          analytics.scoresOverTime.map((scan, i) => {
                            const x = `${(i / (analytics.scoresOverTime.length - 1)) * 100}%`;
                            const y = `${100 - scan.hireabilityScore}%`;
                            return `L ${x} ${y}`;
                          }).join(' ')
                        } L 100% 100% Z`}
                        fill="url(#areaGradient)"
                      />
                      
                      {analytics.scoresOverTime.map((scan, i) => {
                        const x = `${(i / (analytics.scoresOverTime.length - 1)) * 100}%`;
                        const y = `${100 - scan.hireabilityScore}%`;
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#3b82f6"
                              stroke="#0f172a"
                              strokeWidth="2"
                            />
                            <text
                              x={x}
                              y={`${100 - scan.hireabilityScore - 5}%`}
                              textAnchor="middle"
                              fill="#f8fafc"
                              fontSize="10"
                              fontWeight="600"
                            >
                              {scan.hireabilityScore.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}
                      
                      {analytics.scoresOverTime.map((scan, i) => {
                        if (i % Math.max(1, Math.floor(analytics.scoresOverTime.length / 5)) === 0 || i === analytics.scoresOverTime.length - 1) {
                          const x = `${(i / (analytics.scoresOverTime.length - 1)) * 100}%`;
                          return (
                            <text
                              key={`label-${i}`}
                              x={x}
                              y="105%"
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="10"
                            >
                              {scan.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </text>
                          );
                        }
                        return null;
                      })}
                    </>
                  ) : (
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="14"
                    >
                      Add more scans to see trend analysis
                    </text>
                  )}
                </svg>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#f8fafc', fontWeight: '700' }}>
                Category Performance Comparison
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {[
                  { label: 'Content Strength', value: analytics.averageScores.content, color: '#3b82f6' },
                  { label: 'Formatting Score', value: analytics.averageScores.formatting, color: '#8b5cf6' },
                  { label: 'Writing Quality', value: analytics.averageScores.writing, color: '#10b981' },
                  { label: 'Section Completeness', value: analytics.averageScores.section, color: '#f59e0b' },
                  { label: 'Role Alignment Score', value: analytics.averageScores.role, color: '#ec4899' },
                  { label: 'Recruiter Interest Score', value: analytics.averageScores.recruiter, color: '#06b6d4' }
                ].map((category, index) => (
                  <div key={index} style={{
                    background: `rgba(${category.value >= 70 ? '16, 185, 129' : category.value >= 50 ? '245, 158, 11' : '239, 68, 68'}, ${0.1 + category.value / 200})`,
                    padding: '15px',
                    borderRadius: '12px',
                    border: `1px solid rgba(${category.value >= 70 ? '16, 185, 129' : category.value >= 50 ? '245, 158, 11' : '239, 68, 68'}, 0.3)`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#f8fafc',
                        fontWeight: '600'
                      }}>
                        {category.label}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: category.value >= 70 ? '#10b981' : category.value >= 50 ? '#f59e0b' : '#ef4444'
                      }}>
                        {category.value.toFixed(1)}
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${category.value}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${category.color}, ${category.color}99)`,
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#f8fafc',
            margin: '0 0 30px 0',
            textAlign: 'center'
          }}>
            Scan History Timeline
          </h2>

          {scans.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <div style={{ fontSize: '18px', color: '#f8fafc', marginBottom: '10px' }}>
                No scans yet
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                Upload your first resume to start tracking your progress
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                paddingRight: '10px'
              }}>
                {scans.map((scan, index) => (
                  <div key={scan._id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      background: scan.result.hireability_score >= 80 ? '#10b981' : scan.result.hireability_score >= 60 ? '#f59e0b' : '#ef4444',
                      borderRadius: '50%',
                      marginRight: '20px',
                      flexShrink: 0,
                      border: '3px solid #0f172a',
                      zIndex: 1,
                      position: 'relative'
                    }} />
                    <CompactScanCard scan={scan} index={index} total={scans.length} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer style={{
          marginTop: '30px',
          padding: '25px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="16" fill="url(#gradient)"/>
                <path d="M32 16L16 24L32 32L48 24L32 16Z" fill="white"/>
                <path d="M16 40L32 48L48 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 32L32 40L48 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                FirstHire Analytics
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Professional Resume Intelligence • {scans.length} scans tracked
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '15px' }}>
            © 2026 FirstHire • AI ATS Analytics By Ankit Sharma
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(20px); }
        }
        
        @media (max-width: 768px) {
          .profile-container {
            padding: 15px !important;
          }
          .profile-header {
            padding: 20px !important;
          }
          .dashboard-section {
            padding: 20px !important;
          }
          .timeline-item {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .timeline-dot {
            margin-bottom: 10px !important;
            margin-right: 0 !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 15px !important;
          }
          .category-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .profile-header h1 {
            font-size: 24px !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .scan-card-grid {
            grid-template-columns: 1fr !important;
          }
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (min-width: 1600px) {
          .main-container {
            max-width: 90vw !important;
          }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}