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
            <th>Test Name</th>
            <th>Status</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {testResults.map((result) => (
            <React.Fragment key={result.id}>
              <tr onClick={() => toggleRowExpansion(result.id)} className="test-row">
                <td>{result.id}</td>
                <td>{result.name}</td>
                <td className={`status-${result.status.toLowerCase()}`}>{result.status}</td>
                <td>{result.started}</td>
              </tr>
              {expandedRows.includes(result.id) && (
                <tr className="expanded-row">
                  <td colSpan={4}>
                    <div className="test-details">
                      <strong>Logs:</strong>
                      <p>{result.logs}</p>
                      {result.errors.length > 0 && (
                        <>
                          <strong>Errors:</strong>
                          <ul>
                            {result.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </>
                      )}
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
