
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
