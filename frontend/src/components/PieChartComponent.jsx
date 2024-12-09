// PieChartComponent.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChartComponent = ({ data }) => {
  const chartData = {
    labels: ['Underpasses', 'Bridges', 'Culverts'],
    datasets: [
      {
        data: data, // data passed as props
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], // Customize colors
        hoverBackgroundColor: ['#FF6F91', '#6BB9F0', '#FFDB6D'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChartComponent;
