import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import BridgeDetailsModal from "./BridgesDetailsModal";

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
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleViewClick = (bridge) => {
    setSelectedBridge(bridge);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedBridge(null);
  };

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

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
        <h6 className="card-title text-lg font-semibold pb-2">
          Bridge Listing
        </h6>
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
        <div className="d-flex justify-content-center">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            «
          </Button>
          {[...Array(totalPages).keys()].map((page) => (
            <Button
              key={page}
              onClick={() => handlePageChange(page + 1)}
              variant={currentPage === page + 1 ? "primary" : "light"}
              className="mx-1"
            >
              {page + 1}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            »
          </Button>
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
