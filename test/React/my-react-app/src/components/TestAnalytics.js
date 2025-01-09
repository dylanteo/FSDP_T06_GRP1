import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TestAnalytics = ({ testResults }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filteredResults, setFilteredResults] = useState(testResults);

  // Get unique months from test results
  const getUniqueMonths = () => {
    const months = testResults.map(test => {
      const date = new Date(test.endTime);  // Parsing the date correctly
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    });
    return [...new Set(months)];
  };

  // Filter results by selected month
  useEffect(() => {
    if (selectedMonth === 'all') {
      setFilteredResults(testResults);
    } else {
      const filtered = testResults.filter(test => {
        const date = new Date(test.endTime); // Ensure correct parsing of the timestamp
        const testMonth = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        return testMonth === selectedMonth;
      });
      setFilteredResults(filtered);
    }
  }, [selectedMonth, testResults]);

  // Calculate metrics
  const totalTests = filteredResults.length;
  const passedTests = filteredResults.filter(result => result.status === 'Success').length;
  const failedTests = totalTests - passedTests;
  const passPercentage = totalTests ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
  const failPercentage = totalTests ? ((failedTests / totalTests) * 100).toFixed(2) : 0;

  // Calculate average time taken (assuming timeTaken is in seconds)
  const averageTimeTaken = filteredResults.length
    ? (filteredResults.reduce((total, test) => total + test.timeTaken, 0) / filteredResults.length).toFixed(2)
    : 0;
    //console.log('Number of tests:', filteredResults.length);

  const totalTimeTaken = filteredResults.length
    ? filteredResults.reduce((total, test) => total + test.timeTaken, 0)
    :0;

  const averageTimeTakenInSeconds = (averageTimeTaken / 1000).toFixed(2);
  // Pie chart data
  const pieChartData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [passedTests, failedTests],
        backgroundColor: ['#4ade80', '#ef4444'],
        borderColor: ['#22c55e', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data - Tests by month
  const getMonthlyData = () => {
    const monthlyStats = {};
    testResults.forEach(test => {
      const date = new Date(test.timestamp);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { passed: 0, failed: 0 };
      }
      test.status === 'Success'
        ? monthlyStats[month].passed++
        : monthlyStats[month].failed++;
    });
    return monthlyStats;
  };

  const monthlyData = getMonthlyData();
  const barChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Passed Tests',
        data: Object.values(monthlyData).map(stat => stat.passed),
        backgroundColor: '#4ade80',
      },
      {
        label: 'Failed Tests',
        data: Object.values(monthlyData).map(stat => stat.failed),
        backgroundColor: '#ef4444',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Test Results by Month',
      },
    },
  };

  return (
    <div className="test-analytics">
      <div className="analytics-header">
        <h2>Test Analytics</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-filter"
        >
          <option value="all">All Time</option>
          {getUniqueMonths().map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
{/*
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
*/}
       <div className="charts-container">
        <div className="chart-wrapper pie-chart">
          <h3>Pass/Fail Distribution</h3>
          <Pie data={pieChartData} />
        </div>

        {/* Card for Average Time Taken */}
        <div className="chart-wrapper time-card">
          <h3>Average Time Taken</h3>
          <div className="card-content">
            <h4>{averageTimeTakenInSeconds} seconds</h4>
          </div>
        </div>

        <div className="chart-wrapper time-card">
          <h3>Total Test</h3>
          <div className="card-content">
             <h4>{totalTests} </h4>
          </div>
        </div>

        <div className="chart-wrapper time-card passed">
          <h3>Test Passed</h3>
          <div className="card-content">
             <h4>{passedTests} </h4>
          </div>
        </div>

        <div className="chart-wrapper time-card failed">
          <h3>Test failed</h3>
          <div className="card-content">
             <h4>{failedTests} </h4>
          </div>
        </div>
        <div className="chart-wrapper time-card passed">
          <h3>Pass Percentage</h3>
          <div className="card-content">
             <h4>{passPercentage}%</h4>
          </div>
        </div>
        <div className="chart-wrapper time-card failed">
          <h3>Fail Percentage</h3>
          <div className="card-content">
             <h4>{failPercentage}%</h4>
          </div>
        </div>
        <div className="chart-wrapper time-card">
          <h3>Total Execution Time for All Tests</h3>
          <div className="card-content">
            <h4>{(totalTimeTaken / 3600000).toFixed(2)} hours</h4>
            <h4>{(totalTimeTaken / 60000).toFixed(2)} minutes</h4>
            <h4>{(totalTimeTaken / 1000).toFixed(2)} seconds</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalytics;
//        <div className="chart-wrapper bar-chart">
//          <Bar data={barChartData} options={barChartOptions} />
//        </div>
