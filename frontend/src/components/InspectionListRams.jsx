import React, { useEffect, useState, useMemo } from "react";
import { useCallback } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const InspectionListRams = ({ bridgeId }) => {
  const [pendingData, setPendingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [unapprovedData, setUnapprovedData] = useState([]);
  const [summaryData, setsummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeDiv, setActiveDiv] = useState("pending"); // Default to Pending Reports
  const [selectedPhoto, setSelectedPhoto] = useState(null);
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
        `${BASE_URL}/api/get-inspections-rams?bridgeId=${bridgeId}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (result.success) {
        // Generalized function for grouping
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

        // Grouping the data separately
        setPendingData(groupBySpanAndWorkKind(result.data.pending));
        setApprovedData(groupBySpanAndWorkKind(result.data.approved));
        setUnapprovedData(groupBySpanAndWorkKind(result.data.unapproved));
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
        `${BASE_URL}/api/get-summary?bridgeId=${bridgeId}`
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

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const handleUpdateInspection = async (row) => {
    try {
      // Show confirmation alert using SweetAlert2
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
        return; // Exit if the user cancels the update
      }

      console.log("Updating inspection", row);

      // Allow empty remarks (send as null if empty)
      const ramsRemarks =
        row.qc_remarks_rams?.trim() === "" ? null : row.qc_remarks_rams;

      // Prepare the updated row with ConsultantRemarks and approval status
      const updatedData = {
        id: row.inspection_id,
        qc_remarks_rams: ramsRemarks, // Can be empty (null)
        qc_rams: row.qc_rams,
      };

      console.log(updatedData);

      // Call the API to update the database
      const response = await fetch(`${BASE_URL}/api/update-inspection-rams`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update inspection");

      // Refetch data to reflect changes
      fetchData();

      // Show success alert after updating
      Swal.fire({
        title: "Updated!",
        text: "Your inspection has been updated.",
        icon: "success",
        confirmButtonColor: "#0D6EFD", // Custom OK button color
      });
    } catch (error) {
      setError(error.message);
      // Show error alert if the update fails
      Swal.fire("Error!", error.message, "error");
    }
  };

  const handleRamsRemarksChange = (
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
            ? { ...item, qc_remarks_rams: value }
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
            ? { ...item, qc_rams: value }
            : item
        ),
      },
    }));
  };

  const handleSaveChanges = (row) => {
    handleUpdateInspection(row);
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

      const summaryData = data.bridges;
      const bridgeName = summaryData[0].bridge_name || "bridge_inspection";

      const headers = Object.keys(summaryData[0]);

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

      const summaryData = data.bridges;
      const bridgeName = summaryData[0].bridge_name || "bridge_inspection";

      const ws = XLSX.utils.json_to_sheet(summaryData);
      ws["!cols"] = Object.keys(summaryData[0]).map(() => ({ width: 20 }));

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
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
              onClick={() => handleDownloadCSV(bridgeId)}
            >
              <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              CSV
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
              onClick={() => handleDownloadExcel(bridgeId)}
            >
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              Excel
            </button>
          </div>
        </div>

        <div className="summary-section mt-1 mb-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">
            Reports Summary
          </h4>
          <div className="bg-gray-200  mb-2 mt-1  py-2 px-3 rounded-md shadow border">
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div>
                <strong>Total Spans:</strong>
                <p className="text-gray-700">
                  {getUniqueSpanIndices(summaryData)}
                </p>
              </div>
              <div>
                <strong>Damage Levels:</strong>
                <p className="text-gray-700">{getDamageLevel(summaryData)}</p>
              </div>
              <div>
                <strong>Materials Used:</strong>
                <p className="text-gray-700">{getMaterials(summaryData)}</p>
              </div>
              <div>
                <strong>Work Kind:</strong>
                <p className="text-gray-700">{getWorkKind(summaryData)}</p>
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
        </div>
        <div className="border rounded p-3 shadow-lg mt-2">
          {/* Reports Section */}
          {activeDiv === "pending" && (
            <div className="mb-4">
              <h5>Pending Reports</h5>
              {pendingData &&
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
                    {expandedSections[spanIndex] ? (
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
                                                      loading="lazy" // Lazy loading added
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          photoUrl
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
                                            <br />
                                            <strong>
                                              Consultant Remarks:
                                            </strong>{" "}
                                            {inspection.qc_remarks_con || "N/A"}
                                          </div>
                                          <div className="col-md-3 d-flex flex-column justify-content-between">
                                            <Form.Control
                                              as="textarea"
                                              rows={3} // You can adjust the number of rows as per your requirement
                                              placeholder="Rams Remarks"
                                              value={
                                                inspection.qc_remarks_rams || ""
                                              }
                                              onChange={(e) =>
                                                handleRamsRemarksChange(
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
                                                {/* Unapproved Option */}
                                                <Form.Check
                                                  type="radio"
                                                  name={`qc_rams_${inspection.inspection_id}`}
                                                  label="Unapproved"
                                                  value="3"
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

                                                {/* Approved Option */}
                                                <Form.Check
                                                  type="radio"
                                                  name={`qc_rams_${inspection.inspection_id}`}
                                                  label="Approved"
                                                  value="2"
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
                          <p>No data available</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
            </div>
          )}

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
                  style={{ maxWidth: "100%", maxHeight: "80vh" }}
                />
              )}
            </Modal.Body>
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
                                                      loading="lazy" // Lazy loading added
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          photoUrl
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
                                            <br />
                                            <strong>
                                              Consultant Remarks:
                                            </strong>{" "}
                                            {inspection.qc_remarks_con || "N/A"}
                                          </div>
                                          <div className="col-md-3 d-flex flex-column justify-content-between">
                                            <div className="text-start">
                                              <strong>Remarks: </strong>
                                              {inspection.qc_remarks_rams ||
                                                "N/A"}{" "}
                                              <br />
                                              <strong>Status: </strong>
                                              {inspection.qc_rams === 2
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
                <p>No data available</p>
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
                                  {unapprovedData[spanIndex][workKind].length >
                                  0 ? (
                                    unapprovedData[spanIndex][workKind].map(
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
                                                        alt={`Photo ${
                                                          index + 1
                                                        }`}
                                                        className="img-fluid rounded border"
                                                        style={{
                                                          width: "80px",
                                                          height: "80px",
                                                          objectFit: "cover",
                                                          cursor: "pointer",
                                                          flexShrink: 0,
                                                        }}
                                                        loading="lazy" // Lazy loading added
                                                        onClick={() =>
                                                          handlePhotoClick(
                                                            photoUrl
                                                          )
                                                        }
                                                        onError={(e) => {
                                                          e.target.onerror =
                                                            null;
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
                                              {inspection.DamageKindName ||
                                                "N/A"}{" "}
                                              <br />
                                              <strong>Level:</strong>{" "}
                                              {inspection.DamageLevel || "N/A"}{" "}
                                              <br />
                                              <strong>
                                                Damage Extent:
                                              </strong>{" "}
                                              {inspection.damage_extent ||
                                                "N/A"}{" "}
                                              <br />
                                              <strong>
                                                Situation Remarks:
                                              </strong>{" "}
                                              {inspection.Remarks || "N/A"}
                                              <br />
                                              <strong>
                                                Consultant Remarks:
                                              </strong>{" "}
                                              {inspection.qc_remarks_con ||
                                                "N/A"}
                                            </div>
                                            <div className="col-md-3 d-flex flex-column justify-content-between">
                                              <div className="text-start">
                                                <strong>Remarks: </strong>{" "}
                                                {inspection.qc_remarks_rams ||
                                                  "N/A"}{" "}
                                                <br />
                                                <strong>Status: </strong>{" "}
                                                {inspection.qc_rams === 2
                                                  ? "Approved"
                                                  : "Unapproved"}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p>
                                      No inspections available for this work
                                      kind.
                                    </p>
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
        </div>
      </div>
    </div>
  );
};

export default InspectionListRams;
