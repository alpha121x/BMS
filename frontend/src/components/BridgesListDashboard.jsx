import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import "./BridgeList.css";
import Papa from "papaparse"; // Import papaparse
import InventoryInfoDashboard from "./InventoryInfoDashboard"; // Import the InventoryInfo component
import InspectionListDashboard from "./InspectionListDashboard";
import MapModal from "./MapModal"; // Adjust the import path as needed
import { FaSpinner } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa6";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import "leaflet/dist/leaflet.css";
import Map from "./Map"; // Adjust the import path as needed
import FilterComponent from "./FilterComponent";

const BridgesListDashboard = ({
  districtId,
  setDistrictId,
  structureType,
  setStructureType,
  bridgeName,
  setBridgeName,
  bridgeLength,
  setBridgeLength,
  category,
  setCategory,
  age,
  setAge,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
      fetchAllBridges();
    }, [currentPage, districtId, structureType, bridgeName]); // Re-fetch when username changes

  const fetchAllBridges = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const set = (page - 1) * limit;

      // Construct the URL with filters
      const url = new URL(`${BASE_URL}/api/bridges`);
      const params = {
        set,
        limit,
        district: districtId,
        structureType,
        bridgeName,
      };

      // console.log(params);
      url.search = new URLSearchParams(params).toString(); // Add query parameters

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch bridge data");

      const data = await response.json();

      setTableData(data.bridges); // Assuming the response contains a 'bridges' array
      setBridgeCount(data.totalCount); // Assuming the response includes a 'totalCount'
      setTotalPages(Math.ceil(data.totalCount / limit));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const pageRange = 3;

    buttons.push(
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        key="prev"
        style={buttonStyles}
      >
        «
      </Button>
    );

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - pageRange && i <= currentPage + pageRange)
      ) {
        buttons.push(
          <Button
            key={i}
            onClick={() => handlePageChange(i)}
            style={{
              ...buttonStyles,
              backgroundColor: currentPage === i ? "#3B82F6" : "#60A5FA",
            }}
          >
            {i}
          </Button>
        );
      } else if (buttons[buttons.length - 1].key !== "ellipsis") {
        buttons.push(<span key="ellipsis">...</span>);
      }
    }

    buttons.push(
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        key="next"
        style={buttonStyles}
      >
        »
      </Button>
    );

    return buttons;
  };

  const handleViewInventory = (bridge) => {
    setSelectedBridge(bridge); // Set the selected bridge data
    setShowModal(true); // Show the modal
  };

  
  const handleRowClick = (bridge) => {
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
    const editUrl = `/BridgeInfoDashboard?bridgeData=${serializedBridgeData}`;
    window.location.href = editUrl;
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBridge(null); // Clear the selected bridge data
  };

  const handleViewInspection = (bridge) => {
    setSelectedBridge(bridge); // Set the selected bridge data
    setShowInspectionModal(true); // Open the inspection modal
  };

  const handleCloseInspectionModal = () => {
    setShowInspectionModal(false); // Close the inspection modal
    setSelectedBridge(null); // Clear the selected bridge data
  };

  const handleZoomToBridge = (bridge) => {
    setSelectedLocation({
      latitude: bridge.x_centroid, // y_centroid is latitude
      longitude: bridge.y_centroid, // x_centroid is longitude
      name: bridge.BridgeName, // Optional: Add a name for the marker label
      bridgeName: `${bridge.pms_sec_id} - ${bridge.structure_no}`, // Combine pms_sec_id and structure_no
      district: bridge.district,
      road: bridge.road_name,
    });
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  const handleDownloadCSV = async () => {
    setLoading(true); // Start loading
    try {
      const params = {
        district: districtId || "%",
        structureType,
        bridgeName,
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${BASE_URL}/api/bridgesdownloadCsv?${queryString}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      if (!data.bridges || data.bridges.length === 0) {
        Swal.fire("No data available for export", "error");
        return;
      }

      const csv = Papa.unparse(data.bridges);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Bridges_Data.csv";
      link.click();
    } catch (error) {
      Swal.fire("Error!", "Failed to download CSV file", "error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true); // Start loading
    try {
      // Define query parameters
      const params = {
        district: districtId || "%",
        structureType: structureType || "%",
        bridgeName: bridgeName || "%",
      };
      const queryString = new URLSearchParams(params).toString();
  
      // Fetch data from the same API endpoint
      const response = await fetch(`${BASE_URL}/api/bridgesdownloadExcel?${queryString}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
  
      const data = await response.json();
      if (!data.bridges || data.bridges.length === 0) {
        Swal.fire("No data available for export", "error");
        return;
      }
  
      const summaryData = data.bridges;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Bridges Data");
  
      // Exclude "row_rank" and image fields
      const columnKeys = Object.keys(summaryData[0]).filter(
        (key) => key !== "ROW RANK" && key !== "Overview Photos" && key !== "PhotoPaths"
      );
  
      const columns = columnKeys.map((key) => ({
        header: key.replace(/_/g, " "),
        key: key,
        width: Math.min(Math.max(...summaryData.map((row) => (row[key] ? row[key].toString().length : 10)), 10), 30), // Auto-adjust width
      }));
  
      // Add fixed-width image columns
      for (let i = 1; i <= 5; i++) {
        columns.push({ header: `Overview Photo ${i}`, key: `photo${i}`, width: 22 });
      }
      for (let i = 1; i <= 5; i++) {
        columns.push({ header: `Inspection Photo ${i}`, key: `inspection${i}`, width: 22 });
      }
  
      worksheet.columns = columns;
  
      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(1).height = 25;
  
      // Process Rows
      for (let i = 0; i < summaryData.length; i++) {
        const item = summaryData[i];
  
        // Extract image URLs correctly
        const overviewPhotos = item["Overview Photos"] || [];
        const inspectionPhotos = item["PhotoPaths"] || [];
  
        // Add normal data, excluding "row_rank"
        const rowData = {};
        columnKeys.forEach((key) => (rowData[key] = item[key] || ""));
  
        // Insert row
        const rowIndex = worksheet.addRow(rowData).number;
        worksheet.getRow(rowIndex).height = 90;
  
        // Function to insert images
        const insertImage = async (photoUrls, columnOffset) => {
          for (let j = 0; j < photoUrls.length && j < 5; j++) {
            try {
              const imgResponse = await fetch(photoUrls[j]);
              if (!imgResponse.ok) continue;
  
              const imgBlob = await imgResponse.blob();
              const arrayBuffer = await imgBlob.arrayBuffer();
  
              const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: "jpeg",
              });
  
              worksheet.addImage(imageId, {
                tl: { col: columnKeys.length + columnOffset + j, row: rowIndex - 1 },
                ext: { width: 150, height: 90 },
              });
            } catch (error) {
              console.error("Failed to load image:", photoUrls[j], error);
            }
          }
        };
  
        await insertImage(overviewPhotos, 0);
        await insertImage(inspectionPhotos, 5);
      }
  
      // Save File
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `BridgeData.xlsx`);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
    } finally {
      setLoading(false);
    }
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

  return (
    <>
    <div>
      <Map districtId={districtId}/>
    </div>
      <div className="card p-0 rounded-0 text-black"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <div className="card-header rounded-0 p-2 " style={{ background: "#005D7F", color:"#fff" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <h5 className="mb-0 me-5">Inventory</h5>
              <h6 className="mb-0" id="structure-heading">
                Structures Count:
                <span className="badge text-white ms-2" style={{background: "#009CB8"}}>
                  <h6 className="mb-0">{bridgeCount || 0}</h6>
                </span>
              </h6>
            </div>


            <FilterComponent />

            <div className="flex items-center gap-1">
              <button
                className="btn text-white"
                onClick={handleDownloadCSV}
                disabled={loadingCSV}
              >
                <div className="flex items-center gap-1">
                  <FaFileCsv />
                  {loadingCSV ? "Downloading CSV..." : "CSV"}
                </div>
              </button>
              <button
                className="btn text-white"
                onClick={handleDownloadExcel}
                disabled={loadingExcel}
              >
                {loadingExcel ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Downloading
                    Excel...{" "}
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <FaFileExcel />
                    {loading ? "Downloading Excel..." : "Excel"}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0 pb-2">
          {loading && (
            <div
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
                zIndex: 999,
              }}
            />
          )}

          {error && (
            <div className="text-danger text-center">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div>
                <Table className="table table-bordered table-hover table-striped" style={{fontSize:".9rem"}}>
                  <thead>
                    <tr>
                      <th>District</th>
                      <th>Road Name</th>
                      <th>Structure Type</th>
                      <th>Bridge Name</th>
                      <th>Date Time</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((bridge, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(bridge)}
                          className="hover-row"
                        >
                          <td>{bridge.district || "N/A"}</td>
                          <td
                            className="truncate-text"
                            title={bridge.road_name || "N/A"}
                          >
                            {bridge.road_name || "N/A"}
                          </td>
                          <td>{bridge.structure_type || "N/A"}</td>
                          <td>
                            {bridge.pms_sec_id || "N/A"},{" "}
                            {bridge.structure_no || "N/A"}
                          </td>
                          <td>{bridge.data_date_time ? new Date(bridge.data_date_time).toLocaleString() : 'N/A'}</td>
                          <td>
                            <div className="flex space-x-2 justify-center">
                              {/* Button for Bridge Inventory Info */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click event
                                  handleViewInventory(bridge);
                                }}
                                className="bg-[#009CB8] text-white px-2 py-1 rounded-1 hover:bg-[#007485]"
                                style={{ minWidth: "80px" }} // Optional: Set a minimum width for consistency
                              >
                                Inventory Info
                              </button>

                              {/* Button for Inspection Info */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewInspection(bridge);
                                }}
                                className="bg-[#3B9895] text-white px-2 py-1 rounded-1 hover:bg-[#2d7270]"
                                style={{ minWidth: "80px" }} // Optional: Set a minimum width for consistency
                              >
                                Inspection Info
                              </button>

                              {/* Button for Zoom To */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleZoomToBridge(bridge);
                                }}
                                className="bg-[#88B9B8] text-white px-2 py-1 rounded-1 hover:bg-[#6a8f8f]"
                                style={{ minWidth: "80px" }} // Optional: Set a minimum width for consistency
                              >
                                Zoom To
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Modal for Bridge Inventory Details */}
              <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg" // Use a larger modal size to accommodate the InventoryInfo component
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Bridge Inventory Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBridge && (
                    <InventoryInfoDashboard inventoryData={selectedBridge} /> // Pass the selected bridge data to InventoryInfo
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Modal for Inspection Details */}
              <Modal
                show={showInspectionModal}
                onHide={handleCloseInspectionModal}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Inspection Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBridge && (
                    <InspectionListDashboard
                      bridgeId={selectedBridge.uu_bms_id}
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={handleCloseInspectionModal}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              <Modal
                show={showMapModal}
                onHide={handleCloseMapModal}
                size="lg" // Use a larger modal size to accommodate the map
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Bridge Location on Map</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedLocation && (
                    <MapModal
                      location={selectedLocation}
                      onClose={handleCloseMapModal}
                      markerLabel={selectedLocation?.name || "Bridge Location"}
                      bridgeName={selectedLocation?.bridgeName}
                      district={selectedLocation?.district}
                      road={selectedLocation?.road}
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseMapModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              <div className="d-flex justify-content-center align-items-center mt-3">
                {renderPaginationButtons()}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BridgesListDashboard;
