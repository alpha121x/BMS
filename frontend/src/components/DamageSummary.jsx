import React, { useState } from "react";
import { Spinner, Button, Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { BASE_URL } from "./config";

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
  bridgeId,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // 🔹 New states for inspection detail modal
  const [showInspectionDetail, setShowInspectionDetail] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Custom styles (same as before)
  const customStyles = {
    table: {
      style: { width: "100%" },
    },
    headRow: {
      style: {
        backgroundColor: "#005D7F",
        color: "#fff",
        borderBottom: "1px solid #dee2e6",
      },
    },
    headCells: {
      style: {
        padding: "12px 8px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#fff",
        borderRight: "1px solid #495057",
      },
    },
    rows: {
      style: {
        fontSize: "13px",
        borderBottom: "1px solid #dee2e6",
        "&:hover": { backgroundColor: "#f8f9fa" },
      },
      stripedStyle: { backgroundColor: "#f8f9fa" },
    },
    cells: {
      style: {
        padding: "8px",
        borderRight: "1px solid #dee2e6",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #dee2e6",
        padding: "8px",
        fontSize: "14px",
      },
    },
  };

  // Define columns for modal table
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
    // 🔹 NEW Action column
    {
      name: "Action",
      width: "100px",
      cell: (row) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setSelectedInspection(row);
            setShowInspectionDetail(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const handleCellClick = async (workKindName, level) => {
    setModalTitle(`${workKindName} - ${level}`);
    setShowModal(true);
    setModalLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/detailed-damage-counts?workKind=${encodeURIComponent(
          workKindName
        )}&damageLevel=${encodeURIComponent(level)}&bridgeId=${bridgeId}`
      );
      const result = await response.json();
      setModalData(result.data || []); // ✅ pass only the array
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

      {/* Modal with DataTable */}
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
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center p-4">No inspections found</div>
              }
            />
          )}
        </Modal.Body>
      </Modal>

      {/* 🔹 Inspection Detail Modal */}
      <Modal
        show={showInspectionDetail}
        onHide={() => setShowInspectionDetail(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Inspection Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInspection && (
            <div>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <tbody>
                    <tr>
                      <th className="bg-light" style={{ width: "30%" }}>
                        Bridge Name
                      </th>
                      <td>{selectedInspection.bridge_name || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Span Index</th>
                      <td>{selectedInspection.SpanIndex || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Element</th>
                      <td>{selectedInspection.PartsName || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Material</th>
                      <td>{selectedInspection.MaterialName || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Damage Kind</th>
                      <td>{selectedInspection.DamageKindName || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Damage Level</th>
                      <td>{selectedInspection.DamageLevel || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Damage Extent</th>
                      <td>{selectedInspection.damage_extent || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Inspection Date</th>
                      <td>
                        {selectedInspection.current_date_time
                          ? new Date(
                              selectedInspection.current_date_time
                            ).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Remarks</th>
                      <td>{selectedInspection.Remarks || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Consultant Remarks</th>
                      <td>{selectedInspection.qc_remarks_con || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">RAMS Remarks</th>
                      <td>{selectedInspection.qc_remarks_rams || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Photos */}
              {selectedInspection.PhotoPaths &&
                selectedInspection.PhotoPaths.length > 0 && (
                  <div className="mt-3">
                    <div className="row">
                      {/* Photos */}
                      {selectedInspection.PhotoPaths && (
                        <div className="mt-3">
                          <h6>Inspection Photos</h6>
                          <div className="row">
                            {(() => {
                              let photos = [];

                              // Case 1: Already an array
                              if (
                                Array.isArray(selectedInspection.PhotoPaths)
                              ) {
                                photos = selectedInspection.PhotoPaths;
                              }
                              // Case 2: Comma-separated string
                              else if (
                                typeof selectedInspection.PhotoPaths ===
                                "string"
                              ) {
                                photos = selectedInspection.PhotoPaths.split(
                                  ","
                                ).map((p) => p.trim());
                              }

                              return photos.map((photo, index) => (
                                <div key={index} className="col-md-4 mb-2">
                                  <img
                                    src={photo}
                                    alt={`Inspection ${index + 1}`}
                                    className="img-fluid rounded"
                                    style={{
                                      maxHeight: "200px",
                                      objectFit: "cover",
                                      width: "100%",
                                    }}
                                  />
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DamageSummary;
