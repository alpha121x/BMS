import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";

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
     setLoading(true); // Start loader
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
       const bridgeName = summaryData[0]?.bridge_name || "bridge_inspection";
 
       const workbook = new ExcelJS.Workbook();
       const worksheet = workbook.addWorksheet("Inspections");
 
       // Define all columns except images
       const columnKeys = Object.keys(summaryData[0]).filter(
         (key) => key !== "Overview Photos" && key !== "PhotoPaths"
       );
 
       const columns = columnKeys.map((key) => ({
         header: key.replace(/_/g, " "),
         key: key,
         width: 22,
       }));
 
       // Add image columns with increased spacing
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
 
       // Define worksheet columns
       worksheet.columns = columns;
 
       // Style the header row (first row)
       worksheet.getRow(1).font = { bold: true, size: 14 }; // Bold text and increased font size
       worksheet.getRow(1).alignment = {
         vertical: "middle",
         horizontal: "center",
       }; // Center align text
       worksheet.getRow(1).height = 25; // Increase row height for better visibility
 
       // Add data rows without image URLs
       for (let i = 0; i < summaryData.length; i++) {
         const item = summaryData[i];
 
         // Extract & fix image URLs (replacing backslashes with forward slashes)
         const overviewPhotos = (item["Overview Photos"] || []).map((url) =>
           url.replace(/\\/g, "/")
         );
         const inspectionPhotos = (item["PhotoPaths"] || []).map((url) =>
           url.replace(/\\/g, "/")
         );
 
         // Add normal data (excluding image URLs)
         const rowData = {};
         columnKeys.forEach((key) => (rowData[key] = item[key] || ""));
 
         // Add a row for each entry
         const rowIndex = worksheet.addRow(rowData).number;
 
         // **Adjust row height for images to fit properly**
         worksheet.getRow(rowIndex).height = 90;
 
         // Function to insert images in the correct locations
         const insertImage = async (photoUrls, columnOffset, rowHeight) => {
           for (let j = 0; j < photoUrls.length && j < 5; j++) {
             try {
               // Fetch image data from the URL
               const imgResponse = await fetch(photoUrls[j]);
               const imgBlob = await imgResponse.blob();
               const arrayBuffer = await imgBlob.arrayBuffer();
 
               // Add image to the workbook
               const imageId = workbook.addImage({
                 buffer: arrayBuffer,
                 extension: "jpeg",
               });
 
               // **Insert image in the correct column**
               // - `tl.col`: Column position, starting from normal data columns + offset
               // - `tl.row`: Row position (adjusted for zero-based index)
               // - `ext.width`: Width of the inserted image (150px for better visibility)
               // - `ext.height`: Height of the inserted image (90px for consistency)
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
 
         // Insert Overview Photos (5 max)
         await insertImage(overviewPhotos, 0, 90);
 
         // Insert Inspection Photos (5 max)
         await insertImage(inspectionPhotos, 5, 90);
       }
 
       // Save File
       const buffer = await workbook.xlsx.writeBuffer();
       saveAs(new Blob([buffer]), `${bridgeName.replace(/\s+/g, "_")}.xlsx`);
     } catch (error) {
       console.error("Error downloading Excel:", error);
       Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
     } finally {
       setLoading(false); // Stop loader
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
                  {getUniqueSpanIndices(inspectionData)}
                </p>
              </div>
              <div>
                <strong>Damage Levels:</strong>
                <p className="text-gray-700">
                  {getDamageLevel(inspectionData)}
                </p>
              </div>
              <div>
                <strong>Materials Used:</strong>
                <p className="text-gray-700">{getMaterials(inspectionData)}</p>
              </div>
              <div>
                <strong>Work Kind:</strong>
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
            <div key={spanIndex} className="card mb-4">
              {/* Span Index Dropdown */}
              <div
                className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => toggleAccordion(spanIndex)}
              >
                <h5 className="mb-0">{`Reeports For Span: ${spanIndex}`}</h5>
                <span>{openAccordions[spanIndex] ? "▼" : "▶"}</span>
              </div>

              {/* Content - Only visible if expanded */}
              {openAccordions[spanIndex] && (
                <div className="card-body">
                  {Object.keys(groupedData[spanIndex]).map((workKind) => (
                    <div key={workKind} className="card mb-4 border shadow-sm">
                      <div className="card-header bg-secondary text-white fw-bold">
                        {workKind}
                      </div>

                      <div className="card-body p-3">
                        {groupedData[spanIndex][workKind]?.map((inspection) => (
                          <div
                            key={inspection.id}
                            className="mb-4 p-4 border rounded shadow-sm"
                            style={{ backgroundColor: "#CFE2FF" }}
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
                        ))}
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
