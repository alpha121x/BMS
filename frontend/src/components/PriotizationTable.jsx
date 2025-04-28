import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";

const PriotizationTable = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bridgeCount, setBridgeCount] = useState(0);

  // Dummy data based on the provided table
  const dummyData = [
    {
      category: "Good",
      GroupA: "N.A",
      GroupB: "N.A",
      GroupC: "N.A",
      GroupD: "N.A",
    },
    { category: "Fair", GroupA: 9, GroupB: 10, GroupC: 11, GroupD: 12 },
    { category: "Poor", GroupA: 5, GroupB: 6, GroupC: 7, GroupD: 8 },
    { category: "Severe", GroupA: 1, GroupB: 2, GroupC: 3, GroupD: 4 },
  ];

  useEffect(() => {
    setBridgeScoreData(dummyData);
    setBridgeCount(dummyData.length);
    setLoading(false);
  }, []);

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
          [row.category, row.GroupA, row.GroupB, row.GroupC, row.GroupD].join(
            ","
          )
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
      {/* Table Section Centered in Viewport */}
      <section
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "90vh", // Full viewport height
          backgroundColor: "#F2F2F2",
          padding: "20px",
        }}
      >
        <div className="w-100" style={{ maxWidth: "1000px" }}>
          <div
            className="card-header rounded-0 p-2"
            style={{ background: "#005D7F", color: "#fff" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between gap-4">
                <h5 className="mb-0">Bridge Priortization Table</h5>
                {/* <h6 className="mb-0" id="structure-heading">
                  Category Counts:
                  <span
                    className="badge text-white ms-2"
                    style={{ background: "#009CB8" }}
                  >
                    <h6 className="mb-0">{bridgeCount || 0}</h6>
                  </span>
                </h6> */}
              </div>
              <div className="flex gap-2">
                <button
                  className="btn text-white"
                  onClick={handleDownloadCSV}
                >
                  <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                  CSV
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
                  className="table table-bordered table-hover table-striped"
                  style={{
                    fontSize: "24px", // Increased font size
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center", padding: "15px" }}>
                        Category
                      </th>
                      <th style={{ textAlign: "center", padding: "15px" }}>
                        Group A
                      </th>
                      <th style={{ textAlign: "center", padding: "15px" }}>
                        Group B
                      </th>
                      <th style={{ textAlign: "center", padding: "15px" }}>
                        Group C
                      </th>
                      <th style={{ textAlign: "center", padding: "15px" }}>
                        Group D
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((row, index) => (
                        <tr key={index} style={{ height: "70px" }}>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "15px",
                              ...getCategoryStyle(row.category),
                            }}
                          >
                            {row.category}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "15px" }}
                          >
                            {row.GroupA}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "15px" }}
                          >
                            {row.GroupB}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "15px" }}
                          >
                            {row.GroupC}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "15px" }}
                          >
                            {row.GroupD}
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
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default PriotizationTable;