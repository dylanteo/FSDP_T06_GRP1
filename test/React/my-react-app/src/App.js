import React, { useState, useEffect } from 'react';
import TestResultsTable from './components/TestResultsTable';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestAnalytics from './components/TestAnalytics';
import './css/App.css';

function App() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCsvUploaderVisible, setIsCsvUploaderVisible] = useState(false);
  const [selectedBrowsers, setSelectedBrowsers] = useState([]);
  const [javaFile, setJavaFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
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

    fetchTestResults();
  }, []);

  // Use useEffect to handle file upload when javaFile state changes
  useEffect(() => {
    if (javaFile) {
      uploadJavaFile();
    }
  }, [javaFile]);

  const toggleCsvUploader = () => {
    setIsCsvUploaderVisible(!isCsvUploaderVisible);
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

  const handleUploadButtonClick = () => {
    document.getElementById('javaFileInput').click();
  };

  const startTests = () => {
    console.log('Starting tests with browsers:', selectedBrowsers);
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
        <button
          className="btn create-btn"
          onClick={handleUploadButtonClick}
          disabled={uploadStatus === 'Uploading...'}
        >
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