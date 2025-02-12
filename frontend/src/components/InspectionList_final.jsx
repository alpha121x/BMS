import React, { useEffect, useState, useMemo } from "react";
import { useCallback } from "react";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import Swal from "sweetalert2";

const InspectionList = ({ bridgeId }) => {
  const [inspectiondata, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeStatus, setActiveStatus] = useState(1); // Default to Pending Reports

  useEffect(() => {
    if (bridgeId) {
      fetchData();
    }
  }, [bridgeId]);

  useEffect(() => {
    Fancybox.bind("[data-fancybox='gallery']", {});
    return () => Fancybox.destroy();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) throw new Error("bridgeId is required");

      const response = await fetch(
        `${BASE_URL}/api/get-inspections?bridgeId=${bridgeId}`
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
  }, [bridgeId]);

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

      const consultantRemarks =
        row.qc_remarks_con?.trim() === "" ? null : row.qc_remarks_con;

      const updatedData = {
        id: row.inspection_id,
        qc_remarks_con: consultantRemarks,
        qc_con: row.qc_con,
      };

      const response = await fetch(`${BASE_URL}/api/update-inspection`, {
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

  const handleConsultantRemarksChange = (inspectionId, value) => {
    setInspectionData((prevData) =>
      prevData.map((item) =>
        item.inspection_id === inspectionId
          ? { ...item, qc_remarks_con: value }
          : item
      )
    );
  };

  const handleApprovedFlagChange = (inspectionId, value) => {
    setInspectionData((prevData) =>
      prevData.map((item) =>
        item.inspection_id === inspectionId ? { ...item, qc_con: value } : item
      )
    );
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
    const uniqueSpanIndices = [...new Set(spanIndices)];
    return uniqueSpanIndices.length;
  };

  const { pendingData, approvedData, unapprovedData } = useMemo(() => {
    const grouped = inspectiondata.reduce(
      (acc, row) => {
        const spanKey = row.SpanIndex || "N/A";
        const workKindKey = row.WorkKindName || "N/A";

        if (!acc.pending[spanKey]) acc.pending[spanKey] = {};
        if (!acc.approved[spanKey]) acc.approved[spanKey] = {};
        if (!acc.unapproved[spanKey]) acc.unapproved[spanKey] = {};

        if (!acc.pending[spanKey][workKindKey])
          acc.pending[spanKey][workKindKey] = [];
        if (!acc.approved[spanKey][workKindKey])
          acc.approved[spanKey][workKindKey] = [];
        if (!acc.unapproved[spanKey][workKindKey])
          acc.unapproved[spanKey][workKindKey] = [];

        const status = Number(row.qc_con);
        if (status === 1) acc.pending[spanKey][workKindKey].push(row);
        else if (status === 2) acc.approved[spanKey][workKindKey].push(row);
        else if (status === 3) acc.unapproved[spanKey][workKindKey].push(row);

        return acc;
      },
      { pending: {}, approved: {}, unapproved: {} }
    );

    return {
      pendingData: grouped.pending,
      approvedData: grouped.approved,
      unapprovedData: grouped.unapproved,
    };
  }, [inspectiondata]);

  const [filteredData, setFilteredData] = useState(pendingData);

  useEffect(() => {
    setFilteredData(pendingData);
  }, [pendingData]);

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    if (status === 1) setFilteredData(pendingData);
    else if (status === 2) setFilteredData(approvedData);
    else if (status === 3) setFilteredData(unapprovedData);
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
                  {getUniqueSpanIndices(inspectiondata)}
                </p>
              </div>
              <div>
                <strong>Damage Levels:</strong>
                <p className="text-gray-700">
                  {getDamageLevel(inspectiondata)}
                </p>
              </div>
              <div>
                <strong>Materials Used:</strong>
                <p className="text-gray-700">{getMaterials(inspectiondata)}</p>
              </div>
              <div>
                <strong>Work Kind:</strong>
                <p className="text-gray-700">{getWorkKind(inspectiondata)}</p>
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

        <div className="border rounded p-3 d-flex justify-content-between align-items-center mt-2">
          <Button
            variant="warning"
            className="fw-bold text-grey"
            onClick={() => handleStatusChange(1)}
          >
            View Pending Reports
          </Button>
          <Button
            variant="success"
            className="fw-bold"
            onClick={() => handleStatusChange(2)}
          >
            View Approved Reports
          </Button>
          <Button
            variant="danger"
            className="fw-bold"
            onClick={() => handleStatusChange(3)}
          >
            View Unapproved Reports
          </Button>
        </div>

        <div className="border rounded p-3 shadow-lg mt-2">
          {/* Reports Section */}
          {activeStatus === 1 && (
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
                                      <InspectionCard
                                        key={inspection.inspection_id}
                                        inspection={inspection}
                                      />
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

          {activeStatus === 2 && (
            <div className="mb-4">
              <h5>Approved Reports</h5>
              {approvedData &&
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
                    {expandedSections[spanIndex] ? (
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
                                      <InspectionCard
                                        key={inspection.inspection_id}
                                        inspection={inspection}
                                      />
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

          {activeStatus === 3 && (
            <div className="mb-4">
              <h5>Unapproved Reports</h5>
              {unapprovedData &&
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
                    {expandedSections[spanIndex] ? (
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
                                      <InspectionCard
                                        key={inspection.inspection_id}
                                        inspection={inspection}
                                      />
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
        </div>
      </div>
    </div>
  );
};

const InspectionCard = ({ inspection }) => {
  return (
    <div
      className="border rounded p-4 shadow-sm mb-3"
      style={{ backgroundColor: "#CFE2FF" }}
    >
      <div className="row">
        <div className="col-md-3">
          {inspection.PhotoPaths?.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {inspection.PhotoPaths.map((photo, i) => (
                <a
                  key={`photo-${inspection.id}-${i}`}
                  href={photo}
                  data-fancybox="gallery"
                  data-caption={`Photo ${i + 1}`}
                >
                  <img
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    className="img-fluid rounded border"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="col-md-6">
          <strong>Parts:</strong> {inspection.PartsName || "N/A"} <br />
          <strong>Material:</strong> {inspection.MaterialName || "N/A"} <br />
          <strong>Damage:</strong> {inspection.DamageKindName || "N/A"} <br />
          <strong>Level:</strong> {inspection.DamageLevel || "N/A"} <br />
          <strong>Situation Remarks:</strong> {inspection.Remarks || "N/A"}
        </div>

        <div className="col-md-3 d-flex flex-column justify-content-between">
          <Form.Control
            as="input"
            type="text"
            placeholder="Consultant Remarks"
            value={inspection.qc_remarks_con || ""}
            onChange={(e) =>
              handleConsultantRemarksChange(
                inspection.inspection_id,
                e.target.value
              )
            }
            className="mb-2"
          />

          <Form.Select
            value={inspection.qc_con}
            onChange={(e) =>
              handleApprovedFlagChange(
                inspection.inspection_id,
                parseInt(e.target.value)
              )
            }
            className="mb-2"
          >
            <option value={1}>Select Status</option>
            <option value={3}>Unapproved</option>
            <option value={2}>Approved</option>
          </Form.Select>

          <Button
            onClick={() => handleSaveChanges(inspection)}
            value={inspection.reviewed_by}
            className="bg-[#CFE2FF]"
            disabled={inspection.reviewed_by === 1}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InspectionList;
