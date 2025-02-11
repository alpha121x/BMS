import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import Header from "./Header";
import Footer from "./Footer";

const BridgeWiseScore = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

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
      console.log(
        "Fetching data from:",
        `${BASE_URL}/api/bms-score?page=${currentPage}&limit=${itemsPerPage}`
      ); // Log the request URL
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      console.log("Fetched data:", result); // Log the entire response
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
            <h6 className="card-title text-lg font-semibold pb-2">
              Bridge Wise Score
            </h6>
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                <Table className="custom-table">
                  <thead>
                    <tr>
                      <th>Bridge Name</th>
                      <th>District</th>
                      <th>Damage Score</th>
                      <th>Critical Damage Score</th>
                      <th>Inventory Score</th>
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
                          <td>
                            <button
                              onClick={() => handleClick(row)}
                              className="btn btn-primary btn-sm"
                            >
                              See Bridge Information
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
