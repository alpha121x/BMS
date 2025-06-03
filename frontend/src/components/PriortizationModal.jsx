import React from "react";
import { Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Styled DataTable for consistent styling
const StyledDataTable = styled(DataTable)`
  .rdt_Table {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .rdt_TableHeadRow {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  .rdt_TableRow {
    transition: background-color 0.2s;
    &:hover {
      background-color: #f1f3f5 !important;
    }
  }

  .rdt_Pagination {
    background-color: #ffffff;
    border-top: 1px solid #dee2e6;
    padding: 10px;
  }
`;

const BridgeDetailsModal = ({
  showModal,
  setShowModal,
  selectedTitle,
  modalData,
}) => {
  const navigate = useNavigate(); // Must be inside a component

  // Define columns for DataTable
  const columns = [
    {
      name: "District",
      selector: (row) => row.district,
      sortable: true,
      cell: (row) => (
        <span style={{ color: getCategoryColor(row.category) }}>
          {row.district}
        </span>
      ),
    },
    {
      name: "Road Name",
      selector: (row) => row.roadName,
      sortable: true,
    },
    {
      name: "Structure Type",
      selector: (row) => row.structureType,
      sortable: true,
    },
    {
      name: "Damage Score",
      selector: (row) => row.score,
      sortable: true,
    },
    {
      name: "Bridge Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Date Time",
      selector: (row) => row.dateTime,
      sortable: true,
    },
    {
      name: "Bridge Information",
      selector: (row) => row.uu_bms_id,
      sortable: false,
      cell: (row) => (
        <span
          onClick={() =>
            navigate(`/PrioritizationInformation?uu_bms_id=${row.id}`)
          }
          style={{
            textDecoration: "none",
            color: "#007bff",
            cursor: "pointer",
          }}
        >
          View Details
        </span>
      ),
    },
  ];

  // Function to get color based on category (consistent with PrioritizationTable)
  const getCategoryColor = (category) => {
    switch (category) {
      case "Good":
        return "#28a745";
      case "Fair":
        return "#ffc107";
      case "Poor":
        return "#fd7e14";
      case "Severe":
        return "#dc3545";
      default:
        return "#000000";
    }
  };

  // Custom styles for DataTable (consistent with PrioritizationTable)
  const customStyles = {
    rows: {
      style: {
        minHeight: "50px",
        backgroundColor: (row) => getRowBackgroundColor(row.category),
      },
    },
    headCells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#e9ecef",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  // Function to get row background color based on category (consistent with PrioritizationTable)
  const getRowBackgroundColor = (category) => {
    switch (category) {
      case "Good":
        return "#e6f3e6";
      case "Fair":
        return "#fff3cd";
      case "Poor":
        return "#ffe4cc";
      case "Severe":
        return "#f8d7da";
      default:
        return "#ffffff";
    }
  };

  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Bridges Category - {selectedTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
        {modalData.length > 0 ? (
          <StyledDataTable
            columns={columns}
            data={modalData}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            striped
            noDataComponent="No bridges found for this group."
            defaultSortFieldId="score"
            defaultSortAsc={false}
          />
        ) : (
          <p>No bridges found for this group.</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default BridgeDetailsModal;
