import React, { useState, useEffect } from 'react';
import TestResultsTable from './components/TestResultsTable';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestAnalytics from './components/TestAnalytics';
import './css/App.css';

function App() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Added error state
  const [isCsvUploaderVisible, setIsCsvUploaderVisible] = useState(false);
  const [selectedBrowsers, setSelectedBrowsers] = useState([]);
  const [javaFile, setJavaFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [testInProgress, setTestInProgress] = useState(false);

  // Function to fetch test results
  const fetchTestResults = async () => {
    try {
      console.log('Fetching test results...');
      const response = await fetch('http://localhost:5000/api/testResults');

      if (!response.ok) {
        throw new Error(`Error fetching test results: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received test results:', data); // Debug log

      if (!Array.isArray(data)) {
        throw new Error('Received data is not an array');
      }

      setTestResults(data.map((result, index) => ({ ...result, testCaseId: index + 1 })));
      setError(null);
    } catch (error) {
      console.error('Error fetching test results:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // File upload handler
  useEffect(() => {
    if (javaFile) {
      uploadJavaFile();
    }
  }, [javaFile]);

  // Toggle visibility of CSV uploader
  const toggleCsvUploader = () => {
    setIsCsvUploaderVisible(!isCsvUploaderVisible);
  };

  // Handle Java file change
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

  // Upload Java file to the backend
  const uploadJavaFile = async () => {
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

      const data = await response.json();
      console.log('Upload response:', data);
      setUploadStatus('Upload successful!');
      alert('Java file uploaded successfully!');

      // Clear the file input
      const fileInput = document.getElementById('javaFileInput');
      if (fileInput) fileInput.value = '';
      setJavaFile(null);

    } catch (error) {
      console.error('Error uploading Java file:', error);
      setUploadStatus(`Error uploading file: ${error.message}`);
      alert(`Error uploading file: ${error.message}`);
    }
  };

  // Handle upload button click
  const handleUploadButtonClick = () => {
    document.getElementById('javaFileInput').click();
  };

  // Start tests and simulate async behavior (set testInProgress to true)
  const startTests = () => {
    console.log('Starting tests with browsers:', selectedBrowsers);
    setTestInProgress(true);

    // Simulate the test process finishing and data refreshing
    setTimeout(() => {
      setTestInProgress(false);
      console.log('Tests completed. Refreshing test results...');
      fetchTestResults(); // Call to fetch new data
    }, 5000);  // Example: wait 5 seconds for tests to complete
  };

  // Periodically refresh test data (e.g., every 10 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!testInProgress) {
        console.log('Refreshing test results...');
        fetchTestResults();
      }
    }, 10000);  // Refresh every 10 seconds

    // Cleanup the interval on component unmount or when the test is in progress
    return () => clearInterval(intervalId);
  }, [testInProgress]);

  // Initial data fetch when the component mounts
  useEffect(() => {
    fetchTestResults(); // Call the function here to load the data when the component mounts
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Test Results Dashboard</h1>
      </header>

      {/* Add error display */}
      {error && (
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error: {error}
        </div>
      )}

      <div className="controls">
        <button className="btn upload-btn" onClick={toggleCsvUploader}>
          {isCsvUploaderVisible ? 'Hide CSV Uploader' : 'Upload CSV'}
        </button>
        <button
          className="btn create-btn"
          onClick={handleUploadButtonClick}
          disabled={uploadStatus === 'Uploading...'}
        >
          Upload Java Test Case
        </button>
        <button className="btn run-tests-btn" onClick={startTests}>
          {testInProgress ? 'Tests In Progress...' : 'Start Tests'}
        </button>
      </div>

      {isCsvUploaderVisible && <CsvUploader setTestCases={setTestResults} />}

      <BrowserSelector setSelectedBrowsers={setSelectedBrowsers} />

      {!loading && testResults.length === 0 && !error && (
        <div className="warning-message" style={{ color: 'orange', padding: '10px' }}>
          No test results found in the database
        </div>
      )}

      <TestAnalytics testResults={testResults} />

      {loading ? (
        <p>Loading test results...</p>
      ) : (
        <TestResultsTable testResults={testResults} />
      )}

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
}

export default App;
