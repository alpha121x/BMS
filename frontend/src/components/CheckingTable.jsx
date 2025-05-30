import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import CheckingDetailsModal from "./CheckingDetailsModal";
import Papa from "papaparse";

const CheckingTable = ({district, bridge}) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [district, bridge]); // Dependency array to re-fetch when district or bridge changes
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct the URL with parameters
      const url = new URL(`${BASE_URL}/api/inspections`);
      const params = new URLSearchParams();
  
      if (district) params.append("district", district);
      if (bridge) params.append("bridge", bridge);
  
      url.search = params.toString(); // Append query parameters to the URL
  
      const response = await fetch(url);
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
  

  const handleViewClick = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedRow(null);
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

  // CSV Export Function
  const handleDownloadCSV = () => {
    const csvData = Papa.unparse(tableData); // Convert table data to CSV format

    const bridgeName = tableData[0]?.bridge_name || "Bridge";

    // Create a hidden link element to trigger the download
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    link.target = "_blank";
    link.download = `Inspections.csv`; // File name
    link.click();
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
        <div className="text-2xl font-bold">Individual Bridge Inspections</div>
        <div className="text-sm font-medium mt-1 text-gray-700 mb-1">
          Total Records: {tableData.length || 0}
        </div>

        {/* Download CSV Button */}
        <Button
          variant="primary"
          onClick={handleDownloadCSV}
          style={{ marginBottom: "16px" }}
        >
          Download CSV
        </Button>

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

        <Table className="custom-table">
          <thead>
            <tr>
              <th>Bridge Name</th>
              <th>Work Kind</th>
              <th>Material</th>
              <th>Parts</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr key={index}>
                  <td>{row.bridge_name || "N/A"}</td>
                  <td>{row.WorkKindName || "N/A"}</td>
                  <td>{row.MaterialName || "N/A"}</td>
                  <td>{row.PartsName || "N/A"}</td>
                  <td>
                    {row.ApprovedFlag === 0
                      ? "Unapproved"
                      : row.ApprovedFlag || "N/A"}
                  </td>
                  <td>
                    <Button
                      onClick={() => handleViewClick(row)}
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

        <div className="d-flex justify-content-center align-items-center">
          {renderPaginationButtons()}
        </div>
      </div>

      {/* Modal for viewing more details */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Inspection Details</Modal.Title>
        </Modal.Header>

        {/* Passing selectedRow as a prop to CheckingDetailsModal */}
        <CheckingDetailsModal selectedRow={selectedRow} />
      </Modal>
    </div>
  );
};

export default CheckingTable;
