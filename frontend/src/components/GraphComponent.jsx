// GraphComponent.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraphComponent = ({ data }) => {
  const chartData = {
    labels: ['Underpasses', 'Bridges', 'Culverts'], // Categories for the infrastructure graph
    datasets: [
      {
        label: 'Infrastructure Count',
        data: data, // Data passed as props, representing the count of each infrastructure type
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light color for bars
        borderColor: 'rgba(75, 192, 192, 1)', // Darker color for the borders
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Infrastructure Count', // Title of the graph
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensure the Y-axis starts at 0
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default GraphComponent;
