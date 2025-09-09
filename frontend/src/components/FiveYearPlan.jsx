import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import DataTable from "react-data-table-component";
import { BASE_URL } from "./config";

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
  const [inspectionData, setInspectionData] = useState([]);
  const [planData, setPlanData] = useState([]);

 const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const addCommas = (x) => {
    if (!x || x === "N/A") return "N/A";
    const num = typeof x === "string" ? parseFloat(x) : x;
    return num.toLocaleString();
  };

  // Fetch inspection plan
  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/inspections-five-year-plan`);
        const result = await res.json();
        if (result.success) {
          const formatted = result.data.map((row) => {
            const currentDate = row.current_inspection_date
              ? new Date(row.current_inspection_date)
              : null;
            const nextDate = currentDate
              ? new Date(currentDate.setFullYear(currentDate.getFullYear() + 3))
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
    fetchInspectionData();
  }, []);

  // Fetch 5-year plan dynamically
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/bms-5year-development-plan`);
        const result = await res.json();
        if (result.success) {
          // Ensure numeric values
          const formatted = result.data.map((item) => ({
            ...item,
            scheme_count: Number(item.scheme_count),
            total_cost: Number(item.total_cost),
          }));
          setPlanData(formatted);
        }
      } catch (err) {
        console.error("Error fetching 5-year plan data:", err);
      }
    };
    fetchPlanData();
  }, []);

  // Render Highcharts dynamically
  useEffect(() => {
    if (chartRef.current && planData.length) {
      Highcharts.chart(chartRef.current, {
        chart: { type: "column", backgroundColor: "transparent" },
        title: {
          text: "Number of Schemes Over 5 Years",
          style: { color: "#1f2937", fontSize: "20px" },
        },
        xAxis: {
          categories: planData.map((item) => item.year_label),
          title: { text: "Year" },
          labels: { style: { color: "#374151" } },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Schemes" },
          labels: { style: { color: "#374151" } },
        },
        tooltip: {
          shared: true,
          formatter() {
            const point = this.points[0];
            const cost = addCommas(planData[point.point.index].total_cost);
            return `<b>${point.key}</b><br/>Schemes: <b>${point.y}</b><br/>Cost: <b>${cost} PKR</b>`;
          },
        },
        series: [
          {
            name: "Schemes",
            data: planData.map((item) => item.scheme_count),
            color: "#3B82F6",
          },
        ],
        credits: { enabled: false },
      });
    }
  }, [planData]);

  // Columns for inspection table
  const columns = [
    { name: "Bridge Name", selector: (row) => row.bridge_name, sortable: true },
    { name: "Damage Level", selector: (row) => row.damage_level, sortable: true },
    { name: "Current Inspection", selector: (row) => row.current_inspection, sortable: true },
    { name: "Next Inspection", selector: (row) => row.next_inspection, sortable: true },
  ];

  return (
    <div className="p-6 bg-gray-50 rounded-md mt-3 shadow-lg w-75 mx-auto border border-gray-200">
      {/* Inspection Plan Table */}
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

      {/* 5-Year Development Plan Table */}
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">
        5-Year Development Plan
      </h2>
      <div className="overflow-x-auto mb-14">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg">
              <th className="py-4 px-6 text-left">Year</th>
              <th className="py-4 px-6 text-center">Number of Schemes</th>
              <th className="py-4 px-6 text-center">Cost (Rupees)</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-md">
            {planData.map((item, index) => (
              <tr key={index} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition`}>
                <td className="py-3 px-6 font-medium">{item.year_label}</td>
                <td className="py-3 px-6 text-center font-bold text-blue-700">
                  {item.scheme_count.toLocaleString()}
                </td>
                <td className="py-3 px-6 text-center font-bold text-green-600">
                  {item.total_cost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5-Year Plan Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div ref={chartRef} className="h-96" />
      </div>
    </div>
  );
};

export default FiveYearPlan;
