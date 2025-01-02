import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";  // Import useNavigate from react-router-dom

const BridgesList = ({ selectedDistrict, selectedZone }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const navigate = useNavigate();  // Initialize navigate hook

  useEffect(() => {
    if (selectedDistrict && selectedZone) {
      fetchAllBridges(selectedDistrict, selectedZone);
    }
  }, [selectedDistrict, selectedZone]);

  // Function to fetch bridge data
  const fetchAllBridges = async (selectedDistrict, selectedZone) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/bridges?district=${selectedDistrict}&zone=${selectedZone}`
      );
      if (!response.ok) throw new Error("Failed to fetch bridge data");
      const data = await response.json();
      setTableData(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle pagination
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

  const buttonStyles = {
    margin: "0 6px",
    padding: "4px 8px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  };

  // Handle row click to navigate to the BridgeDetailsPage
  const handleRowClick = (bridge) => {
    navigate(`/BridgeInfo/${bridge.ObjectID}`, { state: { bridge } });
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
          Bridge List
        </h6>

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

        <Table bordered responsive>
          <thead>
            <tr>
              <th>Bridge ID</th>
              <th>Bridge Name</th>
              <th>Structure Type</th>
              <th>Construction Type</th>
              <th>District</th>
              <th>Zone</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((bridge, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(bridge)}  // Add onClick handler
                  style={{ cursor: "pointer" }}  // Change cursor to pointer
                >
                  <td>{bridge.ObjectID || "N/A"}</td>
                  <td>{bridge.BridgeName || "N/A"}</td>
                  <td>{bridge.StructureType || "N/A"}</td>
                  <td>{bridge.ConstructionType || "N/A"}</td>
                  <td>{bridge.District || "N/A"}</td>
                  <td>{bridge.Zone || "N/A"}</td>
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

        <div className="d-flex justify-content-center align-items-center">
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
};

export default BridgesList;
