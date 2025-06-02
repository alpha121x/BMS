import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faSpinner,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ReportsSummary from "./ReportsSummary";
import Compressor from "compressorjs";

const InspectionListCon = ({ bridgeId }) => {
  const [pendingData, setPendingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [unapprovedData, setUnapprovedData] = useState([]);
  const [unapprovedRamsData, setUnapprovedRamsData] = useState([]);
  const [summaryData, setsummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeDiv, setActiveDiv] = useState("pending");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    if (bridgeId) {
      fetchData();
      fetchsummaryData();
    }
  }, [bridgeId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) throw new Error("bridgeId is required");

      const response = await fetch(
        `${BASE_URL}/api/get-inspections-con?bridgeId=${bridgeId}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (result.success) {
        const groupBySpanAndWorkKind = (data) => {
          return data.reduce((acc, item) => {
            const spanKey = item.SpanIndex || "N/A";
            const workKindKey = item.WorkKindName || "N/A";

            if (!acc[spanKey]) acc[spanKey] = {};
            if (!acc[spanKey][workKindKey]) acc[spanKey][workKindKey] = [];

            acc[spanKey][workKindKey].push(item);
            return acc;
          }, {});
        };

        setPendingData(groupBySpanAndWorkKind(result.data.pending));
        setApprovedData(groupBySpanAndWorkKind(result.data.approved));
        setUnapprovedData(groupBySpanAndWorkKind(result.data.unapproved));
        setUnapprovedRamsData(
          groupBySpanAndWorkKind(result.data.unapproved_rams)
        );
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [bridgeId]);

  const fetchsummaryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) throw new Error("bridgeId is required");

      const response = await fetch(
        `${BASE_URL}/api/get-summary-con?bridgeId=${bridgeId}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (Array.isArray(result.data)) {
        setsummaryData(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [bridgeId]);

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

  const handleUpdateInspection = async (row) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0D6EFD",
        cancelButtonColor: "#6C757D",
        confirmButtonText: "Yes, save it!",
      });

      if (!isConfirmed) {
        console.log("Update cancelled by user.");
        return;
      }

      const conRemarks =
        row.qc_remarks_con?.trim() === "" ? null : row.qc_remarks_con;

      const updatedData = {
        id: row.inspection_id,
        qc_remarks_con: conRemarks,
        qc_con: row.qc_con,
      };

      const response = await fetch(`${BASE_URL}/api/update-inspection-con`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update inspection");

      fetchData();

      Swal.fire({
        title: "Updated!",
        text: "Your inspection has been updated.",
        icon: "success",
        confirmButtonColor: "#0D6EFD",
      });
    } catch (error) {
      setError(error.message);
      Swal.fire("Error!", error.message, "error");
    }
  };

  const handleConRemarksChange = (spanIndex, workKind, inspectionId, value) => {
    setPendingData((prevData) => ({
      ...prevData,
      [spanIndex]: {
        ...prevData[spanIndex],
        [workKind]: prevData[spanIndex][workKind].map((item) =>
          item.inspection_id === inspectionId
            ? { ...item, qc_remarks_con: value }
            : item
        ),
      },
    }));
  };

  const handleApprovedFlagChange = (
    spanIndex,
    workKind,
    inspectionId,
    value
  ) => {
    setPendingData((prevData) => ({
      ...prevData,
      [spanIndex]: {
        ...prevData[spanIndex],
        [workKind]: prevData[spanIndex][workKind].map((item) =>
          item.inspection_id === inspectionId
            ? { ...item, qc_con: value }
            : item
        ),
      },
    }));
  };

  const handleSaveChanges = (row) => {
    handleUpdateInspection(row);
  };

  const handleDownloadCSV = async (bridgeId, setLoadingCsv) => {
    setLoadingCsv(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/inspections-export-con?bridgeId=${bridgeId}`
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
        `${BASE_URL}/api/inspections-export-con?bridgeId=${bridgeId}`
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
      console.log(summaryData);
      const bridgeName = summaryData[0]?.["BRIDGE NAME"] || "bridge_inspection";

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
        key,
        width: 22,
      }));

      for (let i = 1; i <= 3; i++) {
        // Reduced to 3 images per type
        columns.push({
          header: `Overview Photo ${i}`,
          key: `photo${i}`,
          width: 22,
        });
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

      // Compress image helper function
      const compressImage = (blob) =>
        new Promise((resolve, reject) => {
          new Compressor(blob, {
            quality: 0.6, // Adjust quality (0 to 1) for compression
            maxWidth: 150, // Match Excel image width
            maxHeight: 90, // Match Excel image height
            mimeType: "image/jpeg",
            success: (compressedBlob) => resolve(compressedBlob),
            error: (err) => reject(err),
          });
        });

      // Fetch and compress images concurrently
      const fetchAndCompressImage = async (url) => {
        try {
          const imgResponse = await fetch(url.replace(/\\/g, "/"));
          if (!imgResponse.ok) return null;
          const imgBlob = await imgResponse.blob();
          return await compressImage(imgBlob);
        } catch (error) {
          console.error("Failed to fetch/compress image:", url, error);
          return null;
        }
      };

      for (let i = 0; i < summaryData.length; i++) {
        const item = summaryData[i];
        const overviewPhotos = (item["Overview Photos"] || [])
          .map((url) => url.replace(/\\/g, "/"))
          .slice(0, 3); // Limit to 3 images
        const inspectionPhotos = (item["PhotoPaths"] || [])
          .map((url) => url.replace(/\\/g, "/"))
          .slice(0, 3); // Limit to 3 images

        const rowData = {};
        columnKeys.forEach((key) => (rowData[key] = item[key] || ""));

        const rowIndex = worksheet.addRow(rowData).number;
        worksheet.getRow(rowIndex).height = 90;

        const insertImages = async (photoUrls, columnOffset) => {
          const compressedBlobs = await Promise.all(
            photoUrls.map((url) => fetchAndCompressImage(url))
          );

          for (let j = 0; j < compressedBlobs.length; j++) {
            if (!compressedBlobs[j]) continue;
            const arrayBuffer = await compressedBlobs[j].arrayBuffer();
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
          }
        };

        await Promise.all([
          insertImages(overviewPhotos, 0),
          insertImages(inspectionPhotos, 3),
        ]);
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

  const handleDownloadExcel1 = async (bridgeId, setLoadingExcel) => {
    setLoadingExcel(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/inspections-export-con-new?bridgeId=${bridgeId}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Excel file");
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let bridgeName = "bridge_inspection";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)"/);
        if (match) bridgeName = match[1].replace(".xlsx", "");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${bridgeName.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
    const uniqueSpanIndices = [...new Set(spanIndices)];
    return uniqueSpanIndices.length;
  };

  const handleDivChange = (div) => {
    setActiveDiv(div);
  };

  const toggleSection = (spanIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [spanIndex]: !prev[spanIndex],
    }));
  };

  return (
    <div
      className="card p-2 rounded-lg text-black"
      style={{
        background: "#FFFFFF",
        border: "2px solid #60A5FA",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
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
      <div className="card-body pb-0">
        <div className="d-flex mb-2 justify-content-between items-center p-3 bg-[#CFE2FF] rounded-lg shadow-md">
          <h6
            className="card-title text-lg font-semibold pb-2"
            style={{ fontSize: "1.25rem" }}
          >
            Condition Assessment Reports
          </h6>
          <div className="d-flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 flex items-center justify-center"
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
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 flex items-center justify-center"
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

        <ReportsSummary
          summaryData={summaryData}
          getUniqueSpanIndices={getUniqueSpanIndices}
          getDamageLevel={getDamageLevel}
          getMaterials={getMaterials}
          getWorkKind={getWorkKind}
        />

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

        <div className="border rounded p-2 d-flex justify-content-start gap-2 align-items-center mt-2">
          <Button
            variant="warning"
            className="fw-bold text-grey"
            onClick={() => handleDivChange("pending")}
          >
            View Pending Reports
          </Button>
          <Button
            variant="success"
            className="fw-bold"
            onClick={() => handleDivChange("approved")}
          >
            View Approved Reports
          </Button>
          <Button
            variant="danger"
            className="fw-bold"
            onClick={() => handleDivChange("unapproved")}
          >
            View Unapproved Reports
          </Button>
          <Button
            variant="danger"
            className="fw-bold"
            onClick={() => handleDivChange("unapproved_rams")}
          >
            View Unapproved by RAMS
          </Button>
        </div>
        <div className="border rounded p-3 shadow-lg mt-2">
          {activeDiv === "pending" && (
            <div className="mb-4">
              <h5>Pending Reports</h5>
              {pendingData && Object.keys(pendingData).length > 0 ? (
                Object.keys(pendingData).map((spanIndex) => (
                  <div key={`span-${spanIndex}`} className="mb-4">
                    <div
                      className="border rounded p-2 bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                      onClick={() => toggleSection(spanIndex)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>Reports For Span: {spanIndex}</strong>
                      <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
                    </div>
                    {expandedSections[spanIndex] && (
                      <div className="mt-2">
                        {Object.keys(pendingData[spanIndex]).length > 0 ? (
                          Object.keys(pendingData[spanIndex]).map(
                            (workKind) => (
                              <div
                                key={`workKind-${spanIndex}-${workKind}`}
                                className="mb-4"
                              >
                                <div className="border rounded p-2 bg-secondary text-white fw-bold">
                                  {workKind}
                                </div>
                                <div className="mt-2">
                                  {pendingData[spanIndex][workKind].map(
                                    (inspection) => (
                                      <div
                                        key={`inspection-${inspection.inspection_id}`}
                                        className="border rounded p-4 shadow-sm mb-3"
                                        style={{ backgroundColor: "#CFE2FF" }}
                                      >
                                        <div className="row">
                                          <div className="col-md-3">
                                            {inspection.PhotoPaths?.length >
                                              0 && (
                                              <div
                                                className="d-flex gap-2"
                                                style={{
                                                  overflowX: "auto",
                                                  whiteSpace: "nowrap",
                                                  display: "flex",
                                                  paddingBottom: "5px",
                                                }}
                                              >
                                                {inspection.PhotoPaths.map(
                                                  (photoUrl, index) => (
                                                    <img
                                                      key={`photo-${inspection.id}-${index}`}
                                                      src={photoUrl}
                                                      alt={`Photo ${index + 1}`}
                                                      className="img-fluid rounded border"
                                                      style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                      }}
                                                      loading="lazy"
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          inspection.PhotoPaths,
                                                          index
                                                        )
                                                      }
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                          "/placeholder-image.png";
                                                      }}
                                                    />
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="col-md-6">
                                            <strong>Parts:</strong>{" "}
                                            {inspection.PartsName || "N/A"}{" "}
                                            <br />
                                            <strong>Material:</strong>{" "}
                                            {inspection.MaterialName || "N/A"}{" "}
                                            <br />
                                            <strong>Damage:</strong>{" "}
                                            {inspection.DamageKindName || "N/A"}{" "}
                                            <br />
                                            <strong>Level:</strong>{" "}
                                            {inspection.DamageLevel || "N/A"}{" "}
                                            <br />
                                            <strong>Damage Extent:</strong>{" "}
                                            {inspection.damage_extent || "N/A"}{" "}
                                            <br />
                                            <strong>
                                              Situation Remarks:
                                            </strong>{" "}
                                            {inspection.Remarks || "N/A"} <br />
                                          </div>
                                          <div className="col-md-3 d-flex flex-column justify-content-between">
                                            <Form.Control
                                              as="textarea"
                                              rows={3}
                                              placeholder="Consultant Remarks"
                                              value={
                                                inspection.qc_remarks_con || ""
                                              }
                                              onChange={(e) =>
                                                handleConRemarksChange(
                                                  spanIndex,
                                                  workKind,
                                                  inspection.inspection_id,
                                                  e.target.value
                                                )
                                              }
                                              className="mb-2"
                                            />
                                            <Form.Group
                                              controlId={`qc_con_${inspection.inspection_id}`}
                                              className="mb-2"
                                            >
                                              <div className="flex gap-4">
                                                <Form.Check
                                                  type="radio"
                                                  name={`qc_con_${inspection.inspection_id}`}
                                                  label="Unapproved"
                                                  value="3"
                                                  checked={
                                                    inspection.qc_con === 3
                                                  }
                                                  onChange={(e) =>
                                                    handleApprovedFlagChange(
                                                      spanIndex,
                                                      workKind,
                                                      inspection.inspection_id,
                                                      parseInt(e.target.value)
                                                    )
                                                  }
                                                  className="text-blue-500 font-medium"
                                                  style={{
                                                    accentColor: "blue",
                                                  }}
                                                />
                                                <Form.Check
                                                  type="radio"
                                                  name={`qc_con_${inspection.inspection_id}`}
                                                  label="Approved"
                                                  value="2"
                                                  checked={
                                                    inspection.qc_con === 2
                                                  }
                                                  onChange={(e) =>
                                                    handleApprovedFlagChange(
                                                      spanIndex,
                                                      workKind,
                                                      inspection.inspection_id,
                                                      parseInt(e.target.value)
                                                    )
                                                  }
                                                  className="text-blue-500 font-medium"
                                                  style={{
                                                    accentColor: "blue",
                                                  }}
                                                />
                                              </div>
                                            </Form.Group>
                                            <Button
                                              onClick={() =>
                                                handleSaveChanges(inspection)
                                              }
                                              className="bg-[#CFE2FF]"
                                            >
                                              Save Changes
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p>
                            No pending records available for Span {spanIndex}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No pending records available.</p>
              )}
            </div>
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png";
                    }}
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
          {activeDiv === "approved" && (
            <div className="mb-4">
              <h5>Approved Reports</h5>
              {approvedData && Object.keys(approvedData).length > 0 ? (
                Object.keys(approvedData).map((spanIndex) => (
                  <div key={`span-${spanIndex}`} className="mb-4">
                    <div
                      className="border rounded p-2 bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                      onClick={() => toggleSection(spanIndex)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>Reports For Span: {spanIndex}</strong>
                      <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
                    </div>
                    {expandedSections[spanIndex] && (
                      <div className="mt-2">
                        {Object.keys(approvedData[spanIndex]).length > 0 ? (
                          Object.keys(approvedData[spanIndex]).map(
                            (workKind) => (
                              <div
                                key={`workKind-${spanIndex}-${workKind}`}
                                className="mb-4"
                              >
                                <div className="border rounded p-2 bg-secondary text-white fw-bold">
                                  {workKind}
                                </div>
                                <div className="mt-2">
                                  {approvedData[spanIndex][workKind].map(
                                    (inspection) => (
                                      <div
                                        key={`inspection-${inspection.inspection_id}`}
                                        className="border rounded p-4 shadow-sm mb-3"
                                        style={{ backgroundColor: "#CFE2FF" }}
                                      >
                                        <div className="row">
                                          <div className="col-md-3">
                                            {inspection.PhotoPaths?.length >
                                              0 && (
                                              <div
                                                className="d-flex gap-2"
                                                style={{
                                                  overflowX: "auto",
                                                  whiteSpace: "nowrap",
                                                  display: "flex",
                                                  paddingBottom: "5px",
                                                }}
                                              >
                                                {inspection.PhotoPaths.map(
                                                  (photoUrl, index) => (
                                                    <img
                                                      key={`photo-${inspection.id}-${index}`}
                                                      src={photoUrl}
                                                      alt={`Photo ${index + 1}`}
                                                      className="img-fluid rounded border"
                                                      style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                      }}
                                                      loading="lazy"
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          inspection.PhotoPaths,
                                                          index
                                                        )
                                                      }
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                          "/placeholder-image.png";
                                                      }}
                                                    />
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="col-md-6">
                                            <strong>Parts:</strong>{" "}
                                            {inspection.PartsName || "N/A"}{" "}
                                            <br />
                                            <strong>Material:</strong>{" "}
                                            {inspection.MaterialName || "N/A"}{" "}
                                            <br />
                                            <strong>Damage:</strong>{" "}
                                            {inspection.DamageKindName || "N/A"}{" "}
                                            <br />
                                            <strong>Level:</strong>{" "}
                                            {inspection.DamageLevel || "N/A"}{" "}
                                            <br />
                                            <strong>Damage Extent:</strong>{" "}
                                            {inspection.damage_extent || "N/A"}{" "}
                                            <br />
                                            <strong>
                                              Situation Remarks:
                                            </strong>{" "}
                                            {inspection.Remarks || "N/A"}
                                          </div>
                                          <div className="col-md-3 d-flex flex-column justify-content-between">
                                            <div className="text-start">
                                              <strong>Remarks: </strong>
                                              {inspection.qc_remarks_con ||
                                                "N/A"}{" "}
                                              <br />
                                              <strong>Status: </strong>
                                              {inspection.qc_con === 2
                                                ? "Approved"
                                                : "Unapproved"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p>No data available</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No approved records available</p>
              )}
            </div>
          )}
          {activeDiv === "unapproved" && (
            <div className="mb-4">
              <h5>Unapproved Reports</h5>
              {unapprovedData && Object.keys(unapprovedData).length > 0 ? (
                Object.keys(unapprovedData).map((spanIndex) => (
                  <div key={`span-${spanIndex}`} className="mb-4">
                    <div
                      className="border rounded p-2 bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                      onClick={() => toggleSection(spanIndex)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>Reports For Span: {spanIndex}</strong>
                      <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
                    </div>
                    {expandedSections[spanIndex] && (
                      <div className="mt-2">
                        {Object.keys(unapprovedData[spanIndex]).length > 0 ? (
                          Object.keys(unapprovedData[spanIndex]).map(
                            (workKind) => (
                              <div
                                key={`workKind-${spanIndex}-${workKind}`}
                                className="mb-4"
                              >
                                <div className="border rounded p-2 bg-secondary text-white fw-bold">
                                  {workKind}
                                </div>
                                <div className="mt-2">
                                  {unapprovedData[spanIndex][workKind].map(
                                    (inspection) => (
                                      <div
                                        key={`inspection-${inspection.inspection_id}`}
                                        className="border rounded p-4 shadow-sm mb-3"
                                        style={{ backgroundColor: "#CFE2FF" }}
                                      >
                                        <div className="row">
                                          <div className="col-md-3">
                                            {inspection.PhotoPaths?.length >
                                              0 && (
                                              <div
                                                className="d-flex gap-2"
                                                style={{
                                                  overflowX: "auto",
                                                  whiteSpace: "nowrap",
                                                  display: "flex",
                                                  paddingBottom: "5px",
                                                }}
                                              >
                                                {inspection.PhotoPaths.map(
                                                  (photoUrl, index) => (
                                                    <img
                                                      key={`photo-${inspection.id}-${index}`}
                                                      src={photoUrl}
                                                      alt={`Photo ${index + 1}`}
                                                      className="img-fluid rounded border"
                                                      style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                      }}
                                                      loading="lazy"
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          inspection.PhotoPaths,
                                                          index
                                                        )
                                                      }
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                          "/placeholder-image.png";
                                                      }}
                                                    />
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="col-md-6">
                                            <strong>Parts:</strong>{" "}
                                            {inspection.PartsName || "N/A"}{" "}
                                            <br />
                                            <strong>Material:</strong>{" "}
                                            {inspection.MaterialName || "N/A"}{" "}
                                            <br />
                                            <strong>Damage:</strong>{" "}
                                            {inspection.DamageKindName || "N/A"}{" "}
                                            <br />
                                            <strong>Level:</strong>{" "}
                                            {inspection.DamageLevel || "N/A"}{" "}
                                            <br />
                                            <strong>Damage Extent:</strong>{" "}
                                            {inspection.damage_extent || "N/A"}{" "}
                                            <br />
                                            <strong>
                                              Situation Remarks:
                                            </strong>{" "}
                                            {inspection.Remarks || "N/A"}
                                          </div>
                                          <div className="col-md-3 d-flex flex-column justify-content-between">
                                            <div className="text-start">
                                              <strong>Remarks: </strong>{" "}
                                              {inspection.qc_remarks_con ||
                                                "N/A"}{" "}
                                              <br />
                                              <strong>Status: </strong>{" "}
                                              {inspection.qc_con === 2
                                                ? "Approved"
                                                : "Unapproved"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p>No work kinds available for this span.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No unapproved reports available.</p>
              )}
            </div>
          )}
          {activeDiv === "unapproved_rams" && (
            <div className="mb-4">
              <h5>Unapproved by RAMS Reports</h5>
              {unapprovedRamsData &&
              Object.keys(unapprovedRamsData).length > 0 ? (
                Object.keys(unapprovedRamsData).map((spanIndex) => (
                  <div key={`span-${spanIndex}`} className="mb-4">
                    <div
                      className="border rounded p-2 bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                      onClick={() => toggleSection(spanIndex)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>Reports For Span: {spanIndex}</strong>
                      <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
                    </div>
                    {expandedSections[spanIndex] && (
                      <div className="mt-2">
                        {Object.keys(unapprovedRamsData[spanIndex]).length >
                        0 ? (
                          Object.keys(unapprovedRamsData[spanIndex]).map(
                            (workKind) => (
                              <div
                                key={`workKind-${spanIndex}-${workKind}`}
                                className="mb-4"
                              >
                                <div className="border rounded p-2 bg-secondary text-white fw-bold">
                                  {workKind}
                                </div>
                                <div className="mt-2">
                                  {unapprovedRamsData[spanIndex][workKind].map(
                                    (inspection) => (
                                      <div
                                        key={`inspection-${inspection.inspection_id}`}
                                        className="border rounded p-4 shadow-sm mb-3"
                                        style={{ backgroundColor: "#CFE2FF" }}
                                      >
                                        <div className="row">
                                          <div className="col-md-3">
                                            {inspection.PhotoPaths?.length >
                                              0 && (
                                              <div
                                                className="d-flex gap-2"
                                                style={{
                                                  overflowX: "auto",
                                                  whiteSpace: "nowrap",
                                                  display: "flex",
                                                  paddingBottom: "5px",
                                                }}
                                              >
                                                {inspection.PhotoPaths.map(
                                                  (photoUrl, index) => (
                                                    <img
                                                      key={`photo-${inspection.id}-${index}`}
                                                      src={photoUrl}
                                                      alt={`Photo ${index + 1}`}
                                                      className="img-fluid rounded border"
                                                      style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                      }}
                                                      loading="lazy"
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          inspection.PhotoPaths,
                                                          index
                                                        )
                                                      }
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                          "/placeholder-image.png";
                                                      }}
                                                    />
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="col-md-6">
                                            <strong>Parts:</strong>{" "}
                                            {inspection.PartsName || "N/A"}{" "}
                                            <br />
                                            <strong>Material:</strong>{" "}
                                            {inspection.MaterialName || "N/A"}{" "}
                                            <br />
                                            <strong>Damage:</strong>{" "}
                                            {inspection.DamageKindName || "N/A"}{" "}
                                            <br />
                                            <strong>Level:</strong>{" "}
                                            {inspection.DamageLevel || "N/A"}{" "}
                                            <br />
                                            <strong>Damage Extent:</strong>{" "}
                                            {inspection.damage_extent || "N/A"}{" "}
                                            <br />
                                            <strong>
                                              Situation Remarks:
                                            </strong>{" "}
                                            {inspection.Remarks || "N/A"}
                                          </div>
                                          <div className="col-md-3 d-flex flex-column justify-content-between">
                                            <div className="text-start">
                                              <strong>Remarks: </strong>{" "}
                                              {inspection.qc_remarks_con ||
                                                "N/A"}{" "}
                                              <br />
                                              <strong>Status: </strong>{" "}
                                              {inspection.qc_con === 2
                                                ? "Approved"
                                                : "Unapproved"}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p>No work kinds available for this span.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No unapproved by RAMS reports available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionListCon;
