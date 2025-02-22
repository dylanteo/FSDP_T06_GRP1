import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import TestResultsTable from './components/TestResultsTable';
import CodeTable from './components/CodeTable';
import ReportTable from './components/ReportTable';
import TestAnalytics from './components/TestAnalytics';
import TestCaseStatistics from './components/TestCaseStatistics';
import './css/App.css';

// Import Auth Components
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Register from './components/Register';

// Analytics Page Component
const AnalyticsPage = ({ testResults }) => (
  <div className="page-container">
    <h2>Analytics Dashboard</h2>
    <TestAnalytics testResults={testResults} />
  </div>
);

// Code Page Component
const CodePage = ({ javaCode, handleJavaFileChange, handleUploadButtonClick, uploadStatus }) => (
  <div className="page-container">
    <h2>TestCase Bank</h2>
    <div className="controls">
      <button
        className="btn create-btn"
        onClick={handleUploadButtonClick}
        disabled={uploadStatus === 'Uploading...'}
      >
        Upload Java Test Case
      </button>
    </div>
    <CodeTable javaCode={javaCode} />
    <input
      id="javaFileInput"
      type="file"
      accept=".java"
      style={{ display: 'none' }}
      onChange={handleJavaFileChange}
    />
    {uploadStatus && (
      <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : ''}`}>
        {uploadStatus}
      </div>
    )}
  </div>
);

// Results Page Component
const ResultsPage = ({ testResults, reports }) => (
  <div className="page-container">
    <h2>Test Results</h2>
    <ReportTable reports={reports} />
  </div>
);

// Statistics Page Component
const StatisticsPage = ({ testResults }) => (
  <div className="page-container">
    <h2>Test Case Statistics Dashboard</h2>
    <TestCaseStatistics testResults={testResults} />
  </div>
);

// Function to parse HTML report content into structured data
function parseHTMLContent(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Extract the test items
  const testItems = [];
  const testItemElements = doc.querySelectorAll('li.test-item');

  testItemElements.forEach(testItemElement => {
    const testData = {};
    testData.test_id = testItemElement.getAttribute('test-id');
    testData.name = testItemElement.querySelector('p.name').textContent.trim();
    testData.status = testItemElement.getAttribute('status');
    testData.timestamp = testItemElement.querySelector('p.text-sm span').textContent.trim();
    testData.duration = testItemElement.querySelectorAll('span')[1].textContent.trim();

    const events = [];
    const eventRows = testItemElement.querySelectorAll('tr.event-row');

    eventRows.forEach(eventRow => {
      const event = {};
      event.status = eventRow.querySelector('span').textContent.trim();
      event.timestamp = eventRow.querySelectorAll('td')[1].textContent.trim();
      event.details = eventRow.querySelectorAll('td')[2].textContent.trim();
      events.push(event);
    });

    testData.events = events;
    testItems.push(testData);
  });

  const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4} \d{1,2}:\d{2}:\d{2} [ap]m$/i;
  const dateElements = doc.querySelectorAll('h3');
  let date = null;

  dateElements.forEach(element => {
    const content = element.textContent.trim();
    if (dateRegex.test(content)) {
      date = content;
    }
  });

  return { tests: testItems, date: date };
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : null;
}

// Navigation Component
const Navigation = ({ user, logout }) => (
  <nav className="vertical-nav">
    <div className="nav-header">
      <h1><strong>OCBC</strong></h1>
      <div className="user-info">
        <span>Welcome, {user.name}</span>
      </div>
    </div>
    <ul>
      <li>
        <Link to="/analytics">Test Analytics</Link>
      </li>
      <li>
        <Link to="/code">Code Bank</Link>
      </li>
    </ul>
    <div className="logout-container">
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    </div>
  </nav>
);

// Main Dashboard Component
function Dashboard({ handleJavaFileChange, handleUploadButtonClick }) {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [reportContent, setReportContent] = useState([]);
  const [JSONContent, setJSONContent] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [javaCode, setJavaCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/all-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error fetching reports');
      const data = await response.json();
      const reportHtml = data.map((report) => report.content);
      const parsedReports = reportHtml.map(parseHTMLContent);
      setReportContent(parsedReports);
      setReports(data);
    } catch (error) {
      console.log('Error fetching reports:', error);
    }
  };

  const fetchJSONReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/json-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setJSONContent(data);
    } catch (error) {
      console.log('Error fetching JSON reports:', error);
    }
  };

  const fetchTestResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/testResults', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Error fetching test results: ${response.statusText}`);
      const data = await response.json();
      setTestResults(data.map((result, index) => ({ ...result, testCaseId: index + 1 })));
    } catch (error) {
      console.log('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJavaFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/all-java-code', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) return;
      const data = await response.json();
      setJavaCode(data);
    } catch (error) {
      console.log('Error fetching Java files:', error);
    }
  };

  useEffect(() => {
    // Only fetch data if user is logged in
    if (user) {
      fetchReports();
      fetchTestResults();
      fetchJavaFiles();
      fetchJSONReports();
    }
  }, [user]); // Add user as dependency

  return (
    <div className="app-container">
      <Navigation user={user} logout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/analytics" />} />
          <Route path="/analytics" element={<AnalyticsPage testResults={JSONContent} />} />
          <Route
            path="/code"
            element={
              <CodePage
                javaCode={javaCode}
                handleJavaFileChange={handleJavaFileChange}
                handleUploadButtonClick={handleUploadButtonClick}
                uploadStatus={uploadStatus}
              />
            }
          />
          <Route path="/results" element={<ResultsPage testResults={testResults} reports={reports} />} />
          <Route path="/statistics" element={<StatisticsPage testResults={testResults} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleJavaFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.java')) {
      const formData = new FormData();
      formData.append('file', file);

      setUploadStatus('Uploading...');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/upload-code', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setUploadStatus('Upload successful!');
        alert('Java file uploaded successfully!');
        document.getElementById('javaFileInput').value = '';
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus(`Error uploading file: ${error.message}`);
        alert(`Error uploading file: ${error.message}`);
      }
    } else {
      alert('Please upload a valid Java file (.java)');
      setUploadStatus(null);
    }
  };

  const handleUploadButtonClick = () => {
    document.getElementById('javaFileInput').click();
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Dashboard
                    handleJavaFileChange={handleJavaFileChange}
                    handleUploadButtonClick={handleUploadButtonClick}
                    uploadStatus={uploadStatus}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;