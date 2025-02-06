import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import "@fancyapps/ui/dist/fancybox/fancybox.css"; // Try this if `styles` path doesn't work
import { Fancybox } from "@fancyapps/ui";

const InspectionList = ({ bridgeId }) => {
  const [inspectiondata, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bridgeId) {
      fetchData();
    }
  }, [bridgeId]); // Refetch when inspectionType changes

  useEffect(() => {
    Fancybox.bind("[data-fancybox='gallery']", {});

    // Cleanup Fancybox when the component unmounts
    return () => Fancybox.destroy();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) {
        throw new Error("bridgeId is required");
      }

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
  };

  const handleUpdateInspection = async (row) => {
    try {
      console.log("Updating inspection", row);

      // Allow empty remarks (send as null if empty)
      const consultantRemarks =
        row.consultant_remarks?.trim() === "" ? null : row.consultant_remarks;

      // Prepare the updated row with ConsultantRemarks and approval status
      const updatedData = {
        id: row.inspection_id,
        consultantRemarks: consultantRemarks, // Can be empty (null)
        approved_by_consultant: row.approved_by_consultant,
      };

      console.log(updatedData);
      // return;

      // Call the API to update the database
      const response = await fetch(`${BASE_URL}/api/update-inspection`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update inspection");

      // Refetch data to reflect changes
      fetchData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleConsultantRemarksChange = (row, value) => {
    // Clone the row and update the ConsultantRemarks field
    const updatedRow = { ...row, consultant_remarks: value };

    // Update the table data without triggering a reload
    setinspectiondata((prevData) =>
      prevData.map((item) => (item.id === row.id ? updatedRow : item))
    );
  };

  const handleApprovedFlagChange = (row, value) => {
    // Clone the row and update the approved_by_consultant field
    const updatedRow = { ...row, approved_by_consultant: value };

    // Update the table data without triggering a reload
    setinspectiondata((prevData) =>
      prevData.map((item) => (item.id === row.id ? updatedRow : item))
    );
  };

  const handleSaveChanges = (row) => {
    handleUpdateInspection(row);
  };

  const handleDownloadCSV = (inspectiondata) => {
    if (!Array.isArray(inspectiondata) || inspectiondata.length === 0) {
      console.error("No data to export");
      return;
    }

    // Extract BridgeName from the first row of inspectiondata
    const bridgename = inspectiondata[0].BridgeName;

    // Prepare CSV rows without adding the extra "image" column
    const csvRows = inspectiondata.map((row) => {
      const { imageUrl, ...rest } = row; // Exclude imageUrl if it exists
      return rest; // Return the remaining properties
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(csvRows[0]).join(","), // Headers
        ...csvRows.map((row) => Object.values(row).join(",")), // Rows
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${bridgename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = (inspectiondata) => {
    if (!Array.isArray(inspectiondata) || inspectiondata.length === 0) {
      console.error("No data to export");
      return;
    }

    const bridgename = inspectiondata[0].BridgeName;

    // Ensure all rows have a valid value for 'PhotoPaths'
    inspectiondata.forEach((row) => {
      if (Array.isArray(row.PhotoPaths)) {
        // Convert array to JSON string
        row.PhotoPaths = JSON.stringify(row.PhotoPaths) || "No image path";
      } else if (!row.PhotoPaths) {
        row.PhotoPaths = "No image path"; // Default if no path is present
      }
    });

    // Create a worksheet from the table data
    const ws = XLSX.utils.json_to_sheet(inspectiondata);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inspections");
    // console.log(wb);

    // Generate and download the Excel file
    XLSX.writeFile(wb, `${bridgename}.xlsx`);
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

  // const handleEditClick = (row) => {
  //   const serializedRow = encodeURIComponent(JSON.stringify(row));
  //   const editUrl = `/EditInspectionNew?data=${serializedRow}`;
  //   window.location.href = editUrl;
  // };

  // Group the inspection data by SpanIndex and then by WorkKind
  const groupedData = inspectiondata.reduce((acc, row) => {
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
      className="card p-2 rounded-lg text-black"
      style={{
        background: "#FFFFFF",
        border: "2px solid #60A5FA",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
      <div className="card-body pb-0">
        <div className="d-flex mb-4 justify-content-between items-center p-4 bg-[#CFE2FF] rounded-lg shadow-md">
          <h6
            className="card-title text-lg font-semibold pb-2"
            style={{ fontSize: "1.25rem" }}
          >
            Condition Assessment Reports
          </h6>
          <div className="d-flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
              onClick={() => handleDownloadCSV(inspectiondata)}
            >
              <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              CSV
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
              onClick={() => handleDownloadExcel(inspectiondata)}
            >
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              Excel
            </button>
          </div>
        </div>

        <div className="summary-section mt-1 mb-2">
          <table className="min-w-full bg-gray-300 table-auto border-collapse border border-gray-200">
            <tbody>
              {/* Unique Span Indices */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Spans:</strong>
                </td>
                <td className="border px-4 py-2">
                  {getUniqueSpanIndices(inspectiondata)}
                </td>
              </tr>

              {/* Unique Damage Leves */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Damage Levels:</strong>
                </td>
                <td className="border px-4 py-2">
                  {getDamageLevel(inspectiondata)}
                </td>
              </tr>

              {/* Materials Used */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Materials Used:</strong>
                </td>
                <td className="border px-4 py-2">{getMaterials(inspectiondata)}</td>
              </tr>

              {/* Work Kind */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Work Kind:</strong>
                </td>
                <td className="border px-4 py-2">{getWorkKind(inspectiondata)}</td>
              </tr>

              {/* Condition Status */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Consultant Approval Status:</strong>
                </td>
                <td className="border px-4 py-2">
                  {getApprovalStatus(inspectiondata)}
                </td>
              </tr>
            </tbody>
          </table>
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
            <div key={spanIndex} className="card mb-4">
              {/* Accordion for Span Index */}
              <div className="accordion" id={`accordion-span-${spanIndex}`}>
                {/* Accordion Item: Span Index */}
                <div className="accordion-item">
                  <h2
                    className="accordion-header"
                    id={`heading-span-${spanIndex}`}
                  >
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-span-${spanIndex}`}
                      aria-expanded="false" // Set to false for collapse by default
                      aria-controls={`collapse-span-${spanIndex}`}
                    >
                      <strong>Span No: {spanIndex}</strong>
                    </button>
                  </h2>

                  {/* Accordion Body for Work Kinds */}
                  <div
                    id={`collapse-span-${spanIndex}`}
                    className="accordion-collapse collapse" // Removed the 'show' class
                    aria-labelledby={`heading-span-${spanIndex}`}
                    data-bs-parent={`#accordion-span-${spanIndex}`}
                  >
                    <div className="accordion-body">
                      {/* Mapping Work Kinds */}
                      {groupedData[spanIndex] &&
                        Object.keys(groupedData[spanIndex]).map((workKind) => (
                          <div
                            key={workKind}
                            className="card mb-4 border shadow-sm"
                          >
                            {/* Header: Work Kind */}
                            <div className="card-header bg-primary text-white fw-bold">
                              {workKind}
                            </div>

                            {/* Body: Mapping Inspections */}
                            <div className="card-body p-3">
                              {groupedData[spanIndex][workKind] &&
                                groupedData[spanIndex][workKind].map(
                                  (inspection) => (
                                    <div
                                      key={inspection.id}
                                      className="mb-4 p-4 border rounded shadow-sm"
                                      style={{ backgroundColor: "#CFE2FF" }}
                                    >
                                      <div className="row">
                                        {/* Left: Photos */}
                                        <div className="col-md-3">
                                          {inspection.PhotoPaths?.length >
                                            0 && (
                                            <div className="d-flex flex-wrap gap-2">
                                              {inspection.PhotoPaths.map(
                                                (photo, i) => (
                                                  <a
                                                    key={i}
                                                    href={photo}
                                                    data-fancybox="gallery"
                                                    data-caption={`Photo ${
                                                      i + 1
                                                    }`}
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
                                                )
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {/* Right: Details */}
                                        <div className="col-md-6">
                                          <strong>Parts:</strong>{" "}
                                          {inspection.PartsName || "N/A"} <br />
                                          <strong>Material:</strong>{" "}
                                          {inspection.MaterialName || "N/A"}{" "}
                                          <br />
                                          <strong>Damage:</strong>{" "}
                                          {inspection.DamageKindName || "N/A"}{" "}
                                          <br />
                                          <strong>Level:</strong>{" "}
                                          {inspection.DamageLevel || "N/A"}{" "}
                                          <br />
                                          <strong>
                                            Situation Remarks:
                                          </strong>{" "}
                                          {inspection.Remarks || "N/A"}
                                        </div>

                                        {/* Footer: Consultant Remarks, Approval & Save Button */}
                                        <div className="col-md-3 d-flex flex-column justify-content-between">
                                          {/* Consultant Remarks Input */}
                                          <Form.Control
                                            as="input"
                                            type="text"
                                            placeholder="Consultant Remarks"
                                            value={
                                              inspection.consultant_remarks ||
                                              ""
                                            }
                                            onChange={(e) =>
                                              handleConsultantRemarksChange(
                                                inspection,
                                                e.target.value
                                              )
                                            }
                                            className="mb-2"
                                          />

                                          {/* Approval Status Dropdown */}
                                          <Form.Select
                                            value={
                                              inspection.approved_by_consultant ||
                                              0
                                            }
                                            onChange={(e) =>
                                              handleApprovedFlagChange(
                                                inspection,
                                                parseInt(e.target.value)
                                              )
                                            }
                                            className="mb-2"
                                          >
                                            <option value={0}>
                                              Unapproved
                                            </option>
                                            <option value={1}>Approved</option>
                                          </Form.Select>

                                          {/* Save Changes Button */}
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
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspectionList;
