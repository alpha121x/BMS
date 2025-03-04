import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import Header from "./Header";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";

const BridgeWiseScore = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = (bridge) => {
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
    const editUrl = `/BridgeInformation?bridgeData=${serializedBridgeData}`;
    window.location.href = editUrl; // Navigate to the new page
  };

  useEffect(() => {
    fetchData(); // Fetch data whenever currentPage changes
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/bms-score?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (Array.isArray(result.data)) {
        setBridgeScoreData(result.data);
        setTotalItems(parseInt(result.totalRecords, 10));
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = bridgeScoreData; // Since data is already paginated from API

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bms-score-export`);
      const { data } = await response.json();
  
      if (!data.length) {
        console.warn("No data available for CSV download.");
        return;
      }
  
      // Convert JSON to CSV format
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          Object.keys(data[0]).join(","), // CSV Headers
          ...data.map((row) => Object.values(row).join(",")), // CSV Rows
        ].join("\n");
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "bridge_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // console.log("CSV file downloaded successfully.");
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };
  
  const handleDownloadExcel = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bms-score-export`);
      const { data } = await response.json();
  
      if (!data.length) {
        console.warn("No data available for Excel download.");
        return;
      }
  
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bridge Data");
  
      // Create a Blob and trigger the download
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "bridge_data.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // console.log("Excel file downloaded successfully.");
    } catch (error) {
      console.error("Error downloading Excel:", error);
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

  const filteredData = currentData.filter((row) =>
    (row.bridge_name && row.bridge_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.district && row.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    <>
      <Header />
      <div className="p-2 bg-gray-200 min-h-screen flex justify-center items-center">
        <div
          className="card p-2 rounded-lg text-black w-3/4"
          style={{
            background: "#FFFFFF",
            border: "2px solid #60A5FA",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
          }}
        >
          <div className="card-body pb-0">
            <div className="flex items-center justify-between pb-2">
              <h6 className="card-title text-lg font-semibold">
                Bridge Wise Score
              </h6>

              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
                  onClick={handleDownloadCSV}
                >
                  <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                  CSV
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
                  onClick={handleDownloadExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                  Excel
                </button>
              </div>
            </div>

            {loading ? (
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
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                <Table className="table table-striped table-hover table-bordered table-responsive">
                  <thead>
                    <tr>
                      <th>Bridge Name</th>
                      <th>District</th>
                      <th>Total Damage Score</th>
                      <th>Critical Damage Score</th>
                      <th>Average Damage Score</th>
                      <th>Bridge Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((row, index) => (
                        <tr key={index}>
                          <td>{row.bridge_name || "N/A"}</td>
                          <td>{row.district || "N/A"}</td>
                          <td>{row.damage_score || "N/A"}</td>
                          <td>{row.critical_damage_score || "N/A"}</td>
                          <td>{row.inventory_score || "N/A"}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleClick(row)}
                              className="btn btn-primary btn-sm"
                            >
                              Bridge Info
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* Pagination Section */}
                <div className="d-flex justify-content-center align-items-center mt-3">
                  {renderPaginationButtons()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BridgeWiseScore;