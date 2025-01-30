import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ testResults }) => {
  // Aggregate test execution by date
  const executionCounts = testResults.reduce((acc, test) => {
    const date = new Date(test.date).toLocaleDateString(); // Group by date
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(executionCounts); // Dates
  const dataPoints = Object.values(executionCounts); // Counts

  const data = {
    labels, // X-axis: Dates
    datasets: [
      {
        label: 'Tests Executed',
        data: dataPoints,
        fill: false,
        borderColor: '#2563eb', // Blue Line
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow dynamic resizing
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Tests',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}> {/* Increase height */}
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
