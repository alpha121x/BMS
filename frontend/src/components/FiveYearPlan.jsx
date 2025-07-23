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
    <div className="p-6 bg-gray-100 rounded-xl shadow-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">5-Year Development Plan</h2>

      {/* Table Section */}
      <div className="overflow-x-auto mb-12">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <tr>
              <th className="py-3 px-5 text-left text-lg">Year</th>
              <th className="py-3 px-5 text-center text-lg">Number of Schemes</th>
              <th className="py-3 px-5 text-center text-lg">Cost (Million Rupees)</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-md">
            {data.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50' : 'bg-white hover:bg-blue-50'}
              >
                <td className="py-3 px-5">{item.year}</td>
                <td className="py-3 px-5 text-center font-medium text-blue-700">{item.schemes.toLocaleString()}</td>
                <td className="py-3 px-5 text-center font-medium text-green-700">{item.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart Section */}
      <div className="w-full h-96">
        <div ref={chartRef} style={{ height: '100%' }} />
      </div>
    </div>
  );
};

export default FiveYearPlan;
