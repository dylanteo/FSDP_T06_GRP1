import React, { useState } from 'react';
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
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  if (!testResults || !testResults.length || !testResults[0].tests) {
    return <div>No data available for statistics.</div>;
  }

  // Get all tests and filter based on selection
  const allTests = Array.isArray(testResults) ? testResults.flatMap(report => report.tests || []) : [];

  // Get unique test types
  const testTypes = ['all', ...new Set(allTests.map(test => test.name.split(' ')[0]))];

  // Get unique months
  const months = ['all', ...new Set(testResults.map(result => {
      const date = new Date(result.date);  // Parse the date string from the result
      return date.toLocaleString('default', { month: 'short' });  // Get month name
    }))].sort();
//    console.log('All months', months)
  // get unique years
  const years = ['all', ...new Set(testResults.map(result => {
      const date = new Date(result.date);  // Parse the date string from the result
      return date.toLocaleString('default', { year: 'numeric' });  // Get month name
    }))].sort();


function getTestsByMonth(month) {
  // Filter groups where the date contains the specified month
  const filteredGroups = testResults.filter(group => {
    const groupMonth = new Date(group.date).toLocaleString("en-US", { month: "short" });
    return groupMonth.toLowerCase() === month.toLowerCase();
  });

  // Flatten and collect all tests from the filtered groups
  return filteredGroups.flatMap(group => group.tests);
}

function getTestsByYear(year) {
  // Filter groups where the date contains the specified year
  const filteredGroups = testResults.filter(group => {
    const groupYear = new Date(group.date).getFullYear(); // Extract year
    return groupYear === year;
  });

  // Flatten and collect all tests from the filtered groups
  return filteredGroups.flatMap(group => group.tests);
}

// Usage example
const year = 2025; // Specify the year
const testsForYear = getTestsByYear(year);

console.log("year",testsForYear);

// Usage example
const month = "Dec"; // Specify the month
const testsForMonth = getTestsByMonth(month);
console.log("Month",testsForMonth);


//console.log(testsForMonth);
//testResults.forEach(result => {
//  console.log(result.date);
//});

  // Filter tests based on selections
const filteredTests = (() => {
  let tests = allTests;

  // Filter by year if selectedYear is not 'all'
  if (selectedYear !== 'all') {
    const yearTests = getTestsByYear(parseInt(selectedYear));
    tests = tests.filter(test => yearTests.includes(test));
  }

  // Filter by month if selectedMonth is not 'all'
  if (selectedMonth !== 'all') {
    const monthTests = getTestsByMonth(selectedMonth);
    tests = tests.filter(test => monthTests.includes(test));
  }

  // Further filter by test type
  if (selectedTestType !== 'all') {
    tests = tests.filter(test => test.name.split(' ')[0] === selectedTestType);
  }

  return tests;
})();

//console.log("Filtered Tests:", filteredTests);
  const passedTests = filteredTests.filter(test => test.status === 'pass');
  const failedTests = filteredTests.filter(test => test.status === 'fail');

  // **1. Average Test Duration (Line Chart)**
  const averageDurationPerBatch = [];
  const batchSize = 5;
  for (let i = 0; i < filteredTests.length; i += batchSize) {
    const batch = filteredTests.slice(i, i + batchSize);
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
  const errorCounts = filteredTests.reduce((acc, test) => {
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
  filteredTests.forEach(test => {
    const category = test.name.split(' ')[0];
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

  filteredTests.forEach(test => {
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
      <div className="filters-container p-4 bg-gray-50 rounded-lg mb-6">
        <div className="flex gap-4">
          <select
            className="p-2 border rounded-md"
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
          >
            {testTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Test Types' : type}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded-md"
            value={selectedMonth}
            onChange={(e) => {
                setSelectedMonth(e.target.value);
//                console.log('Selected Month:', e.target.value); // Log the selected month
              }}
          >
            {months.map(month => (
              <option key={month} value={month}>
                {month === 'all' ? 'All Months' : ` ${month}`}
              </option>
            ))}
          </select>
          <select
                      className="p-2 border rounded-md"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year === 'all' ? 'All Years' : year}
                        </option>
                      ))}
                    </select>
        </div>
      </div>

      <h2>Test Case Detailed Statistics</h2>
            {/*
      <div className="summary-stats p-4 mb-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Current Filter Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Tests</p>
            <p className="text-xl font-semibold">{filteredTests.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Passed</p>
            <p className="text-xl font-semibold text-green-600">{passedTests.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-xl font-semibold text-red-600">{failedTests.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pass Rate</p>
            <p className="text-xl font-semibold">
              {filteredTests.length > 0
                ? ((passedTests.length / filteredTests.length) * 100).toFixed(1) + '%'
                : '0%'}
            </p>
          </div>
        </div>
      </div>
*/}
      <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
          <h3>Pass/Fail Distribution</h3>
          <Pie data={pieChartData} />
        </div>

        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
          <h3>Average Test Duration (seconds)</h3>
          <Line data={averageDurationData} />
        </div>

        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
          <h3>Error Type Distribution</h3>
          <Doughnut data={errorTypeData} />
        </div>

        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
          <h3>Test Case Category Performance</h3>
          <Bar data={categoryChartData} />
        </div>

        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
          <h3>Top Failing Test Cases</h3>
          {Object.keys(failureCounts).length > 0 ? (
            <Bar data={topFailingTestsChartData} />
          ) : (
            <p>No failed test cases to display.</p>
          )}
        </div>

        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
          <h3>Execution Time Distribution</h3>
          <Bar data={durationChartData} />
        </div>
      </div>
    </div>
  );
};

export default TestCaseStatistics;