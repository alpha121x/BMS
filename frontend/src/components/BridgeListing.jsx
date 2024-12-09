import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import BridgeDetailsModal from "./BridgesDetailsModal";

const BridgeListing = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null);
  const [filterText, setFilterText] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllBridges();
  }, []);

  const fetchAllBridges = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bridges`);
      if (!response.ok) throw new Error("Failed to fetch bridge data");
      const data = await response.json();
      setTableData(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const filterData = (bridge) => {
    return (
      (bridge.ObjectID && bridge.ObjectID.toLowerCase().includes(filterText.toLowerCase())) ||
      (bridge.BridgeName && bridge.BridgeName.toLowerCase().includes(filterText.toLowerCase())) ||
      (bridge.StructureType && bridge.StructureType.toLowerCase().includes(filterText.toLowerCase())) ||
      (bridge.ConstructionType && bridge.ConstructionType.toLowerCase().includes(filterText.toLowerCase())) ||
      (bridge.District && bridge.District.toLowerCase().includes(filterText.toLowerCase())) ||
      (bridge.Zone && bridge.Zone.toLowerCase().includes(filterText.toLowerCase()))
    );
  };

  useEffect(() => {
    if (filterText) {
      const filtered = tableData.filter(filterData);
      setFilteredData(filtered);
    } else {
      setFilteredData(tableData);
    }
  }, [filterText, tableData]);

  const handleViewClick = (bridge) => {
    setSelectedBridge(bridge);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedBridge(null);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
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

  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous Button
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
  
    // Page Buttons (Dynamic)
    for (let page = 1; page <= Math.min(totalPages, 5); page++) {
      buttons.push(
        <Button
          key={page}
          onClick={() => handlePageChange(page)}
          style={{
            ...buttonStyles,
            backgroundColor: currentPage === page ? "#3B82F6" : "#60A5FA", // Darker shade for active button
          }}
        >
          {page}
        </Button>
      );
    }

    // Next Button
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
        <h6 className="card-title text-lg font-semibold pb-2">
          Bridge Listing
        </h6>

        {/* Filter Input */}
        <div className="mb-3">
          <input
            type="text"
            value={filterText}
            onChange={handleFilterChange}
            className="form-control mb-2"
            placeholder="Filter by Bridge ID, District, Zone, Structure Type"
          />
        </div>

        {/* Custom Loader */}
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

        {/* Table */}
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Bridge ID</th>
              <th>Bridge Name</th>
              <th>Structure Type</th>
              <th>Construction Type</th>
              <th>District</th>
              <th>Zone</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((bridge, index) => (
                <tr key={index}>
                  <td>{bridge.ObjectID || "N/A"}</td>
                  <td>{bridge.BridgeName || "N/A"}</td>
                  <td>{bridge.StructureType || "N/A"}</td>
                  <td>{bridge.ConstructionType || "N/A"}</td>
                  <td>{bridge.District || "N/A"}</td>
                  <td>{bridge.Zone || "N/A"}</td>
                  <td>
                    <Button
                      onClick={() => handleViewClick(bridge)}
                      style={{
                        backgroundColor: "#60A5FA",
                        border: "none",
                        color: "white",
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center">
          {renderPaginationButtons()}
        </div>
      </div>

      {/* Bridge Details Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bridge Details</Modal.Title>
        </Modal.Header>
        <BridgeDetailsModal selectedBridge={selectedBridge} />
      </Modal>
    </div>
  );
};

export default BridgeListing;
