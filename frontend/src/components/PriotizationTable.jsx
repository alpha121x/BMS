import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import Filters from "./Filters";

const PriotizationTable = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [districtId, setDistrictId] = useState("%");
  const [structureType, setStructureType] = useState("%");
  const [bridgeName, setBridgeName] = useState("");

  // Dummy data based on the provided table
  const dummyData = [
    { category: "Good", GroupA: "N.A", GroupB: "N.A", GroupC: "N.A", GroupD: "N.A" },
    { category: "Fair", GroupA: 9, GroupB: 10, GroupC: 11, GroupD: 12 },
    { category: "Poor", GroupA: 5, GroupB: 6, GroupC: 7, GroupD: 8 },
    { category: "Severe", GroupA: 1, GroupB: 2, GroupC: 3, GroupD: 4 },
  ];

  useEffect(() => {
    setBridgeScoreData(dummyData);
    setBridgeCount(dummyData.length);
    setTotalItems(dummyData.length);
    setLoading(false);
  }, []);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = bridgeScoreData;

  const handleDownloadCSV = () => {
    if (!bridgeScoreData.length) {
      console.warn("No data available for CSV download.");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Category", "Group A", "Group B", "Group C", "Group D"].join(","),
        ...bridgeScoreData.map((row) =>
          [row.category, row.GroupA, row.GroupB, row.GroupC, row.GroupD].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bridge_Condition_Summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcel = () => {
    if (!bridgeScoreData.length) {
      console.warn("No data available for Excel download.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(bridgeScoreData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bridge Condition");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Bridge_Condition_Summary.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to determine the background color based on the category
  const getCategoryStyle = (category) => {
    switch (category) {
      case "Good":
        return { backgroundColor: "#28a745", color: "white" };
      case "Fair":
        return { backgroundColor: "#ffc107", color: "black" };
      case "Poor":
        return { backgroundColor: "#fd7e14", color: "white" };
      case "Severe":
        return { backgroundColor: "#dc3545", color: "white" };
      default:
        return {};
    }
  };

  return (
    <>
      <section
        className="container p-4 mt-[80px] bg-gray-200 rounded-0"
        style={{ backgroundColor: "#F2F2F2" }}
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

      <section className="container p-2 bg-gray-200 items-center">
        <div className="row w-100">
          <div className="col-md-12">
            <div
              className="card-header rounded-0 p-2"
              style={{ background: "#005D7F", color: "#fff" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between gap-4">
                  <h5 className="mb-0">Bridge Condition Summary</h5>
                  <h6 className="mb-0" id="structure-heading">
                    Category Counts:
                    <span
                      className="badge text-white ms-2"
                      style={{ background: "#009CB8" }}
                    >
                      <h6 className="mb-0">{bridgeCount || 0}</h6>
                    </span>
                  </h6>
                </div>
                <div className="flex gap-2">
                  <button className="btn text-white" onClick={handleDownloadCSV}>
                    <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                    CSV
                  </button>
                  <button className="btn text-white" onClick={handleDownloadExcel}>
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
              ) : (
                <>
                  <Table
                    className="table table-bordered table-hover table-striped table-responsive"
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center", padding: "10px" }}>Category</th>
                        <th style={{ textAlign: "center", padding: "10px" }}>Group A</th>
                        <th style={{ textAlign: "center", padding: "10px" }}>Group B</th>
                        <th style={{ textAlign: "center", padding: "10px" }}>Group C</th>
                        <th style={{ textAlign: "center", padding: "10px" }}>Group D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((row, index) => (
                          <tr key={index} style={{ height: "50px" }}>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "10px",
                                ...getCategoryStyle(row.category),
                              }}
                            >
                              {row.category}
                            </td>
                            <td style={{ textAlign: "center", padding: "10px" }}>{row.GroupA}</td>
                            <td style={{ textAlign: "center", padding: "10px" }}>{row.GroupB}</td>
                            <td style={{ textAlign: "center", padding: "10px" }}>{row.GroupC}</td>
                            <td style={{ textAlign: "center", padding: "10px" }}>{row.GroupD}</td>
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PriotizationTable;