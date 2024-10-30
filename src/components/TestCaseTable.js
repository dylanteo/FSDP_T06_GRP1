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

export default TestCaseTable;
