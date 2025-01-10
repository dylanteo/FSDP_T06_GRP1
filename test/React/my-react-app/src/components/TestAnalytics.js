import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestAnalytics = ({ testResults }) => {
  const [selectedTestType, setSelectedTestType] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

const handleFilter = (tests) => {
  return tests.filter((test) => {
    const matchesTestType = selectedTestType ? test.name === selectedTestType : true;
    const testMonth = new Date(test.timestamp).getMonth() + 1; // getMonth() is 0-indexed (0 = January)
    const matchesMonth = selectedMonth ? testMonth === parseInt(selectedMonth, 10) : true;
    return matchesTestType && matchesMonth;
  });
};

  const processReportData = () => {
    if (!testResults || !testResults.length || !testResults[0].tests) return null;

    const allTests = handleFilter(testResults.flatMap(report => report.tests || []));
    const totalTests = allTests.length;
    const failedTests = allTests.filter(test => test.status === 'fail').length;
    const passedTests = allTests.filter(test => test.status === 'pass').length;

    const totalDuration = allTests.reduce((total, test) => {
      const [hours, minutes, seconds, ms] = test.duration.split(':').map(str => parseInt(str));
      const durationInMs = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + ms;
      return total + durationInMs;
    }, 0);

    const errorTypes = allTests.reduce((acc, test) => {
      const failEvents = test.events.filter(event => event.status === 'Fail');
      failEvents.forEach(event => {
        const errorMessage = event.details;
        acc[errorMessage] = (acc[errorMessage] || 0) + 1;
      });
      return acc;
    }, {});

    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const failRate = totalTests > 0 ? (failedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      failedTests,
      passedTests,
      totalDuration,
      averageDuration,
      passRate,
      failRate,
      errorTypes,
    };
  };

  const metrics = processReportData() || {
    totalTests: 0,
    failedTests: 0,
    passedTests: 0,
    totalDuration: 0,
    averageDuration: 0,
    passRate: 0,
    failRate: 0,
    errorTypes: {}
  };

  // Pie chart data
  const pieChartData = {
    labels: ['Failed', 'Passed'],
    datasets: [
      {
        data: [metrics.failedTests, metrics.passedTests],
        backgroundColor: ['#ef4444', '#4ade80'],
        borderColor: ['#dc2626', '#22c55e'],
        borderWidth: 1,
      },
    ],
  };

  const testTypes = Array.from(new Set(testResults.flatMap(report => report.tests.map(test => test.name))));
  const months = Array.from(new Set(testResults.flatMap(report => report.tests.map(test => new Date(test.timestamp).getMonth() + 1))));

  return (
    <div className="test-analytics">
      <div className="analytics-header">
        <h2>Test Report Analytics</h2>

        <div className="filters">
          <select value={selectedTestType} onChange={(e) => setSelectedTestType(e.target.value)}>
            <option value="">All Test Types</option>
            {testTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month} value={month}>{`Month ${month}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper pie-chart">
          <h3>Pass/Fail Distribution</h3>
          <Pie data={pieChartData} />
        </div>

        <div className="chart-wrapper time-card">
          <h3>Test Results Summary</h3>
          <div className="card-content">
            <h4>Total Tests: {metrics.totalTests}</h4>
            <h4>Failed: {metrics.failedTests}</h4>
            <h4>Passed: {metrics.passedTests}</h4>
          </div>
        </div>

        <div className="chart-wrapper time-card">
          <h3>Success Rates</h3>
          <div className="card-content">
            <h4>Fail Rate: {metrics.failRate.toFixed(2)}%</h4>
            <h4>Pass Rate: {metrics.passRate.toFixed(2)}%</h4>
          </div>
        </div>

        <div className="chart-wrapper time-card">
          <h3>Timing Analysis</h3>
          <div className="card-content">
            <h4>Average Duration: {(metrics.averageDuration / 1000).toFixed(2)} seconds</h4>
            <h4>Total Duration: {(metrics.totalDuration / 1000).toFixed(2)} seconds</h4>
          </div>
        </div>

        {Object.entries(metrics.errorTypes).map(([error, count]) => (
          <div className="chart-wrapper time-card" key={error}>
            <h3>{error}</h3>
            <div className="card-content">
              <h4>{count} occurrences</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestAnalytics;
