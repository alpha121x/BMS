import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel, faAnglesRight, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const InspectionList = ({ bridgeId }) => {
  const [inspectionData, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
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
  }, [bridgeId]);

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

  const handlePhotoClick = (photos, clickedIndex) => {
    if (Array.isArray(photos) && photos.length > 0) {
      setSelectedPhotos(photos);
      setCurrentPhotoIndex(clickedIndex);
      setShowPhotoModal(true);
    }
  };

  const handlePreviousPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? selectedPhotos.length - 1 : prevIndex - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === selectedPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotos([]);
    setCurrentPhotoIndex(0);
  };

  const handleDownloadCSV = async (bridgeId) => {
    try {
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

      const inspectiondata = data.bridges;
      const bridgeName = inspectiondata[0].bridge_name || "bridge_inspection";
      const headers = Object.keys(inspectiondata[0]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
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

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${bridgeName.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      Swal.fire("Error!", "Failed to fetch or download CSV file", "error");
    }
  };

  const handleDownloadExcel = async (bridgeId) => {
    try {
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

      const inspectiondata = data.bridges;
      const bridgeName = inspectiondata[0].bridge_name || "bridge_inspection";

      const ws = XLSX.utils.json_to_sheet(inspectiondata);
      ws["!cols"] = Object.keys(inspectiondata[0]).map(() => ({ width: 20 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inspections");

      XLSX.writeFile(wb, `${bridgeName.replace(/\s+/g, "_")}.xlsx`);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
    }
  };

  const getDamageLevel = (data) => {
    const damageLevels = [...new Set(data.map((item) => item.DamageLevel))];
    return damageLevels.join(", ");
  };

  const getMaterials = (data) => {
    const materials = [...new Set(data.map((item) => item.MaterialName))];
    return materials.join(", ");
  };

  const getWorkKind = (data) => {
    const workKinds = [...new Set(data.map((item) => item.WorkKindName))];
    return workKinds.join(", ");
  };

  const getUniqueSpanIndices = (data) => {
    const spanIndices = data.map((item) => item.SpanIndex);
    return [...new Set(spanIndices)].length;
  };

  const groupedData = inspectionData.reduce((acc, row) => {
    const spanKey = row.SpanIndex ?? "N/A";
    const workKindKey = row.WorkKindName ?? "N/A";

    if (!acc[spanKey]) {
      acc[spanKey] = {};
    }

    if (!acc[spanKey][workKindKey]) {
      acc[spanKey][workKindKey] = [];
    }

    acc[spanKey][workKindKey].push(row);

    return acc;
  }, {});

  useEffect(() => {
    console.log("groupedData:", groupedData);
    Object.keys(groupedData).forEach((spanIndex) => {
      Object.keys(groupedData[spanIndex]).forEach((workKind) => {
        groupedData[spanIndex][workKind].forEach((inspection, index) => {
          if (!inspection.id) {
            console.warn(
              `Missing inspection id at spanIndex: ${spanIndex}, workKind: ${workKind}, index: ${index}`,
              inspection
            );
          }
        });
      });
    });
  }, [groupedData]);

  const inspectionCards = Object.keys(groupedData).length ? (
    Object.keys(groupedData).map((spanIndex) => (
      <div key={spanIndex} className="card mb-2 border-0">
        <div
          className="p-1 d-flex justify-content-between align-items-center bg-[#005D7F] text-[#fff]"
          style={{ cursor: "pointer" }}
          onClick={() => toggleAccordion(spanIndex)}
        >
          <h6 className="mb-0">{`Reports For Span: ${spanIndex}`}</h6>
          <span className="">{openAccordions[spanIndex] ? "▼" : "▶"}</span>
        </div>

        {openAccordions[spanIndex] && (
          <div className="card-body p-0">
            {Object.keys(groupedData[spanIndex]).map((workKind) => (
              <div
                key={`${spanIndex}-${workKind}`}
                className="card mb-2 mt-0 border-0"
              >
                <div className="rounded-0 p-1 bg-[#009DB9] text-[#fff]">
                  {workKind}
                </div>

                <div className="card-body p-0 rounded-0">
                  {groupedData[spanIndex][workKind]?.map((inspection, index) => (
                    <div
                      key={
                        inspection.id ||
                        `inspection-${spanIndex}-${workKind}-${index}`
                      }
                      className="mb-2 p-4 border-0 rounded-0 shadow-sm"
                      style={{ backgroundColor: "#c8e4e3" }}
                    >
                      <div className="row">
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
                                  onClick={() =>
                                    handlePhotoClick(inspection.PhotoPaths, i)
                                  }
                                />
                              ))}
                            </div>
                          )}
                        </div>

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
    ))
  ) : (
    <p>No inspection data available.</p>
  );

  return (
    <div className="card p-0 rounded-1">
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
          <h5 className="font-semibold text-gray-700 mb-2">Reports Summary</h5>
          <div className="bg-gray-300 mb-3 mt-1 p-3 rounded-1">
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
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1" />
                  <strong className="-mt-1">Damage Levels:</strong>
                </div>
                <p className="text-gray-700">
                  {getDamageLevel(inspectionData)}
                </p>
              </div>
              <div>
                <div className="flex">
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1" />
                  <strong className="-mt-1">Materials Used:</strong>
                </div>
                <p className="text-gray-700">{getMaterials(inspectionData)}</p>
              </div>
              <div>
                <div className="flex">
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-1" />
                  <strong className="-mt-1">Work Kind:</strong>
                </div>
                <p className="text-gray-700">{getWorkKind(inspectionData)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="inspection-cards-container">
          {loading ? (
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
          ) : error ? (
            <p className="text-danger">Error: {error}</p>
          ) : (
            inspectionCards
          )}
          <Modal
            show={showPhotoModal}
            onHide={handleClosePhotoModal}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Photo {currentPhotoIndex + 1} of {selectedPhotos.length}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              {selectedPhotos.length > 0 && (
                <div className="d-flex align-items-center justify-content-center">
                  <Button
                    variant="outline-secondary"
                    onClick={handlePreviousPhoto}
                    disabled={selectedPhotos.length <= 1}
                    className="mr-3"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <img
                    src={selectedPhotos[currentPhotoIndex]}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="img-fluid rounded border"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      objectFit: "contain",
                    }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleNextPhoto}
                    disabled={selectedPhotos.length <= 1}
                    className="ml-3"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Button>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClosePhotoModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

InspectionList.propTypes = {
  bridgeId: PropTypes.string.isRequired,
};

export default InspectionList;