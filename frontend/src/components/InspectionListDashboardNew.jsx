import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faPlusCircle,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

const InspectionList = ({ bridgeId }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inspectionType, setInspectionType] = useState("new"); // "new" or "old"

  const itemsPerPage = 10;

  useEffect(() => {
    if (bridgeId) {
      fetchData();
    }
  }, [bridgeId, inspectionType]); // Refetch when inspectionType changes

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) {
        throw new Error("bridgeId is required");
      }

      const typeQuery = inspectionType === "new" ? "new" : "old";
      const response = await fetch(
        `${BASE_URL}/api/get-inspections?bridgeId=${bridgeId}&type=${typeQuery}`
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
        row.PhotoPaths = JSON.stringify(row.PhotoPaths) || 'No image path';
      } else if (!row.PhotoPaths) {
        row.PhotoPaths = 'No image path'; // Default if no path is present
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
  

  const handleEditClick = (row) => {
    const serializedRow = encodeURIComponent(JSON.stringify(row));
    const editUrl = `/EditInspectionNew?data=${serializedRow}`;
    window.location.href = editUrl;
  };

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

        {/* Toggle buttons for old and new inspections */}
        <div className="d-flex mb-3">
          <Button
            onClick={() => setInspectionType("new")}
            style={{
              backgroundColor: inspectionType === "new" ? "#3B82F6" : "#60A5FA",
            }}
            className="mr-2" // Added margin-right to add space between the buttons
          >
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            New Inspections
          </Button>
          <Button
            onClick={() => setInspectionType("old")}
            style={{
              backgroundColor: inspectionType === "old" ? "#3B82F6" : "#60A5FA",
            }}
            className="mr-2" // Added margin-right to add space between the buttons
          >
            <FontAwesomeIcon icon={faHistory} className="mr-2" />
            Old Inspections
          </Button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 mr-2" // Added margin-right
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
                <h5>{`Span Index: ${spanIndex}`}</h5>
              </div>
              <div className="card">
                <div className="card-body">
                  {Object.keys(groupedData[spanIndex]).map((workKind) => (
                    <div
                      key={workKind}
                      style={{
                        marginBottom: "10px", // Reduced margin
                        border: "1px solid #ddd",
                        padding: "8px", // Reduced padding
                        borderRadius: "8px",
                      }}
                    >
                      {Object.keys(groupedData[spanIndex]).map((workKind) => (
                        <div
                          key={workKind}
                          style={{
                            marginBottom: "10px", // Reduced margin
                            border: "1px solid #ddd",
                            padding: "8px", // Reduced padding
                            borderRadius: "8px",
                          }}
                        >
                          {/* Work Kind Label without header style */}
                          <div
                            style={{ marginBottom: "8px", fontWeight: "bold" }}
                          >
                            Work Kind: {workKind}
                          </div>

                          {groupedData[spanIndex][workKind].map(
                            (row, index) => (
                              <div
                                key={index}
                                className="inspection-item"
                                style={{
                                  marginBottom: "8px", // Reduced margin between items
                                  borderBottom: "1px solid #ddd",
                                  paddingBottom: "8px", // Reduced padding at the bottom of each item
                                }}
                              >
                                {/* Grid Layout: Displaying 4 details per row */}
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4, 1fr)", // 4 columns of equal width
                                    columnGap: "12px", // Space between columns
                                    rowGap: "8px", // Space between rows
                                  }}
                                >
                                  {/* Row 1 */}
                                  <div>
                                    <strong>Parts:</strong>{" "}
                                    {row.PartsName || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Material:</strong>{" "}
                                    {row.MaterialName || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Damage:</strong>{" "}
                                    {row.DamageKindName || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Level:</strong>{" "}
                                    {row.DamageLevel || "N/A"}
                                  </div>

                                  {/* Row 2 */}
                                  {/* <div>
                                    <strong>Inspector:</strong>{" "}
                                    {row.Inspector || "N/A"}
                                  </div> */}
                                  {/* <div>
                                    <strong>Inspection Date:</strong>{" "}
                                    {row.InspectationDate || "N/A"}
                                  </div> */}
                                  <div>
                                    <strong>Remarks:</strong>{" "}
                                    {row.Remarks || "N/A"}
                                  </div>
                                  {/* <div>
                                    <strong>Status:</strong>{" "}
                                    {row.ApprovedFlag === 0
                                      ? "Unapproved"
                                      : row.ApprovedFlag || "N/A"}
                                  </div> */}
                                </div>

                                {/* Photos Section */}
                                {row.PhotoPaths &&
                                  row.PhotoPaths.length > 0 && (
                                    <div style={{ marginTop: "8px" }}>
                                      <strong>Photos:</strong>
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns:
                                            "repeat(auto-fill, 80px)", // Dynamically fit images
                                          gap: "6px", // Gap between photos
                                          marginTop: "6px",
                                        }}
                                      >
                                        {row.PhotoPaths.map(
                                          (photo, photoIndex) => (
                                            <img
                                              key={photoIndex}
                                              src={photo}
                                              alt={`Photo ${photoIndex + 1}`}
                                              style={{
                                                width: "80px",
                                                height: "80px",
                                                objectFit: "cover",
                                                borderRadius: "5px",
                                              }}
                                            />
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {/* Edit Button */}
                                {/* <div style={{ marginTop: "8px" }}>
                                  <Button
                                    onClick={() => handleEditClick(row)}
                                    style={{
                                      backgroundColor: "#4CAF50",
                                      border: "none",
                                      color: "white",
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </div> */}
                              </div>
                            )
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
