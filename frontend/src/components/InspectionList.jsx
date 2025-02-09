import React, { useEffect, useState, useMemo } from "react";
import { useCallback } from "react";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import "@fancyapps/ui/dist/fancybox/fancybox.css"; // Try this if `styles` path doesn't work
import { Fancybox } from "@fancyapps/ui";
import Swal from "sweetalert2";

const InspectionList = ({ bridgeId }) => {
  const [inspectiondata, setInspectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

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
      const consultantRemarks =
        row.qc_remarks_con?.trim() === "" ? null : row.qc_remarks_con;

      // Prepare the updated row with ConsultantRemarks and approval status
      const updatedData = {
        id: row.inspection_id,
        qc_remarks_con: consultantRemarks, // Can be empty (null)
        qc_con: row.qc_con,
      };

      console.log(updatedData);

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

  const handleDownloadCSV = (inspectiondata) => {
    try {
      if (!Array.isArray(inspectiondata) || inspectiondata.length === 0) {
        console.error("No data to export");
        return;
      }
  
      // Define the fields you want to include in the CSV
      const fieldsToInclude = {
        'bridge_name': 'BridgeName',
        'SpanIndex': 'Span',
        'PartsName': 'Parts',
        'MaterialName': 'Material',
        'DamageKindName': 'Damage Type',
        'DamageLevel': 'Damage Level',
        'Remarks': 'Situation Remarks',
        'qc_remarks_con': 'Consultant Remarks',
        'qc_con': 'Consultant Approval Status'
      };
  
      // Extract BridgeName from the first row of inspectiondata
      const bridgename = inspectiondata[0].bridge_name || 'bridge_inspection';
  
      // Prepare CSV rows with only selected fields
      const csvRows = inspectiondata.map(row => {
        const filteredRow = {};
        Object.entries(fieldsToInclude).forEach(([key, label]) => {
          // Handle approval status text
          if (key === 'qc_con') {
            filteredRow[label] = row[key] === 2 ? 'Approved' : 
                                row[key] === 3 ? 'Unapproved' : 'Pending';
          } else {
            filteredRow[label] = row[key] || 'N/A';
          }
        });
        return filteredRow;
      });
  
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          Object.values(fieldsToInclude).join(","), // Custom Headers
          ...csvRows.map(row => 
            Object.values(row)
              .map(value => 
                // Handle values that contain commas
                String(value).includes(',') ? `"${value}"` : value
              )
              .join(",")
          ),
        ].join("\n");
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${bridgename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (error) {
      console.error("Error downloading CSV:", error);
      Swal.fire("Error!", "Failed to download CSV file", "error");
    }
  };

  const handleDownloadExcel = async (inspectiondata) => {
    if (!Array.isArray(inspectiondata) || inspectiondata.length === 0) {
      console.error("No data to export");
      return;
    }

    const bridgename = inspectiondata[0].bridge_name;

    // Define the fields you want to include in the Excel
    const fieldsToInclude = {
      'bridge_name': 'BridgeName',
      'SpanIndex': 'Span',
      'PartsName': 'Parts',
      'MaterialName': 'Material',
      'DamageKindName': 'Damage Type',
      'DamageLevel': 'Damage Level',
      'Remarks': 'Situation Remarks',
      'qc_remarks_con': 'Consultant Remarks',
      'qc_con': 'Consultant Approval Status',
      'PhotoPaths': 'Image URLs' // Include photo paths as text
    };

    // Process each row's data
    const processedData = inspectiondata.map(row => {
      // Filter the row data according to fieldsToInclude
      const filteredRow = {};
      Object.entries(fieldsToInclude).forEach(([key, label]) => {
        if (key === 'qc_con') {
          filteredRow[label] = row[key] === 2 ? 'Approved' : 
                              row[key] === 3 ? 'Unapproved' : 'Pending';
        } else if (key === 'PhotoPaths') {
          // Handle photo paths - convert array to readable string
          filteredRow[label] = Array.isArray(row[key]) 
            ? row[key].join('\n') 
            : 'No image path';
        } else {
          filteredRow[label] = row[key] || 'N/A';
        }
      });
      
      return filteredRow;
    });

    // Create worksheet with filtered data
    const ws = XLSX.utils.json_to_sheet(processedData);

    // Set column widths
    ws['!cols'] = Object.keys(fieldsToInclude).map(() => ({ width: 20 }));

    // Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inspections");

    // Generate and download Excel file
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

  // const getApprovalStatus = (data) => {
  //   const approved = data.filter(
  //     (item) => item.approved_by_consultant === "1"
  //   ).length;
  //   const unapproved = data.filter(
  //     (item) => item.approved_by_consultant === "0"
  //   ).length;
  //   return `Approved: ${approved}, Unapproved: ${unapproved}`;
  // };

  const getUniqueSpanIndices = (data) => {
    // Extracting all SpanIndex values from the data
    const spanIndices = data.map((item) => item.SpanIndex);

    // Using Set to filter out duplicates and get unique values
    const uniqueSpanIndices = [...new Set(spanIndices)];

    return uniqueSpanIndices.length; // Return the count of unique span indices
  };

  const groupedData = useMemo(() => {
    return inspectiondata.reduce((acc, row) => {
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
  }, [inspectiondata]);

  // Toggle function to expand/collapse a section
  const toggleSection = (spanIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [spanIndex]: !prev[spanIndex], // Toggle the section
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

        <div className="inspection-cards-container">
          {Object.keys(groupedData).map((spanIndex) => (
            <div key={`span-${spanIndex}`} className="card mb-4">
              {/* Span Index Header with Toggle Button */}
              <div
                className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                onClick={() => toggleSection(spanIndex)}
                style={{ cursor: "pointer" }}
              >
                <strong>Reports For Span: {spanIndex}</strong>
                <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
              </div>

              {/* Work Kinds for Each Span - Toggle Visibility */}
              {expandedSections[spanIndex] && (
                <div className="card-body">
                  {Object.keys(groupedData[spanIndex]).map((workKind) => (
                    <div
                      key={`workKind-${spanIndex}-${workKind}`}
                      className="card mb-4 border shadow-sm"
                    >
                      <div className="card-header bg-secondary text-white fw-bold">
                        {workKind}
                      </div>

                      {/* Mapping Inspections */}
                      <div className="card-body p-3">
                        {groupedData[spanIndex][workKind].map(
                          (inspection, index) => (
                            <div
                              key={`inspection-${inspection.id || index}`}
                              className="mb-4 p-4 border rounded shadow-sm"
                              style={{ backgroundColor: "#CFE2FF" }}
                            >
                              <div className="row">
                                {/* Left: Photos */}
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

                                {/* Right: Details */}
                                <div className="col-md-6">
                                  <strong>Parts:</strong>{" "}
                                  {inspection.PartsName || "N/A"} <br />
                                  <strong>Material:</strong>{" "}
                                  {inspection.MaterialName || "N/A"} <br />
                                  <strong>Damage:</strong>{" "}
                                  {inspection.DamageKindName || "N/A"} <br />
                                  <strong>Level:</strong>{" "}
                                  {inspection.DamageLevel || "N/A"} <br />
                                  <strong>Situation Remarks:</strong>{" "}
                                  {inspection.Remarks || "N/A"}
                                </div>

                                {/* Footer: Consultant Remarks, Approval & Save Button */}
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
                                    value={inspection.qc_con || ""}
                                    onChange={(e) =>
                                      handleApprovedFlagChange(
                                        inspection.inspection_id,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="mb-2"
                                  >
                                    <option value={""}>Select Status</option>
                                    <option value={3}>Unapproved</option>
                                    <option value={2}>Approved</option>
                                  </Form.Select>

                                  <Button
                                    onClick={() =>
                                      handleSaveChanges(inspection)
                                    }
                                    value={inspection.reviewed_by}
                                    className="bg-[#CFE2FF]"
                                    disabled={inspection.reviewed_by === 1}
                                  >
                                    Save Changes {inspection.reviewd_by}
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspectionList;
