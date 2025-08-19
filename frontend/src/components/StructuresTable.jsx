import React from "react";
import DataTable from "react-data-table-component";

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

// Define columns for the DataTable
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
    name: "Type",
    selector: (row) => row.structure_type,
    sortable: true,
  },
  {
    name: "Condition",
    selector: (row) => row.overall_bridge_condition,
    sortable: true,
  },
  {
    name: "Year",
    selector: (row) => row.construction_year || "—",
    sortable: true,
  },
  {
    name: "Length (m)",
    selector: (row) => row.bridge_length || "—",
    sortable: true,
  },
];

const StructuresTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600">No structures found.</p>;
  }

  return (
    <div className="overflow-x-auto">
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