import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";

const BridgeListing = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null);
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
      setLoading(false); // Stop loading when data is fetched
    } catch (error) {
      setError(error.message);
      setLoading(false); // Stop loading on error
    }
  };

  const handleViewClick = (bridge) => {
    setSelectedBridge(bridge);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div
      className="card p-2 rounded-lg text-black"
      style={{
        background: "#FFFFFF",
        border: "2px solid #60A5FA",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="card-body pb-0">
        <h5
          className="card-title text-lg font-semibold"
          style={{ padding: "10px 0 0 0" }}
        >
          Bridge Listing
        </h5>
        <Table bordered>
          <thead>
            <tr>
              <th>Object ID</th>
              <th>Bridge Name</th>
              <th>Road Number</th>
              <th>Zone ID</th>
              <th>District ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((bridge, index) => (
                <tr key={index}>
                  <td>{bridge.ObjectID || "N/A"}</td>
                  <td>{bridge.BridgeName || "N/A"}</td>
                  <td>{bridge.RoadNumber || "N/A"}</td>
                  <td>{bridge.ZoneID || "N/A"}</td>
                  <td>{bridge.DistrictID || "N/A"}</td>
                  <td>
                    <Button
                      variant="text-center"
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
                <td colSpan="6" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-center align-items-center">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              margin: "0 6px",
              padding: "4px 8px",
              backgroundColor: currentPage === 1 ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            «
          </Button>
          {[...Array(totalPages).keys()].map((page) => (
            <Button
              key={page}
              onClick={() => handlePageClick(page + 1)}
              style={{
                margin: "0 6px",
                padding: "4px 8px",
                backgroundColor:
                  page + 1 === currentPage ? "#218838" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {page + 1}
            </Button>
          ))}
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              margin: "0 6px",
              padding: "4px 8px",
              backgroundColor:
                currentPage === totalPages ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            »
          </Button>
        </div>
      </div>
      {/* Bridge Details Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Bridge Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Name:</strong> {selectedBridge?.name || "N/A"}
          </p>
          <p>
            <strong>Location:</strong> {selectedBridge?.location || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {selectedBridge?.status || "N/A"}
          </p>
          <p>
            <strong>Last Inspection:</strong>{" "}
            {selectedBridge?.lastInspection || "N/A"}
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BridgeListing;
