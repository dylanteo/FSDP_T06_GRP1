import React, { useState } from 'react';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestCaseTable from './components/TestCaseTable';
import TestResultsTable from './components/TestResultsTable'; // New Test Results Table
import './css/App.css';


function App() {
  const [testCases, setTestCases] = useState([]);
  const [selectedBrowsers, setSelectedBrowsers] = useState([]);
  const [testResults, setTestResults] = useState([]); // Initialize empty state for test results

  const [filters, setFilters] = useState({
    priority: 'All',
    feature: 'All',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filterTestCases = (testCase) => {
    if (filters.priority !== 'All' && testCase.priority !== filters.priority) {
      return false;
    }
    if (filters.feature !== 'All' && testCase.feature !== filters.feature) {
      return false;
    }
    return true;
  };

const runTests = async () => {
  console.log('Running tests...');
  console.log('Test Cases:', testCases);
  console.log('Browsers:', selectedBrowsers);

  // Convert test cases to JSON format if the server expects JSON
  const testCasesData = testCases.map(tc => ({
    username: tc.username,
    password: tc.password,
    browser: tc.browser
  }));
console.log("testcasedata",testCasesData);
  try {
    const response = await fetch('http://localhost:8080/api/testinglogin3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify(testCasesData), // Send the JSON data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    console.log('Response:', data);

    const resultsArray = JSON.parse(data);
    const parsedResults = resultsArray.map((result, index) => {
      const { testCaseId, startTime, endTime, success, errorMessage } = result;
      return {
        testCaseId: testCaseId || `TestCase ${index + 1}`,
        startTime: startTime || 'N/A',
        endTime: endTime || 'N/A',
        success: success || false,
        errorMessage: errorMessage || 'No errors',
      };
    });

    await fetch('http://localhost:5000/api/test-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedResults),
    });

    setTestResults(parsedResults);
  } catch (error) {
    console.error('Error running tests:', error);
  }
};



  return (
    <div className="App">
      <div className="sidebar">
        <h2>Test Case Manager</h2>
        <ul>
          <li>Create Test Case</li>
          <li>Move Folder</li>
          <li>Edit Folder</li>
          <li>Delete</li>
        </ul>
      </div>
      <div className="content">
        <div className="header">
          <button className="btn import">Import via CSV</button>
          <button className="btn create">Create Test Case</button>
        </div>

        <CsvUploader setTestCases={setTestCases} />

        {/* Filtering Section */}
        <div className="filters">
          <label>
            Priority:
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="All">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <label>
            Feature:
            <select name="feature" value={filters.feature} onChange={handleFilterChange}>
              <option value="All">All</option>
              <option value="Authentication">Authentication</option>
              <option value="Registration">Registration</option>
              <option value="Search">Search</option>
            </select>
          </label>
        </div>

        {testCases.length > 0 && (
          <>
            <TestCaseTable testCases={testCases.filter(filterTestCases)} />
            <BrowserSelector setSelectedBrowsers={setSelectedBrowsers} />
            <button className="btn run-tests" onClick={runTests}>
              Run Tests
            </button>
          </>
        )}

        <TestResultsTable testResults={testResults} /> {/* Updated Test Results Table */}
      </div>
    </div>
  );
}

export default App;

