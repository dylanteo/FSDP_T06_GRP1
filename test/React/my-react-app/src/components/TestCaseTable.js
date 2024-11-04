/*
import React from 'react';

const TestCaseTable = ({ testCases }) => {
  return (
    <div>
      <h2>Test Cases</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Priority</th>
            <th>Feature</th>
            <th>Expected Result</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase, index) => (
            <tr key={index}>
              <td>{testCase.id}</td>
              <td>{testCase.name}</td>
              <td className={`priority-${testCase.priority.toLowerCase()}`}>
                {testCase.priority}
              </td>
              <td>{testCase.feature}</td>
              <td>{testCase.expectedResult}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestCaseTable;*/
import React from 'react';

const TestCaseTable = ({ testCases }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Password</th>
        </tr>
      </thead>
      <tbody>
        {testCases.map((testCase, index) => (
          <tr key={index}>
            <td>{testCase.username || 'N/A'}</td>
            <td>{testCase.password ? '*'.repeat(testCase.password.length) : 'N/A'}</td> {/* Display password as asterisks */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TestCaseTable;
