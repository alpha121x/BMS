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

const CheckingsGraph = () => {
  // Dummy data
  const dummyData = [23573]; // Single bar value

  const chartData = {
    labels: ["Checkings"], // Single x-axis label
    datasets: [
      {
        label: "Checkings Count",
        data: dummyData, // Single value
        backgroundColor: "rgba(59, 130, 246, 0.7)", // Blue color with transparency
        borderColor: "rgba(37, 99, 235, 1)", // Darker blue border
        borderWidth: 1, // Border thickness
        borderRadius: 5, // Rounded edges
        barThickness: 50, // Controls bar width
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "x", // Ensures a vertical bar
    plugins: {
      title: {
        display: true,
        text: "Checkings Count Graph", // Chart title
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
        beginAtZero: true, // Starts the Y-axis from 0
        ticks: {
          stepSize: 5000, // Step size of 5000
        },
        min: 5000, // Starts at 5000
        suggestedMax: 25000, // Suggest a maximum value for scaling
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

export default CheckingsGraph;
