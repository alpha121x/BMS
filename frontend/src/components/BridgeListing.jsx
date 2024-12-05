import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config.jsx";

const BridgeListing = () => {
  const [bridges, setBridges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Rows per page

  useEffect(() => {
    fetchAllBridges();
  }, []);

  const fetchAllBridges = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bridges`);
      const data = await response.json();
      setBridges(data);
    } catch (error) {
      console.error("Error fetching bridge data:", error);
    }
  };

  // Calculate paginated data
  const indexOfLastBridge = currentPage * rowsPerPage;
  const indexOfFirstBridge = indexOfLastBridge - rowsPerPage;
  const currentBridges = bridges.slice(indexOfFirstBridge, indexOfLastBridge);

  const totalPages = Math.ceil(bridges.length / rowsPerPage);

  // Inline styles
  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
      margin: "20px auto",
      maxWidth: "1200px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      marginTop: "20px",
    },
    header: {
      fontSize: "1.8rem",
      color: "#333",
      marginBottom: "20px",
      textAlign: "center",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "20px",
    },
    tableHeadRow: {
      backgroundColor: "#007bff",
      color: "#fff",
      textAlign: "left",
    },
    tableCell: {
      padding: "12px 15px",
      border: "1px solid #ddd",
    },
    tableRowOdd: {
      backgroundColor: "#f3f3f3",
    },
    tableRowHover: {
      backgroundColor: "#e9f5ff",
    },
    paginationContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    paginationButton: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "8px 16px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "background-color 0.3s",
    },
    paginationButtonDisabled: {
      backgroundColor: "#ccc",
      cursor: "not-allowed",
    },
    paginationInfo: {
      fontSize: "1rem",
      color: "#555",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Bridge Listing</h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeadRow}>
              <th style={styles.tableCell}>#</th>
              <th style={styles.tableCell}>Object ID</th>
              <th style={styles.tableCell}>Bridge Name</th>
              <th style={styles.tableCell}>Bridge Code</th>
              <th style={styles.tableCell}>Road Number</th>
              <th style={styles.tableCell}>Zone ID</th>
              <th style={styles.tableCell}>District ID</th>
            </tr>
          </thead>
          <tbody>
            {currentBridges.map((bridge, index) => (
              <tr
                key={bridge.ObjectID}
                style={
                  index % 2 === 0
                    ? { ...styles.tableCell }
                    : { ...styles.tableCell, ...styles.tableRowOdd }
                }
              >
                <td style={styles.tableCell}>
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td style={styles.tableCell}>{bridge.ObjectID}</td>
                <td style={styles.tableCell}>{bridge.BridgeName || "N/A"}</td>
                <td style={styles.tableCell}>{bridge.BridgeCode || "N/A"}</td>
                <td style={styles.tableCell}>{bridge.RoadNumber || "N/A"}</td>
                <td style={styles.tableCell}>{bridge.ZoneID || "N/A"}</td>
                <td style={styles.tableCell}>{bridge.DistrictID || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={styles.paginationContainer}>
          <button
            style={
              currentPage === 1
                ? { ...styles.paginationButton, ...styles.paginationButtonDisabled }
                : styles.paginationButton
            }
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span style={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            style={
              currentPage === totalPages
                ? { ...styles.paginationButton, ...styles.paginationButtonDisabled }
                : styles.paginationButton
            }
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BridgeListing;
