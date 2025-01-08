import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import "./BridgeList.css";

const BridgesListDashboard = ({ selectedDistrict, selectedZone }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeCount, setBridgeCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedDistrict && selectedZone) {
      fetchAllBridges(selectedDistrict, selectedZone);
    }
  }, [selectedDistrict, selectedZone]);

  const fetchAllBridges = async (district, zone) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/bridges?district=${district}&zone=${zone}`
      );
      if (!response.ok) throw new Error("Failed to fetch bridge data");
      const data = await response.json();
      // console.log(data);

      // Set table data and extract the total count
      setTableData(data);
      if (data.length > 0) {
        const lastBridgeId = data[data.length - 1]?.ObjectID || "N/A";
        setBridgeCount(lastBridgeId); // Assuming this is the correct total count
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
    // Serialize the bridge data object into a URL-safe string
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));

    // Construct the URL with serialized data as a query parameter
    const editUrl = `/BridgeInfoDashboard?bridgeData=${serializedBridgeData}`;

    // Navigate to the edit URL, passing the data through query parameters
    window.location.href = editUrl;
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
            <div className="text-2xl font-bold">Bridges List</div>{" "}
            {/* Larger and bolder */}
            <div className="text-sm font-medium mt-1 text-gray-700">
              {" "}
              {/* Smaller and lighter */}
              Total Bridges: {bridgeCount || 0}
            </div>
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
                        <td>{bridge.District || "N/A"}</td>
                        <td
                          className="truncate-text"
                          title={bridge.Road || "N/A"}
                        >
                          {bridge.Road || "N/A"}
                        </td>
                        <td>{bridge.StructureType || "N/A"}</td>
                        <td>{bridge.BridgeName || "N/A"}</td>
                        <td>
                          {bridge.photo ? (
                            <img
                              src={bridge.photo}
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

                        <td>{bridge.LatestInspectionStatus || "N/A"}</td>
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

export default BridgesListDashboard;
