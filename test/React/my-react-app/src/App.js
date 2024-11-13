import React, { useState, useEffect } from 'react';
import TestResultsTable from './components/TestResultsTable';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestAnalytics from './components/TestAnalytics'; // Import the new TestAnalytics component
import './css/App.css';

function App() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [isCsvUploaderVisible, setIsCsvUploaderVisible] = useState(false);
  const [selectedBrowsers, setSelectedBrowsers] = useState([]); // For browser selection

  // Fetch test results from MongoDB when the component loads
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/getTestResults');
        if (!response.ok) throw new Error(`Error fetching test results: ${response.statusText}`);
        const data = await response.json();
        setTestResults(data.map((result, index) => ({ ...result, testCaseId: index + 1 }))); // Set ID starting from 1
      } catch (error) {
        console.error('Error fetching test results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, []);

  // Toggle CSV uploader visibility
  const toggleCsvUploader = () => {
    setIsCsvUploaderVisible(!isCsvUploaderVisible);
  };

  // Placeholder function for starting tests
  const startTests = () => {
    console.log("Starting tests with browsers:", selectedBrowsers);
    // Logic to run tests can be added here
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Test Results Dashboard</h1>
      </header>

      <div className="controls">
        <button className="btn upload-btn" onClick={toggleCsvUploader}>
          {isCsvUploaderVisible ? 'Hide CSV Uploader' : 'Upload CSV'}
        </button>
        <button className="btn create-btn" onClick={() => alert("Upload Java File - Coming Soon!")}>
          Upload Java Test Case
        </button>
        <button className="btn run-tests-btn" onClick={startTests}>
          Start Tests
        </button>
      </div>

      {isCsvUploaderVisible && <CsvUploader setTestCases={setTestResults} />}

      <BrowserSelector setSelectedBrowsers={setSelectedBrowsers} />

      {/* Test Analytics Component to show test statistics */}
      <TestAnalytics testResults={testResults} />

      {loading ? (
        <p>Loading test results...</p>
      ) : (
        <TestResultsTable testResults={testResults} />
      )}
    </div>
  );
}

export default App;
