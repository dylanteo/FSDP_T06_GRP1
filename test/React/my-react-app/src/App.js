//App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import TestResultsTable from './components/TestResultsTable';
import CodeTable from './components/CodeTable';
import ReportTable from './components/ReportTable';
import TestAnalytics from './components/TestAnalytics';
import './css/App.css';

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
    <h2>Code Repository</h2>
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
    <TestResultsTable testResults={testResults} />
    <ReportTable reports={reports} />
  </div>
);

function App() {
  const [reports, setReports] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [javaCode, setJavaCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [javaFile, setJavaFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [testInProgress, setTestInProgress] = useState(false);

  // Your existing fetch functions remain the same
  const fetchTestResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/testResults');
      if (!response.ok) {
        throw new Error(`Error fetching test results: ${response.statusText}`);
      }
      const data = await response.json();
      setTestResults(data.map((result, index) => ({ ...result, testCaseId: index + 1 })));
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJavaFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/all-java-code');
      if (!response.ok) {
        throw new Error('Error fetching Java files');
      }
      const data = await response.json();
      setJavaCode(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/all-reports');
      if (!response.ok) {
        throw new Error('Error fetching reports');
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleJavaFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.java')) {
      setJavaFile(file);
      setUploadStatus('Preparing upload...');
    } else {
      alert('Please upload a valid Java file (.java)');
      setUploadStatus(null);
    }
  };

  const uploadJavaFile = async () => {
    if (!javaFile) return;

    const formData = new FormData();
    formData.append('file', javaFile);

    try {
      setUploadStatus('Uploading...');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      setUploadStatus('Upload successful!');
      alert('Java file uploaded successfully!');

      const fileInput = document.getElementById('javaFileInput');
      if (fileInput) fileInput.value = '';
      setJavaFile(null);
      fetchJavaFiles();
    } catch (error) {
      setUploadStatus(`Error uploading file: ${error.message}`);
      alert(`Error uploading file: ${error.message}`);
    }
  };

  const handleUploadButtonClick = () => {
    document.getElementById('javaFileInput').click();
  };

  useEffect(() => {
    if (javaFile) {
      uploadJavaFile();
    }
  }, [javaFile]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!testInProgress) {
        fetchTestResults();
      }
    }, 300000);
    return () => clearInterval(intervalId);
  }, [testInProgress]);

  useEffect(() => {
    fetchTestResults();
    fetchJavaFiles();
    fetchReports();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <nav className="vertical-nav">
          <div className="nav-header">
            <h1>Test Dashboard</h1>
          </div>
          <ul>
            <li>
              <Link to="/analytics">Analytics</Link>
            </li>
            <li>
              <Link to="/code">Code</Link>
            </li>
            <li>
              <Link to="/results">Results</Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/analytics" />} />
              <Route
                path="/analytics"
                element={<AnalyticsPage testResults={testResults} />}
              />
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
              <Route
                path="/results"
                element={<ResultsPage testResults={testResults} reports={reports} />}
              />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
