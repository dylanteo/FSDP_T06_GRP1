import React from 'react';


const TestAnalytics = ({ testResults }) => {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(result => result.status === 'Success').length;
  const failedTests = totalTests - passedTests;

  const passPercentage = totalTests ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
  const failPercentage = totalTests ? ((failedTests / totalTests) * 100).toFixed(2) : 0;

  return (
    <div className="test-analytics">
      <h2>Test Analytics</h2>
      <div className="analytics-metrics">
        <div className="metric">
          <h3>{totalTests}</h3>
          <p>Total Tests</p>
        </div>
        <div className="metric">
          <h3>{passedTests}</h3>
          <p>Tests Passed</p>
        </div>
        <div className="metric">
          <h3>{failedTests}</h3>
          <p>Tests Failed</p>
        </div>
        <div className="metric pass-percentage">
          <h3>{passPercentage}%</h3>
          <p>Pass Percentage</p>
        </div>
        <div className="metric fail-percentage">
          <h3>{failPercentage}%</h3>
          <p>Fail Percentage</p>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics;