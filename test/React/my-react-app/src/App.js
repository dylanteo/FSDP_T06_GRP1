import React, { useState, useEffect } from 'react';
import TestResultsTable from './components/TestResultsTable';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestAnalytics from './components/TestAnalytics';
import { io } from 'socket.io-client'; // Import Socket.IO client
import './css/App.css';

function App() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCsvUploaderVisible, setIsCsvUploaderVisible] = useState(false);
  const [selectedBrowsers, setSelectedBrowsers] = useState([]);

  // Fetch initial test results from MongoDB
  const fetchTestResults = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/getTestResults');
      if (!response.ok) throw new Error(`Error fetching test results: ${response.statusText}`);
      const data = await response.json();
      setTestResults(data.map((result, index) => ({ ...result, testCaseId: index + 1 })));
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up WebSocket connection with Socket.IO
  useEffect(() => {
    fetchTestResults(); // Fetch initial data

    // Connect to the WebSocket
    const socket = io('http://localhost:8080/test-results-websocket');

    // Listen for new test results from WebSocket
    socket.on('testResults', (newTestResult) => {
      setTestResults((prevResults) => [...prevResults, newTestResult]);
    });

    // Cleanup WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleCsvUploader = () => {
    setIsCsvUploaderVisible(!isCsvUploaderVisible);
  };

  const startTests = () => {
    console.log("Starting tests with browsers:", selectedBrowsers);
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
