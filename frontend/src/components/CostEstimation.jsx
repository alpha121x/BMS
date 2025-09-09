import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import CostMap from "./CostMap";
import { useNavigate } from "react-router-dom";

const CostEstimation = ({ districtId, structureType, bridgeName }) => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [bridgeCount, setBridgeCount] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage, districtId, structureType, bridgeName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/bms-cost?page=${currentPage}&limit=${itemsPerPage}&district=${districtId}&structureType=${structureType}&bridgeName=${bridgeName}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (Array.isArray(result.data)) {
        setBridgeScoreData(result.data);
        setBridgeCount(result.totalRecords);
        setTotalItems(parseInt(result.totalRecords, 10));
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeInfo = async (row) => {
    const bridgeId = row.uu_bms_id;
    try {
      const response = await fetch(
        `${BASE_URL}/api/bridgesNew?bridgeId=${bridgeId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bridge details");
      }

      const bridgeData = await response.json();

      if (bridgeData.success) {
        const bridgesArray = bridgeData.bridges;
        const bridge = bridgesArray[0];

        if (!bridge) {
          console.error("No bridge details found");
          return;
        }

        // ✅ Use React Router state instead of query string
        navigate("/BridgeInformation", {
          state: { bridgeData: bridge },
        });
      } else {
        console.error("Bridge details not found");
      }
    } catch (error) {
      console.error("Error fetching bridge details:", error);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bms-cost-export`);
      const { data } = await response.json();

      if (!data.length) {
        console.warn("No data available for CSV download.");
        return;
      }

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          Object.keys(data[0]).join(","),
          ...data.map((row) => Object.values(row).join(",")),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Bridge_Cost.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bms-cost-export`);
      const { data } = await response.json();

      if (!data.length) {
        console.warn("No data available for Excel download.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bridge Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Bridges_Cost.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const columns = [
    {
      name: "District",
      selector: (row) => row.district || "N/A",
      sortable: true,
    },
    {
      name: "Structure Type",
      selector: (row) => row.structure_type || "N/A",
      sortable: true,
    },
    {
      name: "Bridge Name",
      selector: (row) => row.bridge_name || "N/A",
      sortable: true,
    },
    {
      name: "Structure Length",
      selector: (row) => (row.bridge_length ? `${row.bridge_length} m` : "N/A"),
      sortable: true,
    },
    {
      name: "Cost (Rs.)",
      selector: (row) => row.cost_of_repair || "N/A",
      sortable: true,
      cell: (row) => (
        <span className="font-bold">{row.cost_of_repair || "N/A"}</span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => handleBridgeInfo(row)}
          className="px-2 py-1 text-white rounded"
          style={{ backgroundColor: "#3B9996" }}
        >
          Bridge Info
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        border: "1px solid #e5e7eb", // Tailwind's gray-200 for table border
      },
    },
    headCells: {
      style: {
        backgroundColor: "#005D7F",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
        border: "1px solid #e5e7eb", // Border for header cells
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        border: "1px solid #e5e7eb", // Border for table cells
      },
    },
    rows: {
      style: {
        "&:nth-child(odd)": {
          backgroundColor: "#f9fafb", // Tailwind's gray-50 for striped effect
        },
        "&:nth-child(even)": {
          backgroundColor: "#ffffff", // White background for even rows
        },
      },
    },
  };

  return (
    <div className="bg-white border p-4 rounded shadow-md">
      <div className="flex justify-start mb-2">
        <button
          onClick={() => setShowMap(false)}
          className={`px-4 py-2 mr-2 rounded ${
            showMap ? "bg-blue-200 text-black" : "bg-blue-800 text-white"
          }`}
        >
          Show Table
        </button>
        <button
          onClick={() => setShowMap(true)}
          className={`px-4 py-2 rounded ${
            showMap ? "bg-blue-800 text-white" : "bg-blue-200 text-black"
          }`}
        >
          Show Map
        </button>
      </div>
      <div
        className="flex items-center justify-between mb-2 p-2 rounded"
        style={{ background: "#005D7F" }}
      >
        <div className="flex items-center gap-4">
          <h5 className="text-white mb-0">Cost Estimation</h5>
          <h6 className="text-white mb-0">
            Records:{" "}
            <span className="bg-teal-500 text-white px-2 py-1 rounded">
              {bridgeCount || 0}
            </span>
          </h6>
        </div>
        <div className="flex gap-2">
          <button
            className="text-white flex items-center gap-1"
            onClick={handleDownloadCSV}
          >
            <FontAwesomeIcon icon={faFileCsv} />
            CSV
          </button>
          <button
            className="text-white flex items-center gap-1"
            onClick={handleDownloadExcel}
          >
            <FontAwesomeIcon icon={faFileExcel} />
            Excel
          </button>
        </div>
      </div>
      {loading ? (
        <div className="border-8 border-gray-200 border-t-8 border-t-blue-500 rounded-full w-20 h-20 animate-spin mx-auto my-10" />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : showMap ? (
        <CostMap districtId={districtId} />
      ) : (
        <DataTable
          columns={columns}
          data={bridgeScoreData}
          pagination
          paginationServer
          paginationTotalRows={totalItems}
          paginationPerPage={itemsPerPage}
          paginationRowsPerPageOptions={[10]}
          onChangePage={(page) => setCurrentPage(page)}
          customStyles={customStyles}
          noDataComponent={
            <div className="text-center p-4">No data available</div>
          }
        />
      )}
    </div>
  );
};

export default CostEstimation;
