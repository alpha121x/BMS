import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import "./BridgeList.css";
import * as XLSX from "xlsx"; // Excel library
import Papa from "papaparse"; // Import papaparse
import FilterComponent from "./FilterComponent";
import InventoryInfoDashboard from "./InventoryInfoDashboard"; // Import the InventoryInfo component
import InspectionListDashboard from "./InspectionListDashboard";
import MapModal from "./MapModal"; // Adjust the import path as needed

const BridgesListDashboard = ({
  setSelectedDistrict,
  setBridge,
  setMinBridgeLength,
  setMaxBridgeLength,
  setMinSpanLength,
  setMaxSpanLength,
  setStructureType,
  setConstructionType,
  setCategory,
  setEvaluationStatus,
  setInspectionStatus,
  setMinYear,
  setMaxYear,
  ////////
  district,
  structureType,
  constructionType,
  category,
  evaluationStatus,
  inspectionStatus,
  minBridgeLength,
  maxBridgeLength,
  minSpanLength,
  maxSpanLength,
  minYear,
  maxYear,
  bridge,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllBridges(currentPage, itemsPerPage);
  }, [
    currentPage,
    district,
    structureType,
    constructionType,
    category,
    evaluationStatus,
    inspectionStatus,
    minBridgeLength,
    maxBridgeLength,
    minSpanLength,
    maxSpanLength,
    minYear,
    maxYear,
    bridge,
  ]);

  const fetchAllBridges = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const set = (page - 1) * limit;

      // Construct the URL with filters
      const url = new URL(`${BASE_URL}/api/bridges`);
      const params = {
        set,
        limit,
        district: district || "%",
        structureType,
        constructionType,
        category,
        evaluationStatus,
        inspectionStatus,
        minBridgeLength,
        maxBridgeLength,
        minSpanLength,
        maxSpanLength,
        minYear,
        maxYear,
        bridge,
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
      latitude: bridge.y_centroid, // y_centroid is latitude
      longitude: bridge.x_centroid, // x_centroid is longitude
      name: bridge.BridgeName, // Optional: Add a name for the marker label
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
        district: district || "%",
        structureType,
        constructionType,
        category,
        evaluationStatus,
        inspectionStatus,
        minBridgeLength,
        maxBridgeLength,
        minSpanLength,
        maxSpanLength,
        minYear,
        maxYear,
        bridge,
      };
  
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${BASE_URL}/api/bridgesdownloadNeww?${queryString}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
  
      const data = await response.json();
      if (!data.bridges || data.bridges.length === 0) {
        Swal.fire("Error!", "No data available for export", "error");
        return;
      }
  
      const csv = Papa.unparse(data.bridges);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "bridges_data.csv";
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
      const params = {
        district: district || "%",
        structureType,
        constructionType,
        category,
        evaluationStatus,
        inspectionStatus,
        minBridgeLength,
        maxBridgeLength,
        minSpanLength,
        maxSpanLength,
        minYear,
        maxYear,
        bridge,
      };
  
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${BASE_URL}/api/bridgesdownloadNeww?${queryString}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
  
      const data = await response.json();
      if (!data.bridges || data.bridges.length === 0) {
        Swal.fire("Error!", "No data available for export", "error");
        return;
      }
  
      // Handle array fields like photos
      data.bridges.forEach((row) => {
        if (Array.isArray(row.photos)) {
          row.photos = row.photos.join(", ") || "No image path";
        }
      });
  
      // Create the worksheet
      const ws = XLSX.utils.json_to_sheet(data.bridges);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bridges Data");
  
      // Download the Excel file
      XLSX.writeFile(wb, "bridges_data.xlsx");
    } catch (error) {
      Swal.fire("Error!", "Failed to download Excel file", "error");
    } finally {
      setLoading(false); // Stop loading
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
      <div className="w-full mx-auto mt-2">
        <div className="bg-[#60A5FA] text-grey p-3 rounded-md shadow-md flex items-center justify-between">
          <div className="text-lg font-semibold">
            <div className="text-2xl font-bold">Structures Inventory</div>
            <div className="text-sm font-medium mt-1 text-gray-700">
            Total Structures: {bridgeCount || 0}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="btn btn-primary flex items-center gap-2"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasRight"
              aria-controls="offcanvasRight"
            >
              {/* Filter Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-5.414 5.414A2 2 0 0014 13.414V20a1 1 0 01-1.447.894l-4-2A1 1 0 018 17.618v-4.204a2 2 0 00-.586-1.414L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
            </button>

            {/* Offcanvas Sidebar for Filters */}
            <div
              className="offcanvas offcanvas-end"
              tabIndex="-1"
              id="offcanvasRight"
              aria-labelledby="offcanvasRightLabel"
            >
              <div className="offcanvas-header">
                <h5 id="offcanvasRightLabel" className="text-xl font-bold">
                  Filters
                </h5>
                <button
                  type="button"
                  className="btn-close text-reset"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>

              <div className="offcanvas-body">
                <FilterComponent
                  setSelectedDistrict={setSelectedDistrict}
                  setMinBridgeLength={setMinBridgeLength}
                  setMaxBridgeLength={setMaxBridgeLength}
                  setMinSpanLength={setMinSpanLength}
                  setMaxSpanLength={setMaxSpanLength}
                  setStructureType={setStructureType}
                  setConstructionType={setConstructionType}
                  setCategory={setCategory}
                  setEvaluationStatus={setEvaluationStatus}
                  setInspectionStatus={setInspectionStatus}
                  setMinYear={setMinYear}
                  setMaxYear={setMaxYear}
                  setBridge={setBridge}
                />
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 disabled:opacity-50"
              onClick={handleDownloadCSV}
              disabled={loading}
            >
              {loading ? "Downloading CSV..." : "Download CSV"}
            </button>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 disabled:opacity-50"
              onClick={handleDownloadExcel}
              disabled={loading}
            >
              {loading ? "Downloading Excel..." : "Download Excel"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="card p-2 rounded-lg text-black"
        style={{
          background: "#FFFFFF",
          border: "2px solid #60A5FA",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
          minHeight: "400px", // Set a minimum height for the card
          width: "100%", // Ensure the card takes full width of its container
          overflow: "hidden", // Prevent content from overflowing
        }}
      >
        <div className="card-body pb-0" style={{ padding: "0.5rem" }}>
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
              <div style={{ overflowX: "auto" }}>
                <Table
                  bordered
                  responsive
                  className="custom-table"
                  style={{ minWidth: "800px" }}
                >
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
                          <td>{bridge.date_time}</td>
                          <td>
                            <div className="flex space-x-2 justify-center">
                              {/* Button for Bridge Inventory Info */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click event
                                  handleViewInventory(bridge);
                                }}
                                className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 text-xs"
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
                                className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-xs"
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
                                className="bg-purple-500 text-white px-2 py-1 rounded-md hover:bg-purple-600 text-xs"
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
