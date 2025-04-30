import React, { useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";

// Dummy data for the main table
const dummyData = [
  { category: "Good", GroupA: "N.A", GroupB: "N.A", GroupC: "N.A", GroupD: "N.A" },
  { category: "Fair", GroupA: 9, GroupB: 10, GroupC: 11, GroupD: 12 },
  { category: "Poor", GroupA: 5, GroupB: 6, GroupC: 7, GroupD: 8 },
  { category: "Severe", GroupA: 1, GroupB: 2, GroupC: 3, GroupD: 4 },
];

// Dummy bridge details for each category-group combination
const dummyBridgeDetails = {
  "Fair-GroupA": [
    { id: 1, name: "Bridge 1", location: "Location A" },
    { id: 2, name: "Bridge 2", location: "Location B" },
  ],
  "Fair-GroupB": [
    { id: 3, name: "Bridge 3", location: "Location C" },
    { id: 4, name: "Bridge 4", location: "Location D" },
  ],
  "Poor-GroupC": [
    { id: 5, name: "Bridge 5", location: "Location E" },
    { id: 6, name: "Bridge 6", location: "Location F" },
  ],
  // Add more combinations as needed
};

const PrioritizationTable = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");

  useEffect(() => {
    setBridgeScoreData(dummyData);
    setBridgeCount(dummyData.length);
    setLoading(false);
  }, []);

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

  const handleCellClick = (category, group) => {
    const key = `${category}-${group}`;
    const data = dummyBridgeDetails[key] || [];
    setModalData(data);
    setSelectedTitle(`${category} - ${group}`);
    setShowModal(true);
  };

  return (
    <>
      <section
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "90vh",
          backgroundColor: "#F2F2F2",
          padding: "20px",
        }}
      >
        <div className="w-100" style={{ maxWidth: "1000px" }}>
          <div
            className="card-header rounded-0 p-2"
            style={{ background: "#005D7F", color: "#fff" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Bridge Prioritization Table</h5>
              <Button className="btn text-white" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                CSV
              </Button>
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
            ) : (
              <Table
                className="table table-bordered table-hover table-striped"
                style={{ fontSize: "24px" }}
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
                  {bridgeScoreData.map((row, index) => (
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
                      {["GroupA", "GroupB", "GroupC", "GroupD"].map((group) => (
                        <td
                          key={group}
                          style={{
                            textAlign: "center",
                            padding: "15px",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleCellClick(row.category, group)}
                        >
                          {row[group]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </section>

      {/* Modal for Bridge Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bridge Details - {selectedTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bridge Name</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((bridge) => (
                  <tr key={bridge.id}>
                    <td>{bridge.id}</td>
                    <td>{bridge.name}</td>
                    <td>{bridge.location}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bridges found for this group.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PrioritizationTable;
