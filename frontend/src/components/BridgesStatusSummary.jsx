import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { BASE_URL } from "./config";

// Custom styles for the DataTable appearance
const customStyles = {
  table: {
    style: {
      width: "100%",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f5f5f5",
      borderBottom: "1px solid #ddd",
    },
  },
  headCells: {
    style: {
      padding: "4px",
      fontSize: "18px",
      fontWeight: "bold",
      border: "1px solid #ddd",
    },
  },
  rows: {
    style: {
      fontSize: "18px",
      borderBottom: "1px solid #ddd",
    },
  },
  
  cells: {
    style: {
      padding: "4px",
      border: "1px solid #ddd",
      "&:nth-child(1)": { textAlign: "center" }, // Center "No" column
      "&:nth-child(2), &:nth-child(3)": { textAlign: "left" }, // Reference No, Bridge Name
      "&:nth-child(4), &:nth-child(5), &:nth-child(6)": { textAlign: "center" }, // Inspections
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #ddd",
      padding: "8px",
      fontSize: "14px",
    },
  },
};

const BridgesStatusSummary = ({ api_endpoint }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/api/${api_endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Map API data to DataTable format
        const formattedData = result
          .map((item) => ({
            referenceNo: item.uu_bms_id,
            bridgeName: item.bridge_name,
            totalInspections: item.total_inspections,
            pendingInspections: item.pending_inspections,
            approvedInspections: item.approved_insp,
          }))
          .sort((a, b) => a.referenceNo.localeCompare(b.referenceNo));
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api_endpoint]);

  // Filter data based on search term
  useEffect(() => {
    const filtered = data.filter((row) =>
      [row.bridgeName, row.totalInspections].some((field) =>
        field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Define columns for the DataTable
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      sortable: false,
      center: true,
      width: "60px",
    },
    {
      name: "Reference No",
      selector: (row) => row.referenceNo,
      sortable: true,
      center: false,
    },
    {
      name: "Bridge Name",
      selector: (row) => row.bridgeName,
      sortable: true,
      center: false,
    },
    {
      name: "Total Inspections",
      selector: (row) => row.totalInspections,
      sortable: true,
      center: true,
      cell: (row) => (
        <span style={{ color: "blue" }}>{row.totalInspections}</span>
      ),
    },
    {
      name: "Pending Inspections",
      selector: (row) => row.pendingInspections,
      sortable: true,
      center: true,
      cell: (row) => (
        <span style={{ color: "orange" }}>{row.pendingInspections}</span>
      ),
    },
    {
      name: "Approved Inspections",
      selector: (row) => row.approvedInspections,
      sortable: true,
      center: true,
      cell: (row) => (
        <span style={{ color: "green" }}>{row.approvedInspections}</span>
      ),
    },
  ];

  return (
    <div
      className="card p-0 rounded-lg text-black"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
      <div className="card-header p-2" style={{ background: "#005D7F" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between text-white">
            <h5 className="mb-0 me-5">
              Bridges Status Summary{" "}
              <span className="text-sm bg-white text-[#005D7F] px-2 py-1 rounded ml-2">
                Total: {filteredData.length}
              </span>
            </h5>
          </div>
        </div>
      </div>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by Bridge Name, or Total Inspections..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005D7F]"
        />
      </div>
      <div className="card-body p-0 pb-2">
        {loading ? (
          <div className="p-4 text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">Error: {error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            striped
            responsive={true}
            noDataComponent="No bridges found"
          />
        )}
      </div>
    </div>
  );
};

export default BridgesStatusSummary;