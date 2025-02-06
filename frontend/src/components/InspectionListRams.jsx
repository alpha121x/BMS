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
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

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
        setTableData(result.data);
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
        row.ConsultantRemarks?.trim() === "" ? null : row.ConsultantRemarks;

      // Prepare the updated row with ConsultantRemarks and approval status
      const updatedData = {
        id: row.inspection_id,
        RamsRemarks: consultantRemarks, // Can be empty (null)
        approved_by_consultant: row.approved_by_rams,
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
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRamsRemarksChange = (row, value) => {
    // Clone the row and update the ConsultantRemarks field
    const updatedRow = { ...row, RamsRemarks: value };

    // Update the table data without triggering a reload
    setTableData((prevData) =>
      prevData.map((item) => (item.id === row.id ? updatedRow : item))
    );
  };

  const handleApprovedFlagChange = (row, value) => {
    // Clone the row and update the approved_by_consultant field
    const updatedRow = { ...row, approved_by_rams: value };

    // Update the table data without triggering a reload
    setTableData((prevData) =>
      prevData.map((item) => (item.id === row.id ? updatedRow : item))
    );
  };

  const handleSaveChanges = (row) => {
    handleUpdateInspection(row);
  };

  const handleDownloadCSV = (tableData) => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      console.error("No data to export");
      return;
    }

    // Extract BridgeName from the first row of tableData
    const bridgename = tableData[0].BridgeName;

    // Prepare CSV rows without adding the extra "image" column
    const csvRows = tableData.map((row) => {
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

  const handleDownloadExcel = (tableData) => {
    if (!Array.isArray(tableData) || tableData.length === 0) {
      console.error("No data to export");
      return;
    }

    const bridgename = tableData[0].BridgeName;

    // Ensure all rows have a valid value for 'PhotoPaths'
    tableData.forEach((row) => {
      if (Array.isArray(row.PhotoPaths)) {
        // Convert array to JSON string
        row.PhotoPaths = JSON.stringify(row.PhotoPaths) || "No image path";
      } else if (!row.PhotoPaths) {
        row.PhotoPaths = "No image path"; // Default if no path is present
      }
    });

    // Create a worksheet from the table data
    const ws = XLSX.utils.json_to_sheet(tableData);

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

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const buttonStyles = {
    margin: "0 6px",
    padding: "4px 8px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    buttons.push(
      <Button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        key="prev"
        style={buttonStyles}
      >
        «
      </Button>
    );

    buttons.push(
      <Button
        key="1"
        onClick={() => handlePageChange(1)}
        style={{
          ...buttonStyles,
          backgroundColor: currentPage === 1 ? "#3B82F6" : "#60A5FA",
        }}
      >
        1
      </Button>
    );

    const pageRange = 3;
    let startPage = Math.max(currentPage - pageRange, 2);
    let endPage = Math.min(currentPage + pageRange, totalPages - 1);

    if (totalPages <= 7) {
      startPage = 2;
      endPage = totalPages - 1;
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <Button
          key={page}
          onClick={() => handlePageChange(page)}
          style={{
            ...buttonStyles,
            backgroundColor: currentPage === page ? "#3B82F6" : "#60A5FA",
          }}
        >
          {page}
        </Button>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{
            ...buttonStyles,
            backgroundColor: currentPage === totalPages ? "#3B82F6" : "#60A5FA",
          }}
        >
          {totalPages}
        </Button>
      );
    }

    buttons.push(
      <Button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        key="next"
        style={buttonStyles}
      >
        »
      </Button>
    );

    return buttons;
  };

  // Group the inspection data by SpanIndex and then by WorkKind
  const groupedData = currentData.reduce((acc, row) => {
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
        <h6
          className="card-title text-lg font-semibold pb-2"
          style={{ fontSize: "1.25rem" }}
        >
          Condition Assessment Reports
        </h6>

        <div className="summary-section mt-1 mb-2">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <tbody>
              {/* Unique Span Indices */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Spans:</strong>
                </td>
                <td className="border px-4 py-2">
                  {getUniqueSpanIndices(tableData)}
                </td>
              </tr>

                {/* Unique Damage Leves */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Spans:</strong>
                </td>
                <td className="border px-4 py-2">
                  {getDamageLevel(tableData)}
                </td>
              </tr>

              {/* Materials Used */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Materials Used:</strong>
                </td>
                <td className="border px-4 py-2">{getMaterials(tableData)}</td>
              </tr>

              {/* Work Kind */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Work Kind:</strong>
                </td>
                <td className="border px-4 py-2">{getWorkKind(tableData)}</td>
              </tr>

              {/* Condition Status */}
              <tr>
                <td className="border px-4 py-2">
                  <strong>Consultant Approval Status:</strong>
                </td>
                <td className="border px-4 py-2">
                  {getApprovalStatus(tableData)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Toggle buttons for old and new inspections */}
        <div className="d-flex mb-3">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 mr-2"
            onClick={() => handleDownloadCSV(tableData)}
          >
            <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
            CSV
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
            onClick={() => handleDownloadExcel(tableData)}
          >
            <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
            Excel
          </button>
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
            <div
              key={spanIndex}
              className="card"
              style={{ marginBottom: "20px" }}
            >
              <div
                className="card-header"
                style={{ backgroundColor: "#f5f5f5", padding: "10px" }}
              >
                <h5>{`Span No: ${spanIndex}`}</h5>
              </div>
              <div className="card">
                <div className="card-body">
                  {Object.keys(groupedData[spanIndex]).map((workKind) => (
                    <div
                      key={workKind}
                      style={{
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        padding: "8px",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
                        Work Kind: {workKind}
                      </div>

                      {groupedData[spanIndex][workKind].map((row, index) => (
                        <div
                          key={index}
                          className="inspection-item"
                          style={{
                            marginBottom: "8px",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              columnGap: "12px",
                              rowGap: "8px",
                            }}
                          >
                            <div>
                              <strong className="custom-label">Parts:</strong>{" "}
                              {row.PartsName || "N/A"}
                            </div>
                            <div>
                              <strong className="custom-label">
                                Material:
                              </strong>{" "}
                              {row.MaterialName || "N/A"}
                            </div>
                            <div>
                              <strong className="custom-label">Damage:</strong>{" "}
                              {row.DamageKindName || "N/A"}
                            </div>
                            <div>
                              <strong className="custom-label">Level:</strong>{" "}
                              {row.DamageLevel || "N/A"}
                            </div>
                            <div>
                              <strong className="custom-label">Remarks:</strong>{" "}
                              {row.Remarks || "N/A"}
                            </div>
                            <div>
                              <strong className="custom-label">
                                Rams Remarks:
                              </strong>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={row.RamsRemarks || ""}
                                onChange={(e) =>
                                  handleConsultantRemarksChange(
                                    row,
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* Approved Flag Toggle */}
                            <div>
                              <strong className="custom-label">
                                Rams Approval Status:
                              </strong>
                              <Form.Select
                                value={row.approved_by_rams || 0}
                                onChange={(e) =>
                                  handleApprovedFlagChange(
                                    row,
                                    parseInt(e.target.value)
                                  )
                                }
                              >
                                <option value={0}>Unapproved</option>
                                <option value={1}>Approved</option>
                              </Form.Select>
                            </div>
                            {/* Save Changes Button */}
                            <div>
                              <Button
                                onClick={() => handleSaveChanges(row)}
                                style={{
                                  backgroundColor: "#4CAF50",
                                  border: "none",
                                  color: "white",
                                }}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>

                          {/* Photos Section */}
                          {row.PhotoPaths && row.PhotoPaths.length > 0 && (
                            <div style={{ marginTop: "8px" }}>
                              <strong>Photos:</strong>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, 80px)",
                                  gap: "6px",
                                  marginTop: "6px",
                                }}
                              >
                                {row.PhotoPaths.map((photo, photoIndex) => (
                                  <a
                                    key={photoIndex}
                                    href={photo} // Full image link
                                    data-fancybox="gallery" // Enables lightbox functionality
                                    data-caption={`Photo ${photoIndex + 1}`}
                                  >
                                    <img
                                      src={photo}
                                      alt={`Photo ${photoIndex + 1}`}
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        border: "1px solid gray",
                                      }}
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between">
          <div className="text-sm text-gray-500">
            Showing {currentData.length} of {tableData.length} inspections
          </div>
          <div className="d-flex justify-content-center align-items-center">
            {renderPaginationButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionList;
