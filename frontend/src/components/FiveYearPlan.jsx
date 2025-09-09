import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import DataTable from "react-data-table-component";
import { BASE_URL } from "./config"; // adjust path if needed

const data = [
  { year: "Year 1", schemes: 1072, cost: 6129, status: "In Progress", completed: 850 },
  { year: "Year 2", schemes: 1106, cost: 6141, status: "Completed", completed: 1106 },
  { year: "Year 3", schemes: 1104, cost: 6137, status: "In Progress", completed: 900 },
  { year: "Year 4", schemes: 1124, cost: 6137, status: "Planned", completed: 0 },
  { year: "Year 5", schemes: 1119, cost: 6138, status: "Planned", completed: 0 },
];

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#005D7F",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "bold",
      border: "1px solid #dee2e6",
    },
  },
  cells: { style: { fontSize: "13px", border: "1px solid #dee2e6" } },
  rows: { style: { "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" } } },
  table: { style: { width: "100%", border: "1px solid #dee2e6" } },
  pagination: { style: { borderTop: "1px solid #dee2e6", padding: "10px", display: "flex", justifyContent: "center" } },
};

const FiveYearPlan = () => {
  const chartRef = useRef(null);
  const [inspectionData, setInspectionData] = useState([]); // ✅ API data

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// 🔹 Fetch inspection plan data
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/inspections-five-year-plan`);
      const result = await res.json();
      if (result.success) {
        const formatted = result.data.map((row) => {
          const currentDate = row.current_inspection_date
            ? new Date(row.current_inspection_date)
            : null;
          const nextDate = currentDate
            ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 5))
            : null;

          return {
            bridge_name: row.bridge_name,
            damage_level: row.DamageLevel || row.DamageLevelID,
            current_inspection: formatDate(row.current_inspection_date),
            next_inspection: nextDate ? formatDate(nextDate) : "Planned",
          };
        });
        setInspectionData(formatted);
      }
    } catch (err) {
      console.error("Error fetching inspection data:", err);
    }
  };
  fetchData();
}, []);

// 🔹 Columns
const columns = [
  { name: "Bridge Name", selector: (row) => row.bridge_name, sortable: true },
  { name: "Damage Level", selector: (row) => row.damage_level, sortable: true },
  { name: "Current Inspection", selector: (row) => row.current_inspection, sortable: true },
  { name: "Next Inspection", selector: (row) => row.next_inspection, sortable: true },
];

  return (
    <div className="p-6 bg-gray-50 rounded-md mt-3 shadow-lg w-75 mx-auto border border-gray-200">
      {/* 🔹 API DataTable */}
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">
        Bridge Inspection Plan
      </h2>
      <div className="mb-14">
        <DataTable
          columns={columns}
          data={inspectionData}
          customStyles={customStyles}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent="No data available"
        />
      </div>

      {/* 🔹 Static Development Plan */}
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">
        5-Year Development Plan
      </h2>
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
              <tr key={index} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}>
                <td className="py-3 px-6 font-medium">{item.year}</td>
                <td className="py-3 px-6 text-center font-bold text-blue-700">{item.schemes.toLocaleString()}</td>
                <td className="py-3 px-6 text-center font-bold text-green-600">{item.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div ref={chartRef} className="h-96" />
      </div>
    </div>
  );
};

export default FiveYearPlan;
