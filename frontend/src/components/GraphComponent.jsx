import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphComponent = ({ data }) => {
  const chartData = {
    labels: ["Underpasses", "Bridges", "Culverts"], // X-axis labels
    datasets: [
      {
        label: "Infrastructure Count",
        data: data, // Data passed as props
        backgroundColor: "rgba(59, 130, 246, 0.7)", // Blue color for bars with transparency
        borderColor: "rgba(37, 99, 235, 1)", // Darker blue border
        borderWidth: 1, // Bar border thickness
        borderRadius: 5, // Slight rounded edges
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "x", // Ensures bars are vertical
    plugins: {
      title: {
        display: true,
        text: "Infrastructure Count Graph",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Y-axis starts from 0
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default GraphComponent;
