import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faAnglesRight } from "@fortawesome/free-solid-svg-icons";

const InspectionList = ({ bridgeId }) => {
  const [inspectionData, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openAccordions, setOpenAccordions] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const toggleAccordion = (spanIndex) => {
    setOpenAccordions((prevState) => ({
      ...prevState,
      [spanIndex]: !prevState[spanIndex],
    }));
  };

  useEffect(() => {
    if (bridgeId) {
      fetchData();
    }
  }, [bridgeId]); // Refetch when inspectionType changes

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) {
        throw new Error("bridgeId is required");
      }

      const response = await fetch(
        `${BASE_URL}/api/get-summary?bridgeId=${bridgeId}`
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (Array.isArray(result.data)) {
        setInspectionData(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
  };

  // download csv
  const handleDownloadCSV = async (bridgeId) => {
    try {
      // Fetch data from the API
      const response = await fetch(
        `${BASE_URL}/api/inspections-export?bridgeId=${bridgeId}`
      );
      const data = await response.json();

      if (
        !data.success ||
        !Array.isArray(data.bridges) ||
        data.bridges.length === 0
      ) {
        console.error("No data to export");
        Swal.fire("Error!", "No data available for export", "error");
        return;
      }

      const inspectiondata = data.bridges; // Extract full data
      const bridgeName = inspectiondata[0].bridge_name || "bridge_inspection";

      // Extract headers dynamically from the first row
      const headers = Object.keys(inspectiondata[0]);

      // Generate CSV content
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","), // Dynamic Headers
          ...inspectiondata.map((row) =>
            headers
              .map((key) =>
                String(row[key]).includes(",")
                  ? `"${row[key]}"`
                  : row[key] || "N/A"
              )
              .join(",")
          ),
        ].join("\n");

      // Create CSV file and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${bridgeName.replace(/\s+/g, "_")}.csv`); // Replace spaces with underscores
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      Swal.fire("Error!", "Failed to fetch or download CSV file", "error");
    }
  };

  // download excel
  const handleDownloadExcel = async (bridgeId) => {
    try {
      // Fetch data from the API
      const response = await fetch(
        `${BASE_URL}/api/inspections-export?bridgeId=${bridgeId}`
      );
      const data = await response.json();

      if (
        !data.success ||
        !Array.isArray(data.bridges) ||
        data.bridges.length === 0
      ) {
        console.error("No data to export");
        Swal.fire("Error!", "No data available for export", "error");
        return;
      }

      const inspectiondata = data.bridges; // Extract full data
      const bridgeName = inspectiondata[0].bridge_name || "bridge_inspection"; // Use bridge_name dynamically

      // Convert JSON to worksheet
      const ws = XLSX.utils.json_to_sheet(inspectiondata);

      // Set column widths automatically based on data
      ws["!cols"] = Object.keys(inspectiondata[0]).map(() => ({ width: 20 }));

      // Create a new workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inspections");

      // Generate and trigger file download
      XLSX.writeFile(wb, `${bridgeName.replace(/\s+/g, "_")}.xlsx`); // Replaces spaces with underscores
    } catch (error) {
      console.error("Error downloading Excel:", error);
      Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
    }
  };

  const getDamageLevel = (data) => {
    const damageLevels = [...new Set(data.map((item) => item.DamageLevel))]; // Get unique damage levels
    return damageLevels.join(", "); // Join levels with commas
  };

  const getMaterials = (data) => {
    const materials = [...new Set(data.map((item) => item.MaterialName))]; // Get unique materials
    return materials.join(", "); // Join materials with commas
  };

  const getWorkKind = (data) => {
    const workKinds = [...new Set(data.map((item) => item.WorkKindName))]; // Get unique work kinds
    return workKinds.join(", "); // Join work kinds with commas
  };

  const getApprovalStatus = (data) => {
    const approved = data.filter(
      (item) => item.approved_by_consultant === "1"
    ).length;
    const unapproved = data.filter(
      (item) => item.approved_by_consultant === "0"
    ).length;
    return `Approved: ${approved}, Unapproved: ${unapproved}`;
  };

  const getUniqueSpanIndices = (data) => {
    // Extracting all SpanIndex values from the data
    const spanIndices = data.map((item) => item.SpanIndex);

    // Using Set to filter out duplicates and get unique values
    const uniqueSpanIndices = [...new Set(spanIndices)];

    return uniqueSpanIndices.length; // Return the count of unique span indices
  };

  // Group the inspection data by SpanIndex and then by WorkKind
  const groupedData = inspectionData.reduce((acc, row) => {
    const spanKey = row.SpanIndex || "N/A";
    const workKindKey = row.WorkKindName || "N/A";

    if (!acc[spanKey]) {
      acc[spanKey] = {};
    }

    if (!acc[spanKey][workKindKey]) {
      acc[spanKey][workKindKey] = [];
    }

    acc[spanKey][workKindKey].push(row);

    return acc;
  }, {});

  return (
    <div
      className="card p-0 rounded-1"
      style={{
        // background: "#FFFFFF",
        // border: "1px solid #005D7F",
        // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        // position: "relative",
      }}
    >
      <div className="card-body p-2">
        <div className="d-flex mb-4 justify-content-between items-center bg-[#009DB9] text-[#fff] p-2 rounded-1">
          <h5 className="card-title font-semibold pb-0 mb-0">
            Condition Assessment Reports
          </h5>
          <div className="d-flex gap-2">
            <button
              className="bg-[#005D7F] text-white px-3 py-1 rounded-1"
              onClick={() => handleDownloadCSV(bridgeId)}
            >
              <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              CSV
            </button>
            <button
              className="bg-[#005D7F] text-white px-3 py-1 rounded-1"
              onClick={() => handleDownloadExcel(bridgeId)}
            >
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              Excel
            </button>
          </div>
        </div>

        <div className="summary-section mt-1 mb-1">
          <h5 className="font-semibold text-gray-700 mb-2">
            Reports Summary
          </h5>
          <div className="bg-gray-300  mb-3 mt-1  p-3 rounded-1">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <div className="flex">
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1" />
                  <strong className="-mt-1">Total Spans:</strong>
                </div>
                <p className="text-gray-700">
                  {getUniqueSpanIndices(inspectionData)}
                </p>
              </div>
              <div>
                <div className="flex">
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1"/>
                  <strong className="-mt-1">Damage Levels:</strong>
                </div>
                <p className="text-gray-700">
                  {getDamageLevel(inspectionData)}
                </p>
              </div>
              <div>
                <div className="flex">
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1"/>
                  <strong className="-mt-1">Materials Used:</strong>
                </div>
                <p className="text-gray-700">{getMaterials(inspectionData)}</p>
              </div>
              <div>
                <div className="flex">
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1"/>
                  <strong className="-mt-1">Work Kind:</strong>
                </div>
                <p className="text-gray-700">{getWorkKind(inspectionData)}</p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
            <div
                className="loader"
                style={{
                  border: "8px solid #f3f3f3",
                  borderTop: "8px solid #3498db",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  animation: "spin 1s linear infinite",
                  margin: "auto",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: "999",
            }}
          />
        )}

    <div className="inspection-cards-container">
  {Object.keys(groupedData).map((spanIndex) => (
    <div key={spanIndex} className="card mb-2 border-0">
      {/* Span Index Dropdown */}
      <div
        className="p-1 d-flex justify-content-between align-items-center bg-[#005D7F] text-[#fff]"
        style={{ cursor: "pointer" }}
        onClick={() => toggleAccordion(spanIndex)}
      >
        <h6 className="mb-0">{`Reports For Span: ${spanIndex}`}</h6>
        <span className="">{openAccordions[spanIndex] ? "▼" : "▶"}</span>
      </div>

      {/* Content - Only visible if expanded */}
      {openAccordions[spanIndex] && (
        <div className="card-body p-0">
          {Object.keys(groupedData[spanIndex]).map((workKind) => (
            <div key={`${spanIndex}-${workKind}`} className="card mb-2 mt-0 border-0">
              <div className="rounded-0 p-1 bg-[#009DB9] text-[#fff]">
                {workKind}
              </div>

              <div className="card-body p-0 rounded-0">
                {groupedData[spanIndex][workKind]?.map((inspection, index) => (
                  <div
                    key={inspection.id || `inspection-${spanIndex}-${workKind}-${index}`}
                    className="mb-2 p-4 border-0 rounded-0 shadow-sm"
                    style={{ backgroundColor: "#c8e4e3" }}
                  >
                    <div className="row">
                      {/* Photos Column */}
                      <div className="col-md-3">
                        {inspection.PhotoPaths?.length > 0 && (
                          <div
                            className="d-flex gap-2"
                            style={{
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                              display: "flex",
                              paddingBottom: "5px",
                            }}
                          >
                            {inspection.PhotoPaths.map((photo, i) => (
                              <img
                                key={`photo-${inspection.id}-${i}`}
                                src={photo}
                                alt={`Photo ${i + 1}`}
                                className="img-fluid rounded border"
                                loading="lazy"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                }}
                                onClick={() => handlePhotoClick(photo)}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Details Column */}
                      <div className="col-md-9">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <strong>Parts:</strong>{" "}
                            {inspection.PartsName || "N/A"} <br />
                            <strong>Material:</strong>{" "}
                            {inspection.MaterialName || "N/A"}
                          </div>
                          <div className="col-md-6">
                            <strong>Damage:</strong>{" "}
                            {inspection.DamageKindName || "N/A"} <br />
                            <strong>Level:</strong>{" "}
                            {inspection.DamageLevel || "N/A"}
                          </div>
                          <div className="col-12">
                            <strong>Situation Remarks:</strong>{" "}
                            <span className="text-muted">
                              {inspection.Remarks || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ))}

  {/* Move Modal outside the loop */}
  <Modal
    show={showPhotoModal}
    onHide={handleClosePhotoModal}
    centered
    size="lg"
  >
    <Modal.Header closeButton>
      <Modal.Title>Enlarged Photo</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
      {selectedPhoto && (
        <img
          src={selectedPhoto}
          alt="Enlarged"
          className="img-fluid rounded border"
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
          }}
        />
      )}
    </Modal.Body>
  </Modal>
</div>
      </div>
    </div>
  );
};

export default InspectionList;
