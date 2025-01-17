import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import "./BridgeList.css";

const BridgesList = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeCount, setBridgeCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllBridges();
  }, []);

  const fetchAllBridges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/bridges`);
      if (!response.ok) throw new Error("Failed to fetch bridge data");
      const data = await response.json();

      // Set table data and extract the total count
      setTableData(data);
      if (data.length > 0) {
        setBridgeCount(data.length); // Use actual length of the fetched data
      } else {
        setBridgeCount(0); // Default to 0 if no data
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowClick = (bridge) => {
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
    // console.log("Bridge data: ", bridge);
    // return;
    const editUrl = `/BridgeInfo?bridgeData=${serializedBridgeData}`;
    window.location.href = editUrl;
  };

  const handleDownloadCSV = () => {
    // Logic for downloading CSV
  };

  const handleDownloadExcel = () => {
    // Logic for downloading Excel
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
        <div className="bg-[#60A5FA] text-grey p-4 rounded-md shadow-md flex items-center justify-between">
          <div className="text-lg font-semibold">
            <div className="text-2xl font-bold">Bridges List</div>
            <div className="text-sm font-medium mt-1 text-gray-700">
              Total Bridges: {bridgeCount || 0}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
              onClick={handleDownloadCSV}
            >
              Download CSV
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700"
              onClick={handleDownloadExcel}
            >
              Download Excel
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
        }}
      >
        <div className="card-body pb-0">
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
              <Table bordered responsive className="custom-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Road Name</th>
                    <th>Structure Type</th>
                    <th>Bridge Name</th>
                    <th>Photo</th>
                    <th>Latest Inspection Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((bridge, index) => (
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
                        <td>{bridge.bridge_name}</td>
                        <td>
                          {bridge.photos && bridge.photos.length > 0 ? (
                            <img
                              src={bridge.photos[0]} // Display the first image from the photos array
                              alt="Bridge"
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ) : (
                            <img
                              src="/download.jpeg" // Path to your alternate image
                              alt="No image available"
                              className="w-30 h-10 object-cover rounded-md"
                            />
                          )}
                        </td>
                        <td></td>
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BridgesList;
