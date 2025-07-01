import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const MaintenancePlan = () => {
  const [bridges] = useState([
    {
      id: 1,
      name: "AAAAA Bridge", zone: "North", route: "Route 2", yearBuilt: 1979,
      length: 67.7, width: 4.4, type: "Deck slab bridge", material: "Concrete",
      location: "aaaaa Town", saltAffected: "No", inspectionYear: 2017, rank: "I", nextInspection: 2022, nextRepair: "2023",
      cm2023: "Replacement", cost2023: 220836,
      cm2024: "Replacement", cost2024: 4158540,
      cm2025: "Replacement", cost2025: 3528939,
      cm2026: "Replacement", cost2026: 3213013,
      cm2027: "Inspection",  cost2027: 2108718,
    },
    {
      id: 2,
      name: "BBBBBB Bridge", zone: "North", route: "Route 2", yearBuilt: 1979,
      length: 14.7, width: 9.0, type: "T Girders", material: "Concrete",
      location: "bbbbb Town", saltAffected: "No", inspectionYear: 2017, rank: "I", nextInspection: 2022, nextRepair: "Under",
      cm2023: "Design + Inspection", cost2023: 6448,
      cm2024: "Repaint", cost2024: 56241,
      cm2025: "Inspection", cost2025: 1028,
      cm2026: "Inspection", cost2026: 700,
      cm2027: "Replacement", cost2027: 130000,
    },
    // Add more bridges here...
  ]);

  return (
    <>
      <Header />
      <div className="p-4 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Bridge Maintenance Plan</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th rowSpan="2" className="border p-2">No</th>
              <th rowSpan="2" className="border p-2">Bridge Name</th>
              <th rowSpan="2" className="border p-2">Zone</th>
              <th rowSpan="2" className="border p-2">Route</th>
              <th rowSpan="2" className="border p-2">Year of Build</th>
              <th rowSpan="2" className="border p-2">Length</th>
              <th rowSpan="2" className="border p-2">Width</th>
              <th rowSpan="2" className="border p-2">Bridge Type</th>
              <th rowSpan="2" className="border p-2">Material</th>
              <th rowSpan="2" className="border p-2">Location</th>
              <th rowSpan="2" className="border p-2">Salt-affected</th>
              <th colSpan="2" className="border p-2 text-center bg-orange-100">Current Inspection Result</th>
              <th rowSpan="2" className="border p-2">Next Scheduled Inspection</th>
              <th rowSpan="2" className="border p-2">Next Scheduled Repair</th>
              <th colSpan="2" className="border p-2 text-center bg-yellow-100">2023</th>
              <th colSpan="2" className="border p-2 text-center bg-yellow-100">2024</th>
              <th colSpan="2" className="border p-2 text-center bg-yellow-100">2025</th>
              <th colSpan="2" className="border p-2 text-center bg-yellow-100">2026</th>
              <th colSpan="2" className="border p-2 text-center bg-yellow-100">2027</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border p-2">Fiscal Year</th>
              <th className="border p-2">Rank</th>
              <th className="border p-2">Counter-measure</th>
              <th className="border p-2">Cost</th>
              <th className="border p-2">Counter-measure</th>
              <th className="border p-2">Cost</th>
              <th className="border p-2">Counter-measure</th>
              <th className="border p-2">Cost</th>
              <th className="border p-2">Counter-measure</th>
              <th className="border p-2">Cost</th>
              <th className="border p-2">Counter-measure</th>
              <th className="border p-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {bridges.map(bridge => (
              <tr key={bridge.id} className="hover:bg-gray-50">
                <td className="border p-2">{bridge.id}</td>
                <td className="border p-2">{bridge.name}</td>
                <td className="border p-2">{bridge.zone}</td>
                <td className="border p-2">{bridge.route}</td>
                <td className="border p-2">{bridge.yearBuilt}</td>
                <td className="border p-2">{bridge.length}</td>
                <td className="border p-2">{bridge.width}</td>
                <td className="border p-2">{bridge.type}</td>
                <td className="border p-2">{bridge.material}</td>
                <td className="border p-2">{bridge.location}</td>
                <td className="border p-2">{bridge.saltAffected}</td>
                <td className="border p-2">{bridge.inspectionYear}</td>
                <td className="border p-2">{bridge.rank}</td>
                <td className="border p-2">{bridge.nextInspection}</td>
                <td className="border p-2">{bridge.nextRepair}</td>
                <td className="border p-2">{bridge.cm2023}</td>
                <td className="border p-2">{bridge.cost2023.toLocaleString()}</td>
                <td className="border p-2">{bridge.cm2024}</td>
                <td className="border p-2">{bridge.cost2024.toLocaleString()}</td>
                <td className="border p-2">{bridge.cm2025}</td>
                <td className="border p-2">{bridge.cost2025.toLocaleString()}</td>
                <td className="border p-2">{bridge.cm2026}</td>
                <td className="border p-2">{bridge.cost2026.toLocaleString()}</td>
                <td className="border p-2">{bridge.cm2027}</td>
                <td className="border p-2">{bridge.cost2027.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default MaintenancePlan;
