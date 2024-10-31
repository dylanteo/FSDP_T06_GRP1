import React, { useState } from 'react';
import CsvUploader from './components/CsvUploader';
import BrowserSelector from './components/BrowserSelector';
import TestCaseTable from './components/TestCaseTable';
import TestResultsTable from './components/TestResultsTable';  // New Test Results Table
import './App.css';
import LoginForm from "./loginform";

function App() {
  const [testCases, setTestCases] = useState([]);
  const [selectedBrowsers, setSelectedBrowsers] = useState([]);
  const [testResults, setTestResults] = useState([
    {
      id: 1,
      name: 'Test Login Flow',
      status: 'Passed',
      started: '10:15 AM',
      logs: 'Login Flow executed successfully.',
      errors: [],
    },
    {
      id: 2,
      name: 'Test Register Flow',
      status: 'Failed',
      started: '10:30 AM',
      logs: 'Registration Flow encountered an issue.',
      errors: ['Email validation failed', 'Password too weak'],
    },
    {
      id: 3,
      name: 'Check Register Flow as Tester',
      status: 'Running',
      started: '11:00 AM',
      logs: 'Test is still running...',
      errors: [],
    },
  ]);

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

  const runTests = () => {
    console.log('Running tests...');
    console.log('Test Cases:', testCases);
    console.log('Browsers:', selectedBrowsers);
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
        <LoginForm />
      </div>
    </div>

  );
}

export default App;