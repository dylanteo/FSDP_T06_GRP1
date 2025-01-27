import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const DonutChart = ({ passed, failed, notExecuted }) => {
  const data = {
    labels: ['Passed', 'Failed', 'Not Executed'],
    datasets: [
      {
        data: [passed, failed, notExecuted],
        backgroundColor: ['#22c55e', '#ef4444', '#9ca3af'], // Green, Red, Gray
        hoverBackgroundColor: ['#16a34a', '#dc2626', '#6b7280'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow dynamic resizing
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}> {/* Increase height */}
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DonutChart;
