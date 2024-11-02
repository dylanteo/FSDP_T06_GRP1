//import React, { useState } from 'react';
//import CsvUploader from './components/CsvUploader';
//import BrowserSelector from './components/BrowserSelector';
//import TestCaseTable from './components/TestCaseTable';
//import TestResultsTable from './components/TestResultsTable'; // New Test Results Table
//import './App.css';
//import LoginForm from "./loginform";
//
//function App() {
//  const [testCases, setTestCases] = useState([]);
//  const [selectedBrowsers, setSelectedBrowsers] = useState([]);
//  const [testResults, setTestResults] = useState([]); // Initialize empty state for test results
//
//  const [filters, setFilters] = useState({
//    priority: 'All',
//    feature: 'All',
//  });
//
//  const handleFilterChange = (e) => {
//    const { name, value } = e.target;
//    setFilters((prevFilters) => ({
//      ...prevFilters,
//      [name]: value,
//    }));
//  };
//
//  const filterTestCases = (testCase) => {
//    if (filters.priority !== 'All' && testCase.priority !== filters.priority) {
//      return false;
//    }
//    if (filters.feature !== 'All' && testCase.feature !== filters.feature) {
//      return false;
//    }
//    return true;
//  };
//
//  const runTests = async () => {
//    console.log('Running tests...');
//    console.log('Test Cases:', testCases);
//    console.log('Browsers:', selectedBrowsers);
//
//    // Prepare the CSV data
//    const csvHeader = "username,password\n"; // Change the header according to your test case fields
//    const csvRows = testCases.map(tc => `${tc.username},${tc.password}`).join("\n"); // Map your test cases accordingly
//    const csvData = csvHeader + csvRows;
//
//    try {
//      const response = await fetch('http://localhost:8080/api/run-tests', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'text/csv', // Set content type to CSV
//        },
//        body: csvData, // Send the CSV data
//      });
//
//      if (!response.ok) {
//        throw new Error(`HTTP error! status: ${response.status}`);
//      }
//
//      const data = await response.text(); // Expecting text response for CSV
//      console.log('Response:', data);
//
//      // Parse the response CSV-like string into an array of objects
//      const parsedResults = data.split('\n').map((line, index) => {
//        const [id, name, status, started, ended, logs] = line.split(',');
//        return {
//          id: id || index + 1, // Fallback to index as ID if ID is missing
//          name: name || `Test ${index + 1}`,
//          status: status || 'Unknown',
//          started: started || 'N/A',
//          ended: ended || 'N/A',
//          logs: logs || 'No logs',
//          errors: [] // Initialize an empty array for errors, you can populate it later if needed
//        };
//      });
//
//      // Update the testResults state with the parsed results
//      setTestResults(parsedResults);
//
//    } catch (error) {
//      console.error('Error running tests:', error);
//    }
//  };
//
//  return (
//    <div className="App">
//      <div className="sidebar">
//        <h2>Test Case Manager</h2>
//        <ul>
//          <li>Create Test Case</li>
//          <li>Move Folder</li>
//          <li>Edit Folder</li>
//          <li>Delete</li>
//        </ul>
//      </div>
//      <div className="content">
//        <div className="header">
//          <button className="btn import">Import via CSV</button>
//          <button className="btn create">Create Test Case</button>
//        </div>
//
//        <CsvUploader setTestCases={setTestCases} />
//
//        {/* Filtering Section */}
//        <div className="filters">
//          <label>
//            Priority:
//            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
//              <option value="All">All</option>
//              <option value="High">High</option>
//              <option value="Medium">Medium</option>
//              <option value="Low">Low</option>
//            </select>
//          </label>
//          <label>
//            Feature:
//            <select name="feature" value={filters.feature} onChange={handleFilterChange}>
//              <option value="All">All</option>
//              <option value="Authentication">Authentication</option>
//              <option value="Registration">Registration</option>
//              <option value="Search">Search</option>
//            </select>
//          </label>
//        </div>
//
//        {testCases.length > 0 && (
//          <>
//            <TestCaseTable testCases={testCases.filter(filterTestCases)} />
//            <BrowserSelector setSelectedBrowsers={setSelectedBrowsers} />
//            <button className="btn run-tests" onClick={runTests}>
//              Run Tests
//            </button>
//          </>
//        )}
//
//        <TestResultsTable testResults={testResults} /> {/* Updated Test Results Table */}
//      </div>
//    </div>
//  );
//}
////<LoginForm />
//export default App;
import React, { useState } from 'react';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestCaseTable from './components/TestCaseTable';
import TestResultsTable from './components/TestResultsTable'; // New Test Results Table
import './App.css';

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

    // Prepare the CSV data
    const csvHeader = "username,password\n"; // Change the header according to your test case fields
    const csvRows = testCases.map(tc => `${tc.username},${tc.password}`).join("\n"); // Map your test cases accordingly
    const csvData = csvHeader + csvRows;

    try {
      const response = await fetch('http://localhost:8080/api/run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv', // Set content type to CSV
        },
        body: csvData, // Send the CSV data
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text(); // Expecting text response for CSV
      console.log('Response:', data);

      // Parse the JSON response
      const resultsArray = JSON.parse(data);

      // Map results to an array of objects
      const parsedResults = resultsArray.map((result, index) => {
        const { id, startTime, endTime, success, errorMessage } = JSON.parse(result);
        return {
          id: id || `Test ${index + 1}`, // Use test index as fallback if ID is missing
          startTime: startTime || 'N/A',
          endTime: endTime || 'N/A',
          success: success || false,
          errorMessage: errorMessage || 'No errors',
        };
      });

      // Update the testResults state with the parsed results
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

