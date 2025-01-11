// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import TestResultsTable from './components/TestResultsTable';
import CodeTable from './components/CodeTable';
import ReportTable from './components/ReportTable';
import TestAnalytics from './components/TestAnalytics';
import TestCaseStatistics from './components/TestCaseStatistics';  // New Import
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

// **Statistics Page Component**
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

    // Extract basic test data
    testData.test_id = testItemElement.getAttribute('test-id');
    testData.name = testItemElement.querySelector('p.name').textContent.trim();
    testData.status = testItemElement.getAttribute('status');
    testData.timestamp = testItemElement.querySelector('p.text-sm span').textContent.trim();
    testData.duration = testItemElement.querySelectorAll('span')[1].textContent.trim();

    // Extract event details
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

  // Extract and validate the date from the h3 tags
  const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4} \d{1,2}:\d{2}:\d{2} [ap]m$/i;
  const dateElements = doc.querySelectorAll('h3');
  let date = null;

  dateElements.forEach(element => {
    const content = element.textContent.trim();
    if (dateRegex.test(content)) {
      date = content;  // If the content matches the date format, use it
    }
  });

  return { tests: testItems, date: date }; // Include the date if found
}

function App() {
  const [reports, setReports] = useState([]);
  const [reportContent, setReportContent] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [javaCode, setJavaCode] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [javaFile, setJavaFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Fetch test reports from the backend
  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/all-reports');
      if (!response.ok) throw new Error('Error fetching reports');
      const data = await response.json();
      const reportHtml = data.map((report) => report.content);
      const parsedReports = reportHtml.map(parseHTMLContent);
      setReportContent(parsedReports);
      setReports(data);
      //console.log(JSON.stringify(parsedReports, null, 2));
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchTestResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/testResults');
      if (!response.ok) throw new Error(`Error fetching test results: ${response.statusText}`);
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
      if (!response.ok) throw new Error('Error fetching Java files');
      const data = await response.json();
      setJavaCode(data);
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      setUploadStatus('Upload successful!');
      alert('Java file uploaded successfully!');
      document.getElementById('javaFileInput').value = '';
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
    fetchReports();
    fetchTestResults();
    fetchJavaFiles();
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
            <li>
              <Link to="/statistics">Statistics</Link> {/* New Page Link */}
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {error && <div className="error-message">Error: {error}</div>}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/analytics" />} />
              <Route path="/analytics" element={<AnalyticsPage testResults={reportContent} />} />
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
              <Route path="/statistics" element={<StatisticsPage testResults={reportContent} />} /> {/* New Route */}
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
