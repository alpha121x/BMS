import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const MaintenancePlan = () => {
  const [bridges] = useState([
    { id: 1, name: "AAAAA Bridge", zone: "North", route: "Route 2", yearBuilt: 1979, length: 67.7, width: 4.4, type: "Deck slab bridge", material: "Concrete", location: "aaaaa Town", saltAffected: "No", currentInspection: 2017, rank: "I", nextInspection: 2022, nextRepair: "Under", cost2023: 220836, cost2024: 415840, cost2025: 3528939, cost2026: 3213013, cost2027: 2108718 },
    { id: 2, name: "BBBBBB Bridge", zone: "North", route: "Route 2", yearBuilt: 1979, length: 14.7, width: 9.0, type: "T Girders", material: "Concrete", location: "bbbbb Town", saltAffected: "No", currentInspection: 2017, rank: "I", nextInspection: 2022, nextRepair: "Under", cost2023: 220836, cost2024: 415840, cost2025: 3528939, cost2026: 3213013, cost2027: 2108718 },
    { id: 3, name: "CCCCCC Bridge", zone: "North", route: "Route 2", yearBuilt: 1979, length: 12.0, width: 8.2, type: "Steel(RC deck)", material: "Steel", location: "ccccc Town", saltAffected: "No", currentInspection: 2017, rank: "I", nextInspection: 2022, nextRepair: "Under", cost2023: 220836, cost2024: 415840, cost2025: 3528939, cost2026: 3213013, cost2027: 2108718 },
    { id: 4, name: "DDDDDD Bridge", zone: "North", route: "Route 2", yearBuilt: 1984, length: 18.9, width: 8.3, type: "T Girders", material: "Concrete", location: "ddddd Town", saltAffected: "No", currentInspection: 2019, rank: "I", nextInspection: 2024, nextRepair: "Under", cost2023: 220836, cost2024: 415840, cost2025: 3528939, cost2026: 3213013, cost2027: 2108718 },
    { id: 5, name: "EEEEE Bridge", zone: "North", route: "Route 9", yearBuilt: 1987, length: 13.4, width: 14.4, type: "BOX", material: "Concrete", location: "eeeee Town", saltAffected: "Yes", currentInspection: 2017, rank: "I", nextInspection: 2022, nextRepair: "Under", cost2023: 220836, cost2024: 415840, cost2025: 3528939, cost2026: 3213013, cost2027: 2108718 },
  ]);

  return (
    <>
    <Header />
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bridge Maintenance Plan</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">No</th>
            <th className="border p-2">Bridge Name</th>
            <th className="border p-2">Zone</th>
            <th className="border p-2">Route</th>
            <th className="border p-2">Year of Build</th>
            <th className="border p-2">Length</th>
            <th className="border p-2">Width</th>
            <th className="border p-2">Bridge Type</th>
            <th className="border p-2">Material of Superstructure</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Salt-affected Area</th>
            <th className="border p-2">Fiscal Year</th>
            <th className="border p-2">Rank</th>
            <th className="border p-2">Next Scheduled Inspection</th>
            <th className="border p-2">Next Scheduled Repair</th>
            <th className="border p-2">Cost 2023</th>
            <th className="border p-2">Cost 2024</th>
            <th className="border p-2">Cost 2025</th>
            <th className="border p-2">Cost 2026</th>
            <th className="border p-2">Cost 2027</th>
          </tr>
        </thead>
        <tbody>
          {bridges.map(bridge => (
            <tr key={bridge.id} className="hover:bg-gray-100">
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
              <td className="border p-2">{bridge.currentInspection}</td>
              <td className="border p-2">{bridge.rank}</td>
              <td className="border p-2">{bridge.nextInspection}</td>
              <td className="border p-2">{bridge.nextRepair}</td>
              <td className="border p-2">{bridge.cost2023}</td>
              <td className="border p-2">{bridge.cost2024}</td>
              <td className="border p-2">{bridge.cost2025}</td>
              <td className="border p-2">{bridge.cost2026}</td>
              <td className="border p-2">{bridge.cost2027}</td>
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