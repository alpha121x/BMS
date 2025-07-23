import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';

const data = [
  { year: 'Year 1', schemes: 1072, cost: 6129 },
  { year: 'Year 2', schemes: 1106, cost: 6141 },
  { year: 'Year 3', schemes: 1104, cost: 6137 },
  { year: 'Year 4', schemes: 1124, cost: 6137 },
  { year: 'Year 5', schemes: 1119, cost: 6138 },
];

const FiveYearPlan = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    Highcharts.chart(chartRef.current, {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
      },
      title: {
        text: 'Number of Schemes Over 5 Years',
        style: { color: '#1f2937', fontSize: '20px' },
      },
      xAxis: {
        categories: data.map(item => item.year),
        title: { text: 'Year' },
        labels: { style: { color: '#374151' } },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Number of Schemes',
        },
        labels: { style: { color: '#374151' } },
      },
      tooltip: {
        shared: true,
        formatter() {
          const point = this.points[0];
          const cost = data[point.point.index].cost.toLocaleString();
          return `
            <b>${point.key}</b><br/>
            Schemes: <b>${point.y}</b><br/>
            Cost: <b>${cost} million PKR</b>
          `;
        },
      },
      series: [{
        name: 'Schemes',
        data: data.map(item => item.schemes),
        color: '#3B82F6',
      }],
      credits: {
        enabled: false,
      },
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-lg max-w-6xl mx-auto border border-gray-200">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">
        5-Year Development Plan
      </h2>

      {/* Table Section */}
      <div className="overflow-x-auto mb-14">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg">
              <th className="py-4 px-6 text-left">Year</th>
              <th className="py-4 px-6 text-center">Number of Schemes</th>
              <th className="py-4 px-6 text-center">Cost (Million Rupees)</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-md">
            {data.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition`}
              >
                <td className="py-3 px-6 font-medium">{item.year}</td>
                <td className="py-3 px-6 text-center font-bold text-blue-700">
                  {item.schemes.toLocaleString()}
                </td>
                <td className="py-3 px-6 text-center font-bold text-green-600">
                  {item.cost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div ref={chartRef} className="h-96" />
      </div>
    </div>
  );
};

export default FiveYearPlan;
