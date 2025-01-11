import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const TestCaseStatistics = ({ testResults }) => {
  if (!testResults || !testResults.length || !testResults[0].tests) {
    return <div>No data available for statistics.</div>;
  }

  const allTests = Array.isArray(testResults) ? testResults.flatMap(report => report.tests || []) : [];
  const passedTests = allTests.filter(test => test.status === 'pass');
  const failedTests = allTests.filter(test => test.status === 'fail');

  const totalTests = allTests.length;

  // **1. Average Test Duration (Line Chart)**
  const averageDurationPerBatch = [];
  const batchSize = 5;
  for (let i = 0; i < allTests.length; i += batchSize) {
    const batch = allTests.slice(i, i + batchSize);
    if (batch.length === 0) continue;
    const avgDuration = batch.reduce((sum, test) => {
      const [hours, minutes, seconds, ms] = test.duration.split(':').map(Number);
      return sum + hours * 3600 + minutes * 60 + seconds + ms / 1000;
    }, 0) / batch.length;
    averageDurationPerBatch.push(avgDuration);
  }

  const averageDurationData = {
    labels: averageDurationPerBatch.map((_, index) => `Batch ${index + 1}`),
    datasets: [
      {
        label: 'Average Test Duration (seconds)',
        data: averageDurationPerBatch,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.2,
      },
    ],
  };

  // **2. Pass/Fail Distribution (Pie Chart)**
  const pieChartData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        data: [passedTests.length, failedTests.length],
        backgroundColor: ['#4ade80', '#ef4444'],
      },
    ],
  };

  // **3. Error Type Distribution (Doughnut Chart)**
  const errorCounts = allTests.reduce((acc, test) => {
    const failEvents = test.events.filter(event => event.status === 'Fail');
    failEvents.forEach(event => {
      const errorMessage = event.details || 'Unknown Error';
      acc[errorMessage] = (acc[errorMessage] || 0) + 1;
    });
    return acc;
  }, {});

  const errorTypeData = {
    labels: Object.keys(errorCounts),
    datasets: [
      {
        label: 'Error Occurrences',
        data: Object.values(errorCounts),
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
      },
    ],
  };

  // **4. Test Case Category Performance (Bar Chart)**
  const categoryPerformance = {};
  allTests.forEach(test => {
    const category = test.name.split(' ')[0]; // Assume the first word in the name represents the category
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { pass: 0, fail: 0 };
    }
    if (test.status === 'pass') {
      categoryPerformance[category].pass += 1;
    } else {
      categoryPerformance[category].fail += 1;
    }
  });

  const categoryChartData = {
    labels: Object.keys(categoryPerformance),
    datasets: [
      {
        label: 'Passed',
        data: Object.values(categoryPerformance).map(cat => cat.pass),
        backgroundColor: '#4ade80',
      },
      {
        label: 'Failed',
        data: Object.values(categoryPerformance).map(cat => cat.fail),
        backgroundColor: '#ef4444',
      },
    ],
  };

  // **5. Top Failing Test Cases (Bar Chart)**
  const failureCounts = failedTests.length
    ? failedTests.reduce((acc, test) => {
        acc[test.name] = (acc[test.name] || 0) + 1;
        return acc;
      }, {})
    : {};

  const topFailingTestsChartData = {
    labels: Object.keys(failureCounts),
    datasets: [
      {
        label: 'Failures',
        data: Object.values(failureCounts),
        backgroundColor: '#ef4444',
      },
    ],
  };

  // **6. Execution Time Distribution (Histogram)**
  const durationBins = [0, 5, 10, 15, 20, 30, 60];
  const durationDistribution = Array(durationBins.length).fill(0);

  allTests.forEach(test => {
    const [hours, minutes, seconds] = test.duration.split(':').map(Number);
    const durationInSeconds = hours * 3600 + minutes * 60 + seconds;

    for (let i = 0; i < durationBins.length; i++) {
      if (durationInSeconds <= durationBins[i]) {
        durationDistribution[i] += 1;
        break;
      }
    }
  });

  const durationChartData = {
    labels: durationBins.map(bin => `${bin}s or less`),
    datasets: [
      {
        label: 'Number of Tests',
        data: durationDistribution,
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <div className="test-case-statistics">
      <h2>Test Case Detailed Statistics</h2>
      <div className="charts-container">
        {/* Pass/Fail Distribution */}
        <div className="chart-wrapper">
          <h3>Pass/Fail Distribution</h3>
          <Pie data={pieChartData} />
        </div>

        {/* Average Test Duration */}
        <div className="chart-wrapper">
          <h3>Average Test Duration (seconds)</h3>
          <Line data={averageDurationData} />
        </div>

        {/* Error Type Distribution */}
        <div className="chart-wrapper">
          <h3>Error Type Distribution</h3>
          <Doughnut data={errorTypeData} />
        </div>

        {/* Test Case Category Performance */}
        <div className="chart-wrapper">
          <h3>Test Case Category Performance</h3>
          <Bar data={categoryChartData} />
        </div>

        {/* Top Failing Test Cases */}
        <div className="chart-wrapper">
          <h3>Top Failing Test Cases</h3>
          {Object.keys(failureCounts).length > 0 ? (
            <Bar data={topFailingTestsChartData} />
          ) : (
            <p>No failed test cases to display.</p>
          )}
        </div>

        {/* Execution Time Distribution */}
        <div className="chart-wrapper">
          <h3>Execution Time Distribution</h3>
          <Bar data={durationChartData} />
        </div>
      </div>
    </div>
  );
};

export default TestCaseStatistics;
