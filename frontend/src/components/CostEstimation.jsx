import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import Filters from "./Filters";
import CostMap from "./CostMap";

const CostEstimation = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMap, setShowMap] = useState(false); // New state for toggling map/table
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, districtId, structureType, bridgeName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/bms-cost?page=${currentPage}&limit=${itemsPerPage}&district=${districtId}&structureType=${structureType}&bridgeName=${bridgeName}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (Array.isArray(result.data)) {
        setBridgeScoreData(result.data);
        setBridgeCount(result.totalRecords);
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
  const currentData = bridgeScoreData;

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
      const response = await fetch(`${BASE_URL}/api/bms-cost-export`);
      const { data } = await response.json();

      if (!data.length) {
        console.warn("No data available for CSV download.");
        return;
      }

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          Object.keys(data[0]).join(","),
          ...data.map((row) => Object.values(row).join(",")),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Bridge_Cost.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bms-cost-export`);
      const { data } = await response.json();

      if (!data.length) {
        console.warn("No data available for Excel download.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bridge Data");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Bridges_Cost.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      <section
        className="container p-3"
        style={{ marginTop: "50px", backgroundColor: "#F2F2F2" }}
      >
        <div className="row">
          <div className="col-md-12">
            <Filters
              districtId={districtId}
              setDistrictId={setDistrictId}
              structureType={structureType}
              setStructureType={setStructureType}
              bridgeName={bridgeName}
              setBridgeName={setBridgeName}
              flexDirection="flex-row"
              padding="p-2"
            />
          </div>
        </div>
      </section>

      <section className="container p-2 mt-0 bg-gray-200 items-center">
        {/* Toggle Button */}
        <div className="d-flex justify-content-start mt-2 mb-2">
          <Button
            onClick={() => setShowMap(!showMap)}
            style={{
              backgroundColor: "#005D7F",
              borderColor: "#005D7F",
            }}
          >
            {showMap ? "Show Table" : "Show Map"}
          </Button>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div
              className="card-header rounded-0 p-2"
              style={{ background: "#005D7F", color: "#fff" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between gap-4">
                  <h5 className="mb-0">Cost Estimation</h5>
                  <h6 className="mb-0" id="structure-heading">
                    Records:
                    <span
                      className="badge text-white ms-2"
                      style={{ background: "#009CB8" }}
                    >
                      <h6 className="mb-0">{bridgeCount || 0}</h6>
                    </span>
                  </h6>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn text-white"
                    onClick={handleDownloadCSV}
                  >
                    <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                    CSV
                  </button>
                  <button
                    className="btn text-white"
                    onClick={handleDownloadExcel}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                    Excel
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body p-0 pb-2">
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
              ) : showMap ? (
                <CostMap />
              ) : (
                <>
                  <Table
                    className="table table-bordered table-hover table-striped table-responsive"
                    style={{ fontSize: "14px" }}
                  >
                    <thead>
                      <tr>
                        <th>District</th>
                        <th>Structure Type</th>
                        <th>Bridge Name</th>
                        <th>Cost (Millions)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((row, index) => (
                          <tr key={index}>
                            <td>{row.district || "N/A"}</td>
                            <td>{row.structure_type || "N/A"}</td>
                            <td>{row.bridge_name || "N/A"}</td>
                            <td className="font-bold">
                              {row.cost_million || "N/A"}
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
      </section>
    </>
  );
};

export default CostEstimation;
