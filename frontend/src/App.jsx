import { useState, useEffect, useRef } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Chat state
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'system',
      text: 'Hello! I am your AI Scholarship Assistant. Ask me anything about eligibility criteria, application processes, deadlines, or document requirements for scholarships.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Matcher state
  const [profile, setProfile] = useState({
    field: 'any',
    gender: 'any',
    income: 300000,
    level: 'undergraduate'
  })
  const [recommendations, setRecommendations] = useState([])
  const [isRecommending, setIsRecommending] = useState(false)
  const [matcherSubmitted, setMatcherSubmitted] = useState(false)

  // Browse state
  const [allScholarships, setAllScholarships] = useState([])
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  // Fetch all scholarships on load and tab change to 'browse'
  useEffect(() => {
    if (activeTab === 'browse' || activeTab === 'dashboard') {
      setIsLoadingScholarships(true)
      fetch('/api/scholarships')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch scholarships')
          return res.json()
        })
        .then(data => {
          setAllScholarships(data.scholarships || [])
          setIsLoadingScholarships(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoadingScholarships(false)
        })
    }
  }, [activeTab])

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMsgText = chatInput
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Add user message
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsgText, time: currentTime }])
    setChatInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsgText })
      })

      if (!response.ok) throw new Error('API request failed')
      
      const data = await response.json()
      
      setIsTyping(false)
      setChatMessages(prev => [...prev, { 
        sender: 'system', 
        text: data.answer, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        similarity: data.similarity
      }])
    } catch (error) {
      console.error(error)
      setIsTyping(false)
      setChatMessages(prev => [...prev, { 
        sender: 'system', 
        text: 'Sorry, I encountered an error connecting to the AI brain. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }
  }

  // Handle Matcher recommendation request
  const handleRecommendSubmit = async (e) => {
    e.preventDefault()
    setIsRecommending(true)
    setMatcherSubmitted(true)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: profile.field,
          gender: profile.gender,
          income: parseInt(profile.income),
          level: profile.level
        })
      })

      if (!response.ok) throw new Error('Recommendation failed')
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
      setIsRecommending(false)
    } catch (error) {
      console.error(error)
      setIsRecommending(false)
    }
  }

  // Preset suggested questions for sidebar
  const suggestedQuestions = [
    "Scholarships for engineering students",
    "What documents are required for NSP scholarship?",
    "What is the income limit for NSP scholarship?",
    "Scholarships for female students",
    "What is the scholarship amount in NSP scholarship?",
    "Can undergraduate students apply for scholarships?"
  ]

  // Filter scholarships based on search query
  const filteredScholarships = allScholarships.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.level.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
          </div>
          <span className="logo-text">Scholarship AI</span>
        </div>
        
        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            AI Assistant
          </button>
          <button 
            className={`tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
            onClick={() => setActiveTab('matcher')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M3 16h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H3M21 16h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2"/>
              <path d="M12 3v3M12 18v3"/>
            </svg>
            Scholarship Matcher
          </button>
          <button 
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Browse
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="hero-section">
              <div className="hero-tag">
                <span className="pulsing-dot"></span> Powered by NLP & Cosine Similarity
              </div>
              <h1 className="hero-title">Discover and Match Your Ideal <span>Scholarship</span></h1>
              <p className="hero-desc">
                Scholarship AI simplifies the complex process of finding financial aid. Chat with our intelligent model or enter your profile to get matches instantly.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => setActiveTab('chat')}>
                  Chat with AI Assistant
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('matcher')}>
                  Find Matcher Tool
                </button>
              </div>
            </div>

            <div className="features-grid">
              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
                <h3>NLP Q&A Assistant</h3>
                <p>Ask free-form questions about eligibility, application processes, and documents, powered by high-accuracy text vectorization.</p>
              </div>

              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                </div>
                <h3>Profile-Based Matcher</h3>
                <p>Instantly scan and match against scholarships based on your academic level, stream, annual income, and demographics.</p>
              </div>

              <div className="glass-card feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3>Browse Database</h3>
                <p>View all active scholarship program records, benefits details, income thresholds, and specific institutional conditions.</p>
              </div>
            </div>
          </div>
        )}

        {/* AI CHATBOT TAB */}
        {activeTab === 'chat' && (
          <div className="chat-layout">
            {/* Sidebar */}
            <div className="glass-card chat-sidebar">
              <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>Suggested Queries</h3>
              <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px'}}>Click on any query below to ask the AI assistant immediately.</p>
              <div className="suggested-box">
                {suggestedQuestions.map((q, idx) => (
                  <button 
                    key={idx} 
                    className="suggested-item" 
                    onClick={() => {
                      setChatInput(q);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="glass-card chat-main">
              <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.sender}`}>
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                    <span className="message-meta">
                      {msg.time} {msg.similarity && `• Match: ${(msg.similarity * 100).toFixed(0)}%`}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="chat-message system">
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask a question about scholarships..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isTyping}
                />
                <button type="submit" className="btn btn-primary" disabled={isTyping || !chatInput.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SCHOLARSHIP MATCHER TAB */}
        {activeTab === 'matcher' && (
          <div className="matcher-container">
            <div className="glass-card">
              <h2 className="page-title" style={{fontSize: '28px'}}>Curated Match Finder</h2>
              <p className="page-subtitle" style={{marginBottom: '24px'}}>Fill in your academic profile and criteria to filter matching scholarship benefits.</p>

              <form onSubmit={handleRecommendSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Field of Study</label>
                    <select 
                      className="form-select"
                      value={profile.field}
                      onChange={(e) => setProfile({...profile, field: e.target.value})}
                    >
                      <option value="any">Any / General</option>
                      <option value="engineering">Engineering</option>
                      <option value="technical">Technical (Diploma/Vocational)</option>
                      <option value="computer science">Computer Science</option>
                      <option value="science">Basic Sciences</option>
                      <option value="medical">Medical / Pharmacy / Nursing</option>
                      <option value="management">Management / MBA</option>
                      <option value="commerce">Commerce / Accountancy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      className="form-select"
                      value={profile.gender}
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                    >
                      <option value="any">Prefer Not to Say / All</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Education Level</label>
                    <select 
                      className="form-select"
                      value={profile.level}
                      onChange={(e) => setProfile({...profile, level: e.target.value})}
                    >
                      <option value="undergraduate">Undergraduate (UG)</option>
                      <option value="postgraduate">Postgraduate (PG)</option>
                      <option value="diploma">Diploma</option>
                      <option value="phd">Ph.D. / Research</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Annual Family Income limit (₹)</label>
                    <input 
                      type="range" 
                      min="100000" 
                      max="1200000" 
                      step="50000"
                      className="form-input"
                      style={{padding: '10px 0'}}
                      value={profile.income}
                      onChange={(e) => setProfile({...profile, income: parseInt(e.target.value)})}
                    />
                    <div className="range-display">
                      <span>Min: ₹1,00,000</span>
                      <strong style={{color: 'var(--primary)'}}>Selected: ≤ ₹{profile.income.toLocaleString('en-IN')}</strong>
                      <span>Max: ₹12,00,000</span>
                    </div>
                  </div>
                </div>

                <div style={{textAlign: 'center', marginTop: '16px'}}>
                  <button type="submit" className="btn btn-primary" style={{padding: '14px 40px'}}>
                    Search Matches
                  </button>
                </div>
              </form>
            </div>

            {/* Recommendations Output */}
            {matcherSubmitted && (
              <div style={{marginTop: '36px'}}>
                <h3 className="page-title" style={{fontSize: '24px', textAlign: 'left', marginBottom: '16px'}}>Matched Scholarships</h3>
                
                {isRecommending ? (
                  <div className="empty-state">
                    <div className="typing-indicator" style={{justifyContent: 'center', marginBottom: '12px'}}>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                    <p>Scanning database profiles...</p>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="scholarship-grid">
                    {recommendations.map((item, idx) => (
                      <div key={idx} className="scholarship-card">
                        <span className="card-header-badge">{item.level}</span>
                        <div>
                          <h4>{item.name}</h4>
                          <div className="meta-info-list">
                            <div className="meta-info-item">
                              <span className="meta-label">Category:</span>
                              <span className="meta-val">{item.category}</span>
                            </div>
                            <div className="meta-info-item">
                              <span className="meta-label">Gender:</span>
                              <span className="meta-val">{item.gender}</span>
                            </div>
                            <div className="meta-info-item">
                              <span className="meta-label">Max Income:</span>
                              <span className="meta-val">₹{item.income_limit.toLocaleString('en-IN')}/yr</span>
                            </div>
                            <div className="meta-info-item">
                              <span className="meta-label">Target Field:</span>
                              <span className="meta-val">{item.field}</span>
                            </div>
                          </div>
                        </div>
                        <div className="benefit-box">
                          <div className="benefit-label">Benefit Amount</div>
                          <div className="benefit-val">{item.benefit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>No scholarships found matching this exact profile. Try adjusting the family income or widening the study field.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BROWSE TAB */}
        {activeTab === 'browse' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px'}}>
              <div>
                <h2 className="page-title" style={{fontSize: '28px'}}>Scholarship Directory</h2>
                <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>Browse the complete database of scholarships supported in our model.</p>
              </div>
              
              <div className="search-container">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search by name, stream, level..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoadingScholarships ? (
              <div className="empty-state">
                <div className="typing-indicator" style={{justifyContent: 'center', marginBottom: '12px'}}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
                <p>Loading database entries...</p>
              </div>
            ) : filteredScholarships.length > 0 ? (
              <div className="scholarship-grid">
                {filteredScholarships.map((item, idx) => (
                  <div key={idx} className="scholarship-card">
                    <span className="card-header-badge">{item.level}</span>
                    <div>
                      <h4>{item.name}</h4>
                      <div className="meta-info-list">
                        <div className="meta-info-item">
                          <span className="meta-label">Category:</span>
                          <span className="meta-val">{item.category}</span>
                        </div>
                        <div className="meta-info-item">
                          <span className="meta-label">Gender:</span>
                          <span className="meta-val">{item.gender}</span>
                        </div>
                        <div className="meta-info-item">
                          <span className="meta-label">Max Income:</span>
                          <span className="meta-val">₹{item.income_limit.toLocaleString('en-IN')}/yr</span>
                        </div>
                        <div className="meta-info-item">
                          <span className="meta-label">Target Field:</span>
                          <span className="meta-val">{item.field}</span>
                        </div>
                        <div className="meta-info-item">
                          <span className="meta-label">Country:</span>
                          <span className="meta-val">{item.country}</span>
                        </div>
                      </div>
                    </div>
                    <div className="benefit-box">
                      <div className="benefit-label">Benefit Amount</div>
                      <div className="benefit-val">{item.benefit}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No scholarships found matching "{searchQuery}". Try a different keyword.</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

export default App
