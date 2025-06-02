import React from "react";
import DataTable from "react-data-table-component";

// Custom styles for the DataTable appearance
const customStyles = {
  table: {
    style: {
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0,0,0,0)",
      margin: "0 auto", // Center the table
      width: "100%",
      border: "separate",
      borderSpacing: "0",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#1f2937", // Darker gray for contrast
      borderBottom: "2px solid #d1d5db",
      fontSize: "13px",
      fontWeight: "600", // Bolder header text
      color: "#ffffff", // White text for readability
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  },
  headCells: {
    style: {
      padding: "12px 16px",
      justifyContent: "center", // Center header text
      "&:first-child": {
        borderTopLeftRadius: "8px",
      },
      "&:last-child": {
        borderTopRightRadius: "8px",
      },
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      color: "#374151",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      "&:nth-child(even)": {
        backgroundColor: "#f9fafb",
      },
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    },
  },
  cells: {
    style: {
      padding: "12px 16px",
      // Align text based on content type
      "&:nth-child(1), &:nth-child(2)": {
        // Reference No, Bridge Name
        textAlign: "left",
      },
      "&:nth-child(3), &:nth-child(4)": {
        // Total Inspections, Reviewed Inspections
        textAlign: "center",
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: "#ffffff",
      borderTop: "1px solid #e5e7eb",
      padding: "12px",
      fontSize: "14px",
      color: "#374151",
    },
  },
};

const BridgesStatusSummary = ({ data = [] }) => {
  // Sample data if none provided
  const defaultData = [
    {
      referenceNo: "REF001",
      bridgeName: "River Cross Bridge",
      totalInspections: 12,
      reviewedInspections: 8,
    },
    {
      referenceNo: "REF002",
      bridgeName: "Valley Span",
      totalInspections: 15,
      reviewedInspections: 10,
    },
    {
      referenceNo: "REF003",
      bridgeName: "City Link Bridge",
      totalInspections: 9,
      reviewedInspections: 7,
    },
  ];

  // Use provided data or fallback to default data
  const bridges = data.length > 0 ? data : defaultData;

  // Define columns for the DataTable
  const columns = [
    {
      name: "Reference No",
      selector: (row) => row.referenceNo,
      sortable: true,
      center: false, // Left-aligned
    },
    {
      name: "Bridge Name",
      selector: (row) => row.bridgeName,
      sortable: true,
      center: false, // Left-aligned
    },
    {
      name: "Total Inspections",
      selector: (row) => row.totalInspections,
      sortable: true,
      center: true, // Center-aligned
    },
    {
      name: "Reviewed Inspections",
      selector: (row) => row.reviewedInspections,
      sortable: true,
      center: true, // Center-aligned
    },
  ];

  return (
    <>
      <div
        className="card p-0 rounded-lg text-black"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <div className="card-header p-2 " style={{ background: "#005D7F" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between text-white">
              <h5 className="mb-0 me-5">Bridges Status Summary</h5>
            </div>
          </div>
        </div>

        <div className="card-body p-0 pb-2">
          <DataTable
            columns={columns}
            data={bridges}
            customStyles={customStyles}
            pagination
            highlightOnHover
            striped
            responsive
            noDataComponent="No bridges found"
          />
        </div>
      </div>
    </>
  );
};

export default BridgesStatusSummary;
