import React, { useState } from "react";
import { Spinner, Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";

const DamageStatusBox = ({ title, counts, onCellClick }) => {
  const damageLevels = [
    "No Damage",
    "Invisible",
    "Good",
    "Fair",
    "Poor",
    "Severe",
  ];
  const levelColors = {
    "No Damage": "#9FD585",
    Invisible: "#DBDBDB",
    Good: "#00C4FF",
    Fair: "#FFD685",
    Poor: "#FFAA00",
    Severe: "#FF0000",
  };

  const normalizedCounts = {
    "No Damage": counts["No damage"] || counts["No Damage"] || 0,
    Invisible: counts["Invisible"] || 0,
    Good: counts["I. Good"] || counts["Good"] || 0,
    Fair: counts["II. Fair"] || counts["Fair"] || 0,
    Poor: counts["III. Poor"] || counts["Poor"] || 0,
    Severe: counts["Severe"] || 0,
  };

  return (
    <div className="border border-gray-300 rounded-lg p-2 m-1">
      <h6 className="text-sm font-semibold">{title}</h6>
      <div className="flex flex-wrap">
        {damageLevels.map((level) => (
          <span
            key={level}
            className="w-10 h-10 flex items-center justify-center m-1 text-black font-bold rounded cursor-pointer"
            style={{ backgroundColor: levelColors[level] }}
            onClick={() =>
              normalizedCounts[level] > 0 && onCellClick(title, level)
            }
          >
            {normalizedCounts[level]}
          </span>
        ))}
      </div>
    </div>
  );
};

const DamageSummary = ({
  workKinds,
  damageCounts,
  loadingWorkKinds,
  loadingDamageCounts,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Define columns for the modal inspection table
  const modalColumns = [
    {
      name: "Bridge Name",
      selector: (row) => row.bridge_name || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Span Number",
      selector: (row) => row.SpanIndex || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Work Kind",
      selector: (row) => row.WorkKindName || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Element Name",
      selector: (row) => row.PartsName || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Material",
      selector: (row) => row.MaterialName || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Damage Kind",
      selector: (row) => row.DamageKindName || "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Damage Level",
      selector: (row) => row.DamageLevel || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Extent",
      selector: (row) => row.damage_extent || "N/A",
      sortable: true,
      width: "80px",
    },
    {
      name: "Unapproved By",
      selector: (row) => row.unapprovedBy || "N/A",
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span
          className={`badge ${
            row.unapprovedBy === "Consultant" ? "bg-warning" : "bg-info"
          }`}
        >
          {row.unapprovedBy || "N/A"}
        </span>
      ),
    },
  ];

  const handleCellClick = async (workKindName, level) => {
    setModalTitle(`${workKindName} - ${level}`);
    setShowModal(true);
    setModalLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/damage-details?workKind=${encodeURIComponent(
          workKindName
        )}&damageLevel=${encodeURIComponent(level)}`
      );
      const data = await response.json();
      setModalData(data);
    } catch (err) {
      console.error(err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="mb-4 bg-[#DBEAFE] p-4">
      <h4 className="text-center mb-3 text-lg font-bold">Damage Status</h4>

      {/* Legend */}
      <div className="flex justify-around mb-3 flex-wrap gap-2">
        <button
          className="px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: "#9FD585" }}
        >
          No Damage
        </button>
        <button
          className="px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: "#DBDBDB" }}
        >
          Invisible
        </button>
        <button
          className="px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: "#00C4FF" }}
        >
          Good
        </button>
        <button
          className="px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: "#FFD685" }}
        >
          Fair
        </button>
        <button
          className="px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: "#FFAA00" }}
        >
          Poor
        </button>
        <button
          className="px-4 py-1 rounded text-sm font-medium"
          style={{ backgroundColor: "#FF0000" }}
        >
          Severe
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-wrap justify-around">
        {loadingWorkKinds || loadingDamageCounts ? (
          <div className="text-center py-2 w-full">
            <Spinner animation="border" size="sm" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center w-full">{error}</div>
        ) : (
          workKinds.map((workKind) => (
            <DamageStatusBox
              key={workKind.WorkKindID}
              title={workKind.WorkKindName}
              counts={damageCounts[workKind.WorkKindID] || {}}
              onCellClick={handleCellClick}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading inspections...</p>
            </div>
          ) : (
            <DataTable
              columns={modalColumns}
              data={modalData}
              pagination
              striped
              highlightOnHover
              responsive
              noDataComponent={
                <div className="text-center p-4">No inspections found</div>
              }
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DamageSummary;
