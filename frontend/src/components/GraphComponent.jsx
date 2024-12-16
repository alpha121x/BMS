import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, // For Pie chart elements
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const GraphComponent = ({ data }) => {
  const chartData = {
    labels: ["Underpasses", "Bridges", "Culverts"], // Labels for the pie chart
    datasets: [
      {
        label: "Infrastructure Count",
        data: data, // Data passed as props
        backgroundColor: ["rgba(59, 130, 246, 0.7)", "rgba(34, 197, 94, 0.7)", "rgba(234, 179, 8, 0.7)"], // Different colors for the pie slices
        borderColor: ["rgba(37, 99, 235, 1)", "rgba(22, 163, 74, 1)", "rgba(234, 179, 8, 1)"], // Darker borders for each slice
        borderWidth: 1, // Border width for pie slices
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Infrastructure Count Pie Chart",
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
  };

  return <Pie data={chartData} options={options} />;
};

export default GraphComponent;
