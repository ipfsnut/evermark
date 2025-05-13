// src/components/testing/TestConsole.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { testHelper } from '../../utils/test-helper';
import { errorLogger } from '../../utils/error-logger';

// This component is for development/testing only
// It provides a small console to track errors and generate reports
const TestConsole: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState<any[]>([]);

  // Update summary when the console is opened
  useEffect(() => {
    if (isOpen) {
      setSummary(testHelper.getSummary());
    }
  }, [isOpen]);

  // Start a new session for this route
  const startSession = () => {
    const id = testHelper.startSession(
      location.pathname,
      location.pathname.split('/')[1] || 'home'
    );
    setActiveSession(id);
  };

  // End the current session
  const endSession = () => {
    if (activeSession) {
      testHelper.endSession(activeSession);
      setActiveSession(null);
      setSummary(testHelper.getSummary());
    }
  };

  // Add a note to the current session
  const addNote = () => {
    if (activeSession && note.trim()) {
      testHelper.addNote(note);
      setNote('');
    }
  };

  // Generate a report
  const generateReport = () => {
    const report = testHelper.generateReport();
    
    // Create a blob and download it
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evermark-test-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fill error form template
  const fillErrorForm = () => {
    // Create a template with current data
    const errorCount = errorLogger.getAll().length;
    
    const template = `## Evermark Testing Form

### Test Information
- Date/Time: ${new Date().toLocaleString()}
- Browser: ${navigator.userAgent}
- Device: ${window.innerWidth <= 768 ? 'Mobile' : 'Desktop'}
- Wallet Connected: [Yes/No]
- Page/Component Tested: ${location.pathname}

### Error Details
${errorCount > 0 ? '- Error Count: ' + errorCount : '- No errors detected'}
- Error Message: [Copy exact error message]
- Console Error: [Copy any console errors if available]
- Error Location: ${location.pathname}
- Steps to Reproduce:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]

### Context
- User Action: [What were you trying to do?]
- Expected Behavior: [What did you expect to happen?]
- Actual Behavior: [What actually happened?]
- Data State: [Any relevant data states - logged in, specific Evermark loaded, etc.]

### Error Classification
- Type: [UI/Blockchain/Authentication/Data/Network]
- Severity: [Critical/High/Medium/Low]
- Frequency: [Always/Often/Sometimes/Rarely]

### Additional Notes
${summary.length > 0 ? '- Test sessions completed: ' + summary.length : ''}
${activeSession ? '- Active test session: ' + activeSession : ''}

### Potential Solutions (if known)
[Your thoughts on how to fix if you have ideas]`;

    // Create a blob and download it
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evermark-error-form-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          backgroundColor: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          cursor: 'pointer'
        }}
      >
        🧪
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#222',
        color: '#eee',
        borderRadius: '8px',
        width: '350px',
        maxHeight: '400px',
        overflowY: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Evermark Test Console</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ marginBottom: '5px' }}>
          <strong>Current Path:</strong> {location.pathname}
        </div>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          {!activeSession ? (
            <button
              onClick={startSession}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Start Testing
            </button>
          ) : (
            <button
              onClick={endSession}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              End Testing
            </button>
          )}
          
          <button
            onClick={generateReport}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Generate Report
          </button>
          
          <button
            onClick={fillErrorForm}
            style={{
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Get Error Form
          </button>
        </div>
        
        {activeSession && (
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add testing note..."
              style={{
                flex: 1,
                padding: '5px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <button
              onClick={addNote}
              style={{
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div>
        <h4 style={{ margin: '10px 0 5px', fontSize: '13px' }}>Recent Errors</h4>
        <div style={{ backgroundColor: '#333', padding: '5px', borderRadius: '4px' }}>
          {errorLogger.getAll().length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errorLogger.getAll().slice(-5).map((error, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>
                  <span style={{ color: '#f44336' }}>{error.component}:</span>{' '}
                  {error.message.slice(0, 50)}
                  {error.message.length > 50 ? '...' : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: '#888' }}>No errors logged yet</p>
          )}
        </div>

        <h4 style={{ margin: '10px 0 5px', fontSize: '13px' }}>Test Sessions</h4>
        <div style={{ backgroundColor: '#333', padding: '5px', borderRadius: '4px' }}>
          {summary.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {summary.map((session, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>
                  <span style={{ color: '#4caf50' }}>{session.component}:</span>{' '}
                  {session.errorCount} errors, {session.notes.length} notes
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: '#888' }}>No test sessions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestConsole;