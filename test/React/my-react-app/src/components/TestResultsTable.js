// TestResultsTable.js
import React, { useState } from 'react';

const TestResultsTable = ({ testResults }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRowExpansion = (id) => {
    setExpandedRows((prevState) =>
      prevState.includes(id)
        ? prevState.filter((rowId) => rowId !== id)
        : [...prevState, id]
    );
  };

  return (
    <div className="test-results">
      <h2>Test Results</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Time Taken (ms)</th>
            <th>Status</th>
            <th>Error Message</th>
          </tr>
        </thead>
        <tbody>
          {testResults.map((result) => (
            <React.Fragment key={result.testCaseId}>
              {/* Main test case row */}
              <tr onClick={() => toggleRowExpansion(result.testCaseId)} className="test-row">
                <td>{result.testCaseId}</td>
                <td>{new Date(result.startTime).toLocaleString()}</td>
                <td>{new Date(result.endTime).toLocaleString()}</td>
                <td>{result.timeTaken}</td>
                <td className={`status-${result.status === 'Success' ? 'passed' : 'failed'}`}>
                  {result.status}
                </td>
                <td>{!result.success && result.errorMessage ? 'View Error' : 'No Error'}</td>
              </tr>

              {/* Expanded row for detailed error information */}
              {expandedRows.includes(result.testCaseId) && result.status === 'Failure' && result.errorMessage && (
                <tr className="expanded-row">
                  <td colSpan={6}>
                    <div className="test-details">
                      <strong>Error Message:</strong>
                      <p>{result.errorMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestResultsTable;