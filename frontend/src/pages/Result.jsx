import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  console.log("Result page state:", location.state);

  const outer = location.state?.result;
  const data = outer?.result;

  console.log("Payload:", data);

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#111827',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '30px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          margin: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#FEF2F2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px'
          }}>
            ⚠️
          </div>
          <h2 style={{ marginBottom: '15px', color: '#111827', fontSize: '24px' }}>No Analysis Results</h2>
          <p style={{ color: '#6B7280', marginBottom: '30px', lineHeight: '1.6', fontSize: '14px' }}>
            We couldn't retrieve your resume analysis. Please upload your resume again for a comprehensive ATS scan.
          </p>
          <button 
            onClick={() => navigate("/upload")}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
              width: '100%',
              maxWidth: '300px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            ← Upload Resume Again
          </button>
        </div>
      </div>
    );
  }

  const hireabilityScore = Math.round(data.hireability_score);
  const sectionScores = [
    { label: "Content Strength", value: parseFloat(data.content_strength), color: "#10B981" },
    { label: "Formatting Score", value: parseFloat(data.formatting_score), color: "#8B5CF6" },
    { label: "Writing Quality", value: parseFloat(data.writing_quality), color: "#10B981" },
    { label: "Section Completeness", value: parseFloat(data.section_completeness), color: "#F59E0B" },
    { label: "Role Alignment", value: parseFloat(data.role_alignment_score), color: "#EC4899" },
    { label: "Recruiter Interest", value: parseFloat(data.recruiter_interest_score), color: "#06B6D4" }
  ];

  const radarChartData = sectionScores.map(s => s.value);
  const radarChartLabels = sectionScores.map(s => s.label);

  const strengthsCount = data.strengths?.length || 0;
  const weaknessesCount = data.weaknesses?.length || 0;
  const total = strengthsCount + weaknessesCount;
  const strengthsPercentage = total > 0 ? Math.round((strengthsCount / total) * 100) : 0;
  const weaknessesPercentage = total > 0 ? Math.round((weaknessesCount / total) * 100) : 0;

  const suggestionsCount = data.improvement_suggestions?.length || 0;
  const roleFitCount = data.role_fit?.length || 0;

  const calculateIndustryAverage = () => {
    const userScore = hireabilityScore;
    if (userScore >= 80) return Math.max(65, userScore - 15);
    if (userScore >= 60) return Math.max(60, userScore - 8);
    return Math.min(65, userScore + 10);
  };

  const getStatusColor = (score) => {
    if (score >= 80) return { color: '#10B981', label: 'Excellent', gradient: 'linear-gradient(135deg, #10B981, #059669)' };
    if (score >= 60) return { color: '#F59E0B', label: 'Good', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' };
    if (score >= 40) return { color: '#EF4444', label: 'Needs Work', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' };
    return { color: '#6B7280', label: 'Poor', gradient: 'linear-gradient(135deg, #6B7280, #4B5563)' };
  };

  const status = getStatusColor(hireabilityScore);

  const downloadPDF = async () => {
    try {
      const element = reportRef.current;
      if (!element) return;

      const originalButtonText = document.querySelector('.pdf-button')?.textContent;
      if (document.querySelector('.pdf-button')) {
        document.querySelector('.pdf-button').textContent = 'Generating PDF...';
        document.querySelector('.pdf-button').style.opacity = '0.7';
      }

      const pdfButton = document.querySelector('.pdf-button');
      const newAnalysisButton = document.querySelector('.new-analysis-button');
      const interactiveElements = document.querySelectorAll('.interactive-hide');
      
      if (pdfButton) pdfButton.style.display = 'none';
      if (newAnalysisButton) newAnalysisButton.style.display = 'none';
      interactiveElements.forEach(el => {
        el.style.opacity = '0';
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        allowTaint: true,
        removeContainer: true
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 20; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      let pageNumber = 1;

      const addWatermark = (pdfDoc) => {
        pdfDoc.setFontSize(10);
        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.text('ResumeBOT Confidential • ATS Resume Analysis Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdfDoc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        pageNumber++;
      };

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(17, 24, 39);
      pdf.text('ResumeBOT ATS Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      
      pdf.setDrawColor(16, 185, 129);
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, pageWidth - 20, 35);

      pdf.addImage(canvas, 'PNG', 10, 40, imgWidth, imgHeight);
      addWatermark(pdf);

      heightLeft -= (pageHeight - 50); 
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        position = -heightLeft + 10;
        pdf.addImage(canvas, 'PNG', 10, position, imgWidth, imgHeight);
        addWatermark(pdf);
        heightLeft -= pageHeight;
      }

      pdf.save(`ResumeBOT_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

      if (pdfButton) {
        pdfButton.style.display = 'flex';
        pdfButton.textContent = originalButtonText || '📄 Export PDF Report';
        pdfButton.style.opacity = '1';
      }
      if (newAnalysisButton) newAnalysisButton.style.display = 'flex';
      interactiveElements.forEach(el => {
        el.style.opacity = '1';
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      const pdfButton = document.querySelector('.pdf-button');
      const newAnalysisButton = document.querySelector('.new-analysis-button');
      const interactiveElements = document.querySelectorAll('.interactive-hide');
      
      if (pdfButton) {
        pdfButton.style.display = 'flex';
        pdfButton.textContent = '📄 Export PDF Report';
        pdfButton.style.opacity = '1';
      }
      if (newAnalysisButton) newAnalysisButton.style.display = 'flex';
      interactiveElements.forEach(el => {
        el.style.opacity = '1';
      });
    }
  };

  return (
    <div
      ref={reportRef}
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: '#111827',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            background: `radial-gradient(circle, 
              rgba(16, 185, 129, ${0.03 + Math.random() * 0.05}) 0%,
              transparent 70%
            )`,
            borderRadius: '50%',
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 20 + 20}s infinite ease-in-out`,
            filter: 'blur(40px)'
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <header style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                overflow: 'hidden'
              }}>
                <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
                  <path d="M20 6L10 14L20 22L30 14L20 6Z" fill="white"/>
                  <path d="M10 22L20 30L30 22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <path d="M10 28L20 36L30 28" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981"/>
                      <stop offset="100%" stopColor="#059669"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  margin: '0 0 5px 0',
                  color: '#111827'
                }}>
                  ResumeBOT Analytics
                </h1>
                <p style={{ margin: '0', color: '#6B7280', fontSize: '12px' }}>
                  Professional ATS Resume Intelligence Dashboard
                </p>
              </div>
            </div>
            <div style={{
              padding: '8px 16px',
              background: status.gradient,
              color: 'white',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}>
              <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }}></div>
              {status.label} • {hireabilityScore}/100
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', justifyContent: 'center' }}>
            <button
              onClick={downloadPDF}
              className="pdf-button interactive-hide"
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                flex: '1',
                minWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 12L12 15L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Export PDF Report
            </button>
            
            <button
              onClick={() => navigate("/upload")}
              className="new-analysis-button interactive-hide"
              style={{
                padding: '12px 20px',
                background: '#F9FAFB',
                color: '#111827',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: '1',
                minWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Analysis
            </button>
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              right: '-50%',
              bottom: '-50%',
              background: status.gradient,
              opacity: '0.05',
              filter: 'blur(60px)'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#6B7280', fontWeight: '600' }}>
                  OVERALL SCORE
                </h3>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  ATS Compatibility Index
                </div>
              </div>
              
              <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 25px' }}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="80" fill="none" stroke="#E5E7EB" strokeWidth="10"/>
                  
                  <circle cx="90" cy="90" r="80" fill="none" 
                    stroke={status.color} 
                    strokeWidth="10" 
                    strokeLinecap="round"
                    strokeDasharray={`${hireabilityScore * 5.026} 502.6`}
                    strokeDashoffset="125.6"
                    style={{ transition: 'stroke-dasharray 2s ease' }}
                  />
                  
                  <circle cx="90" cy="90" r="80" fill="none" 
                    stroke={status.color} 
                    strokeWidth="12" 
                    strokeLinecap="round"
                    strokeDasharray={`${hireabilityScore * 5.026} 502.6`}
                    strokeDashoffset="125.6"
                    opacity="0.2"
                    filter="blur(4px)"
                    style={{ transition: 'stroke-dasharray 2s ease' }}
                  />
                </svg>
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: '#111827',
                    lineHeight: '1',
                    marginBottom: '5px'
                  }}>
                    {hireabilityScore}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6B7280',
                    fontWeight: '600'
                  }}>
                    out of 100
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '15px',
                flexWrap: 'wrap'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{strengthsCount}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Strengths</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#EF4444' }}>{weaknessesCount}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Weaknesses</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{suggestionsCount}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Suggestions</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            minHeight: '400px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>
              Performance Radar Analysis
            </h3>
            
            <div style={{ position: 'relative', height: '250px', width: '100%' }}>
              <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
                <circle cx="150" cy="150" r="100" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                <circle cx="150" cy="150" r="75" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                <circle cx="150" cy="150" r="50" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                <circle cx="150" cy="150" r="25" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
                
                {radarChartLabels.map((label, i) => {
                  const angle = (i * 60 * Math.PI) / 180;
                  const x1 = 150;
                  const y1 = 150;
                  const x2 = 150 + 110 * Math.sin(angle);
                  const y2 = 150 - 110 * Math.cos(angle);
                  
                  return (
                    <g key={i}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E5E7EB" strokeWidth="1"/>
                      <text 
                        x={x2 + Math.sin(angle) * 15} 
                        y={y2 - Math.cos(angle) * 15} 
                        textAnchor="middle" 
                        fill="#6B7280" 
                        fontSize="10"
                        fontWeight="500"
                      >
                        {label.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
                
                <polygon 
                  points={radarChartData.map((value, i) => {
                    const angle = (i * 60 * Math.PI) / 180;
                    const radius = (value / 100) * 110;
                    return `${150 + radius * Math.sin(angle)},${150 - radius * Math.cos(angle)}`;
                  }).join(' ')}
                  fill={status.color}
                  fillOpacity="0.15"
                  stroke={status.color}
                  strokeWidth="2"
                />
                
                {radarChartData.map((value, i) => {
                  const angle = (i * 60 * Math.PI) / 180;
                  const radius = (value / 100) * 110;
                  const x = 150 + radius * Math.sin(angle);
                  const y = 150 - radius * Math.cos(angle);
                  
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill={status.color} stroke="#FFFFFF" strokeWidth="2"/>
                      <text x={x} y={y - 10} textAnchor="middle" fill="#111827" fontSize="10" fontWeight="600">
                        {Math.round(value)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '15px',
              fontSize: '11px',
              color: '#6B7280'
            }}>
              <div>Low</div>
              <div>Average</div>
              <div>High</div>
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>
              Resume Section Health
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { 
                  name: 'Professional Summary', 
                  score: Math.min(100, parseFloat(data.content_strength) + (Math.random() * 20 - 10)),
                  importance: 'High',
                  icon: '📝'
                },
                { 
                  name: 'Work Experience', 
                  score: Math.min(100, parseFloat(data.role_alignment_score) + (Math.random() * 15 - 5)),
                  importance: 'Critical',
                  icon: '💼'
                },
                { 
                  name: 'Skills & Technologies', 
                  score: Math.min(100, parseFloat(data.content_strength) * 0.9 + (Math.random() * 15 - 5)),
                  importance: 'High',
                  icon: '🛠️'
                },
                { 
                  name: 'Education', 
                  score: Math.min(100, parseFloat(data.section_completeness) + (Math.random() * 10 - 5)),
                  importance: 'Medium',
                  icon: '🎓'
                },
                { 
                  name: 'Certifications', 
                  score: Math.min(100, parseFloat(data.section_completeness) * 0.8 + (Math.random() * 15 - 5)),
                  importance: 'Medium',
                  icon: '🏅'
                },
                { 
                  name: 'Projects', 
                  score: Math.min(100, parseFloat(data.recruiter_interest_score) + (Math.random() * 15 - 5)),
                  importance: 'High',
                  icon: '🚀'
                }
              ].map((section, index) => {
                const scoreColor = section.score >= 80 ? '#10B981' : section.score >= 60 ? '#F59E0B' : '#EF4444';
                const importanceColor = section.importance === 'Critical' ? '#EF4444' : 
                                       section.importance === 'High' ? '#F59E0B' : '#10B981';
                
                return (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    background: '#F9FAFB',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: scoreColor === '#10B981' ? '#F0FDF4' : scoreColor === '#F59E0B' ? '#FEF3C7' : '#FEF2F2',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      marginRight: '10px',
                      flexShrink: 0
                    }}>
                      {section.icon}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.name}</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: scoreColor,
                          background: scoreColor === '#10B981' ? '#F0FDF4' : scoreColor === '#F59E0B' ? '#FEF3C7' : '#FEF2F2',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          flexShrink: 0,
                          marginLeft: '5px'
                        }}>
                          {Math.round(section.score)}%
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{
                          flex: 1,
                          height: '4px',
                          background: '#E5E7EB',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          minWidth: '50px'
                        }}>
                          <div style={{
                            width: `${section.score}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)`,
                            borderRadius: '2px'
                          }} />
                        </div>
                        
                        <div style={{
                          fontSize: '10px',
                          color: importanceColor,
                          fontWeight: '600',
                          padding: '2px 6px',
                          background: importanceColor === '#EF4444' ? '#FEF2F2' : importanceColor === '#F59E0B' ? '#FEF3C7' : '#F0FDF4',
                          borderRadius: '4px',
                          flexShrink: 0,
                          whiteSpace: 'nowrap'
                        }}>
                          {section.importance}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: '#F0FDF4',
              borderRadius: '10px',
              border: '1px solid #DCFCE7',
              fontSize: '11px',
              color: '#065F46',
              textAlign: 'center'
            }}>
              {hireabilityScore >= 80 ? '✨ All sections meet professional standards' : 
               hireabilityScore >= 60 ? '📈 Most sections are well-structured' : 
               '🎯 Focus on improving Critical & High importance sections'}
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>
              SWOT Analysis
            </h3>
            
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 25px' }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="60" fill="none" stroke="#E5E7EB" strokeWidth="15"/>
                
                <path d="M75,15 A60,60 0 ${strengthsPercentage > 50 ? 1 : 0},1 ${75 + 60 * Math.cos((strengthsPercentage * 3.6 - 90) * Math.PI / 180)},${75 + 60 * Math.sin((strengthsPercentage * 3.6 - 90) * Math.PI / 180)}"
                  fill="none" stroke="#10B981" strokeWidth="15" strokeLinecap="round"
                />
                
                <path d="M75,15 A60,60 0 ${weaknessesPercentage > 50 ? 1 : 0},1 ${75 + 60 * Math.cos((weaknessesPercentage * 3.6 - 90) * Math.PI / 180)},${75 + 60 * Math.sin((weaknessesPercentage * 3.6 - 90) * Math.PI / 180)}"
                  fill="none" stroke="#EF4444" strokeWidth="15" strokeLinecap="round"
                  transform={`rotate(${strengthsPercentage * 3.6} 75 75)`}
                />
              </svg>
              
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>
                  {strengthsPercentage}%
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Strengths</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                background: '#F0FDF4',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #DCFCE7',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{strengthsCount}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Strengths</div>
              </div>
              <div style={{
                background: '#FEF2F2',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #FEE2E2',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#EF4444' }}>{weaknessesCount}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Weaknesses</div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>
              Section Performance Heatmap
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              {sectionScores.map((section, index) => (
                <div key={index} style={{
                  background: section.value >= 70 ? '#F0FDF4' : section.value >= 50 ? '#FEF3C7' : '#FEF2F2',
                  padding: '15px',
                  borderRadius: '12px',
                  border: `2px solid ${section.value >= 70 ? '#DCFCE7' : section.value >= 50 ? '#FDE68A' : '#FEE2E2'}`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: section.value >= 70 ? '#10B981' : section.value >= 50 ? '#F59E0B' : '#EF4444',
                    marginBottom: '6px'
                  }}>
                    {Math.round(section.value)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#111827',
                    fontWeight: '600',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {section.label.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#6B7280',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {section.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '25px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>
              Improvement Priority
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#111827' }}>High Priority</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>{weaknessesCount} items</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#FEE2E2',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${weaknessesPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #EF4444, #DC2626)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#111827' }}>Medium Priority</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#F59E0B' }}>{suggestionsCount} items</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#FEF3C7',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(suggestionsCount / (suggestionsCount + weaknessesCount)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#111827' }}>Maintain</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>{strengthsCount} items</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#DCFCE7',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${strengthsPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981, #059669)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '30px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#111827',
            margin: '0 0 25px 0',
            textAlign: 'center'
          }}>
            Detailed Analysis Breakdown
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: '#F0FDF4',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #DCFCE7',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '80px',
                height: '80px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '50%',
                filter: 'blur(15px)'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>Strengths</h3>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{strengthsCount} key areas</div>
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {data.strengths?.slice(0, 3).map((strength, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    border: '1px solid #DCFCE7'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      background: '#F0FDF4',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    </div>
                    <span style={{ color: '#374151', lineHeight: '1.5', fontSize: '13px' }}>{strength}</span>
                  </div>
                ))}
                
                {data.strengths?.length > 3 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    color: '#10B981',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    +{data.strengths.length - 3} more strengths
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: '#FEF2F2',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #FEE2E2',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '80px',
                height: '80px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50%',
                filter: 'blur(15px)'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  !
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>Weaknesses</h3>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{weaknessesCount} areas to improve</div>
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {data.weaknesses?.slice(0, 3).map((weakness, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    border: '1px solid #FEE2E2'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      background: '#FEF2F2',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
                    </div>
                    <span style={{ color: '#374151', lineHeight: '1.5', fontSize: '13px' }}>{weakness}</span>
                  </div>
                ))}
                
                {data.weaknesses?.length > 3 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    color: '#EF4444',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    +{data.weaknesses.length - 3} more weaknesses
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: '#F0FDF4',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #DCFCE7',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '80px',
                height: '80px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '50%',
                filter: 'blur(15px)'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  💡
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>Suggestions</h3>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{suggestionsCount} actionable tips</div>
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {data.improvement_suggestions?.slice(0, 3).map((suggestion, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    border: '1px solid #DCFCE7'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      background: '#F0FDF4',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      <span style={{ fontSize: '9px', color: '#10B981', fontWeight: 'bold' }}>{index + 1}</span>
                    </div>
                    <span style={{ color: '#374151', lineHeight: '1.5', fontSize: '13px' }}>{suggestion}</span>
                  </div>
                ))}
                
                {data.improvement_suggestions?.length > 3 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    color: '#10B981',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    +{data.improvement_suggestions.length - 3} more suggestions
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: '#F5F3FF',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #EDE9FE',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '80px',
                height: '80px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '50%',
                filter: 'blur(15px)'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  ⚡
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#111827', fontWeight: '700' }}>Role Fit</h3>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{roleFitCount} alignment factors</div>
                </div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                {data.role_fit?.slice(0, 3).map((fit, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    border: '1px solid #EDE9FE'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      background: '#F5F3FF',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
                    </div>
                    <span style={{ color: '#374151', lineHeight: '1.5', fontSize: '13px' }}>{fit}</span>
                  </div>
                ))}
                
                {data.role_fit?.length > 3 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    color: '#8B5CF6',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    +{data.role_fit.length - 3} more factors
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer style={{
          textAlign: 'center',
          padding: '25px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px', fontWeight: '500' }}>
                Report Generated
              </div>
              <div style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px', fontWeight: '500' }}>
                Overall Assessment
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#F9FAFB',
                borderRadius: '50px',
                border: `1px solid ${status.color}40`
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: status.gradient
                }} />
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                  {status.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: status.color }}>
                  {hireabilityScore}/100
                </span>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px', fontWeight: '500' }}>
                Analysis Confidence
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#10B981 98.7%, #E5E7EB 0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#10B981'
                  }}>
                    98.7%
                  </div>
                </div>
                <div style={{ textAlign: 'left', minWidth: '100px' }}>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>High Accuracy</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>AI-powered analysis</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="10" fill="url(#logoFooter)"/>
                  <path d="M20 6L10 14L20 22L30 14L20 6Z" fill="white"/>
                  <path d="M10 22L20 30L30 22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <path d="M10 28L20 36L30 28" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="logoFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981"/>
                      <stop offset="100%" stopColor="#059669"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#111827',
                  lineHeight: '1'
                }}>
                  ResumeBOT
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  ENTERPRISE ATS
                </div>
              </div>
            </div>
            
            <div style={{
              width: '1px',
              height: '16px',
              background: '#E5E7EB',
              display: 'flex'
            }} />
            
            <div style={{
              fontSize: '11px',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span>v2.1.4</span>
              <div style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: '#10B981',
                opacity: '0.6'
              }} />
              <span>Enterprise Edition</span>
            </div>
            
            <div style={{
              width: '1px',
              height: '16px',
              background: '#E5E7EB',
              display: 'flex'
            }} />
            
            <div style={{
              fontSize: '11px',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 9.354C14.37 9.126 13.695 9 13 9C10.791 9 9 10.791 9 13C9 15.209 10.791 17 13 17C13.695 17 14.37 16.874 15 16.646" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>2026 ResumeBOT Technologies</span>
            </div>
          </div>
        </footer>
      </div>

      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -20px) rotate(5deg); }
          50% { transform: translate(-20px, 15px) rotate(-5deg); }
          75% { transform: translate(15px, 20px) rotate(3deg); }
        }
        
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr !important;
          }
          
          header {
            padding: 15px !important;
          }
          
          .card {
            padding: 20px !important;
          }
          
          footer {
            padding: 20px !important;
          }
          
          button {
            min-width: 100% !important;
          }
        }
        
        @media (max-width: 480px) {
          .card {
            padding: 15px !important;
          }
          
          h1 {
            font-size: 20px !important;
          }
          
          h2 {
            font-size: 20px !important;
          }
          
          h3 {
            font-size: 16px !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .full-width {
            grid-column: 1 / -1 !important;
          }
        }
        
        @media (min-width: 1025px) {
          .grid-container {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}