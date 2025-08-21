import React from "react";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Define custom styles to match the original table's look
const customStyles = {
  table: {
    style: {
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f3f4f6",
      fontWeight: "600",
      fontSize: "0.875rem",
      borderBottom: "1px solid #e5e7eb",
    },
  },
  headCells: {
    style: {
      padding: "0.5rem 1rem",
      textAlign: "left",
    },
  },
  cells: {
    style: {
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      borderBottom: "1px solid #e5e7eb",
    },
  },
  rows: {
    style: {
      "&:hover": {
        backgroundColor: "#f9fafb",
      },
    },
  },
};

// Function to convert data to CSV and trigger download
const exportToCSV = (data, filename = "structures_data.csv") => {
  const headers = [
    "#",
    "Bridge Name",
    "District",
    "Structure Type",
    "Construction Type",
    "Age (Years)",
    "Structure Length (m)",
  ];

  const rows = data.map((row, index) => [
    index + 1,
    `"${row.bridge_name || ""}"`,
    row.district || "",
    row.structure_type || "",
    row.construction_type || "",
    row.age || "—",
    row.bridge_length !== null && row.bridge_length !== undefined
      ? parseFloat(row.bridge_length).toFixed(2)
      : "—",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const StructuresTable = ({ data, loading }) => {
  const navigate = useNavigate();
  const userToken = JSON.parse(sessionStorage.getItem("userEvaluation"));
  const user_type = userToken?.usertype;
  console.log("User Type:", user_type);

  const handleBridgeInfo = (bridgeData) => {
    // Conditional route based on user_type
    switch (user_type) {
      case "consultant":
        navigate("/BridgeInformationCon", { state: { bridgeData } });
        break;

      case "rams":
        navigate("/BridgeInformationRams", { state: { bridgeData } });
        break;

      case "evaluator":
        navigate("/BridgeInformationEval", { state: { bridgeData } });
        break;
    }
  };

  // ✅ Columns must be inside the component so handleBridgeInfo is in scope
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
    },
    {
      name: "Bridge Name",
      selector: (row) => row.bridge_name,
      sortable: true,
      cell: (row) => <span className="font-medium">{row.bridge_name}</span>,
    },
    {
      name: "District",
      selector: (row) => row.district,
      sortable: true,
    },
    {
      name: "Structure Type",
      selector: (row) => row.structure_type,
      sortable: true,
    },
    {
      name: "Construction Type",
      selector: (row) => row.construction_type,
      sortable: true,
    },
    {
      name: "Age (Years)",
      selector: (row) => row.age || "—",
      sortable: true,
    },
    {
      name: "Structure Length (m)",
      selector: (row) =>
        row.bridge_length !== null && row.bridge_length !== undefined
          ? parseFloat(row.bridge_length).toFixed(2)
          : "—",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleBridgeInfo(row)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none"
        >
         👁 Bridge Info
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-gray-600 text-center py-4">No structures found.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => exportToCSV(data)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Export to CSV
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50]}
        highlightOnHover
        pointerOnHover
        responsive
      />
    </div>
  );
};

export default StructuresTable;
