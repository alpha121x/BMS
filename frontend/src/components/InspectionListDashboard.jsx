import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faAnglesRight,
  faArrowLeft,
  faArrowRight,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const InspectionList = ({ bridgeId }) => {
  const [inspectionData, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
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

      // Try to parse error response body
      const result = await response.json();

      if (!response.ok) {
        // Show API response error if available
        throw new Error(result.message || "Failed to fetch data");
      }

      if (Array.isArray(result.data)) {
        setInspectionData(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error("API Error:", error); // for debugging
      setError(error.message || "Something went wrong");
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

  const handleDownloadCSV = async (bridgeId, setLoadingCsv) => {
    setLoadingCsv(true);
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
        Swal.fire("No data available for export", "error");
        return;
      }

      const summaryData = data.bridges;
      const bridgeName = summaryData[0]?.bridge_name || "bridge_inspection";

      const headers = Object.keys(summaryData[0]).filter(
        (key) =>
          key !== "Overview Photos" &&
          key !== "PhotoPaths" &&
          key !== "RN" &&
          key !== "SURVEYED BY"
      );

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...summaryData.map((row) =>
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
      Swal.fire("Error!", "Failed to fetch or download CSV file", "error");
    } finally {
      setLoadingCsv(false);
    }
  };

  const handleDownloadExcel = async (bridgeId, setLoadingExcel) => {
    setLoadingExcel(true);
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
        Swal.fire("No data available for export", "error");
        return;
      }

      const summaryData = data.bridges;
      const bridgeName = summaryData[0]?.bridge_name || "bridge_inspection";

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Inspections");

      const columnKeys = Object.keys(summaryData[0]).filter(
        (key) =>
          key !== "Overview Photos" &&
          key !== "PhotoPaths" &&
          key !== "RN" &&
          key !== "qc_con" &&
          key !== "qc_rams" &&
          key !== "SURVEYED BY"
      );

      const columns = columnKeys.map((key) => ({
        header: key.replace(/_/g, " "),
        key: key,
        width: 22,
      }));

      for (let i = 1; i <= 5; i++) {
        columns.push({
          header: `Overview Photo ${i}`,
          key: `photo${i}`,
          width: 22,
        });
      }
      for (let i = 1; i <= 5; i++) {
        columns.push({
          header: `Inspection Photo ${i}`,
          key: `inspection${i}`,
          width: 22,
        });
      }

      worksheet.columns = columns;

      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getRow(1).height = 25;

      for (let i = 0; i < summaryData.length; i++) {
        const item = summaryData[i];

        const overviewPhotos = (item["Overview Photos"] || []).map((url) =>
          url.replace(/\\/g, "/")
        );
        const inspectionPhotos = (item["PhotoPaths"] || []).map((url) =>
          url.replace(/\\/g, "/")
        );

        const rowData = {};
        columnKeys.forEach((key) => (rowData[key] = item[key] || ""));

        const rowIndex = worksheet.addRow(rowData).number;

        worksheet.getRow(rowIndex).height = 90;

        const insertImage = async (photoUrls, columnOffset, rowHeight) => {
          for (let j = 0; j < photoUrls.length && j < 5; j++) {
            try {
              const imgResponse = await fetch(photoUrls[j]);
              const imgBlob = await imgResponse.blob();
              const arrayBuffer = await imgBlob.arrayBuffer();

              const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: "jpeg",
              });

              worksheet.addImage(imageId, {
                tl: {
                  col: columnKeys.length + columnOffset + j,
                  row: rowIndex - 1,
                },
                ext: { width: 150, height: 90 },
              });
            } catch (error) {
              console.error("Failed to load image:", photoUrls[j], error);
            }
          }
        };

        await insertImage(overviewPhotos, 0, 90);
        await insertImage(inspectionPhotos, 5, 90);
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${bridgeName.replace(/\s+/g, "_")}.xlsx`);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
    } finally {
      setLoadingExcel(false);
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
    // console.log("groupedData:", groupedData);
    Object.keys(groupedData).forEach((spanIndex) => {
      Object.keys(groupedData[spanIndex]).forEach((workKind) => {
        groupedData[spanIndex][workKind].forEach((inspection, index) => {});
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
                  {groupedData[spanIndex][workKind]?.map(
                    (inspection, index) => (
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
                    )
                  )}
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
      <style>
        {`
          .custom-modal .modal-dialog {
            max-width: 90vw;
            width: 100%;
          }
          .custom-modal .modal-content {
            max-height: 90vh;
            overflow: hidden;
          }
          .custom-modal .modal-body {
            max-height: 70vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
          }
          .custom-modal .image-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-height: 60vh;
          }
          .custom-modal .modal-image {
            max-width: 100%;
            max-height: 60vh;
            object-fit: contain;
            border-radius: 4px;
            border: 1px solid #dee2e6;
          }
          .custom-modal .nav-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            padding: 8px 12px;
            font-size: 1.2rem;
          }
          .custom-modal .prev-button {
            left: 10px;
          }
          .custom-modal .next-button {
            right: 10px;
          }
        `}
      </style>
      <div className="card-body p-2">
        <div className="d-flex mb-4 justify-content-between items-center bg-[#009DB9] text-[#fff] p-2 rounded-1">
          <h5 className="card-title font-semibold pb-0 mb-0">
            Condition Assessment Reports
          </h5>
          <div className="d-flex gap-3">
            <button
              className="bg-[#005D7F] text-white px-3 py-1 rounded-1"
              onClick={() => handleDownloadCSV(bridgeId, setLoadingCsv)}
            >
              {loadingCsv ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              )}
              {loadingCsv ? "Processing..." : "Csv"}
            </button>
            <button
              className="bg-[#005D7F] text-white px-3 py-1 rounded-1"
              onClick={() => handleDownloadExcel(bridgeId, setLoadingExcel)}
            >
              {loadingExcel ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              )}
              {loadingExcel ? "Processing..." : "Excel"}
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
        <p className="text-danger">{error}</p>
      ) : inspectionData.length === 0 ? (
        <p>No inspection data available.</p>
      ) : (
            inspectionCards
          )}
          <Modal
            show={showPhotoModal}
            onHide={handleClosePhotoModal}
            centered
            size="lg"
            className="custom-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Photo {currentPhotoIndex + 1} of {selectedPhotos.length}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedPhotos.length > 0 && (
                <div className="image-container">
                  <Button
                    variant="outline-secondary"
                    onClick={handlePreviousPhoto}
                    disabled={selectedPhotos.length <= 1}
                    className="nav-button prev-button"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <img
                    src={selectedPhotos[currentPhotoIndex]}
                    alt={`Photo ${currentPhotoIndex + 1}`}
                    className="modal-image"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleNextPhoto}
                    disabled={selectedPhotos.length <= 1}
                    className="nav-button next-button"
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

// InspectionList.propTypes = {
//   bridgeId: PropTypes.string.isRequired,
// };

export default InspectionList;
