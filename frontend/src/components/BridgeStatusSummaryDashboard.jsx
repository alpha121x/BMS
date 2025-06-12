import { useState, useEffect } from "react";
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
      "&:nth-child(1), &:nth-child(2)": { textAlign: "left" },
      "&:nth-child(3), &:nth-child(4)": { textAlign: "center" },
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

const BridgesStatusSummary = ({
  api_endpoint,
  districtId,
  bridgeName,
  structureType,
}) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount or when props change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]); // Reset data on new fetch
      setFilteredData([]); // Reset filteredData on new fetch
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (districtId) params.append("districtId", districtId);
        if (bridgeName) params.append("bridgeName", bridgeName);
        if (structureType) params.append("structureType", structureType);

        const response = await fetch(
          `${BASE_URL}/api/${api_endpoint}?${params.toString()}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Handle JSON parse errors
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }
        const result = await response.json();

        // Map API data to DataTable format
        const formattedData = result
          .map((item) => ({
            referenceNo: item.uu_bms_id,
            bridgeName: item.bridge_name,
            totalInspections: item.total_inspections,
            conInspections: item.con_approved,
            ramsInspections: item.ram_approved,
          }))
          .sort((a, b) => a.referenceNo.localeCompare(b.referenceNo));
        setData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api_endpoint, districtId, bridgeName, structureType]);

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
      name: "Consultant Approved Inspections",
      selector: (row) => row.conInspections,
      sortable: true,
      center: true,
      cell: (row) => (
        <span style={{ color: "green" }}>{row.conInspections}</span>
      ),
    },
    {
      name: "Rams Approved Inspections",
      selector: (row) => row.ramsInspections,
      sortable: true,
      center: true,
      cell: (row) => (
        <span style={{ color: "green" }}>{row.ramsInspections}</span>
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
              {data.length > 0 && !loading && !error && (
                <span className="text-sm bg-white text-[#005D7F] px-2 py-1 rounded ml-2">
                  Total: {filteredData.length}
                </span>
              )}
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
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : data.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            No bridge inspection records found.
          </div>
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
