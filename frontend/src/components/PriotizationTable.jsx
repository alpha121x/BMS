import React, { useEffect, useState, useRef } from 'react';
import { Button, Table, Modal, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import Highcharts from 'highcharts';

// Dummy data for the main table
const dummyData = [
  { category: "Good", GroupA: "N.A", GroupB: "N.A", GroupC: "N.A", GroupD: "N.A" },
  { category: "Fair", GroupA: 9, GroupB: 10, GroupC: 11, GroupD: 12 },
  { category: "Poor", GroupA: 5, GroupB: 6, GroupC: 7, GroupD: 8 },
  { category: "Severe", GroupA: 1, GroupB: 2, GroupC: 3, GroupD: 4 },
];

// Dummy bridge details for each category-group combination
const dummyBridgeDetails = {
  GroupA: [
    { id: 1, district: "District A", roadName: "Sadhoke Baigpur road.", structureType: "Bridge", name: "Bridge 1", dateTime: "2024-04-01 10:00 AM" },
    { id: 2, district: "District A", roadName: "Sadhoke Baigpur road.", structureType: "Culvert", name: "Bridge 2", dateTime: "2024-04-02 02:30 PM" },
  ],
  GroupB: [
    { id: 3, district: "District B", roadName: "Sadhoke Baigpur road.", structureType: "Bridge", name: "Bridge 3", dateTime: "2024-04-03 11:15 AM" },
    { id: 4, district: "District B", roadName: "Sadhoke Baigpur road.", structureType: "Bridge", name: "Bridge 4", dateTime: "2024-04-04 01:00 PM" },
  ],
  GroupC: [
    { id: 5, district: "District C", roadName: "Sadhoke Baigpur road.", structureType: "Culvert", name: "Bridge 5", dateTime: "2024-04-05 09:45 AM" },
    { id: 6, district: "District C", roadName: "Sadhoke Baigpur road.", structureType: "Underpass", name: "Bridge 6", dateTime: "2024-04-06 03:10 PM" },
  ],
  GroupD: [
    { id: 7, district: "District D", roadName: "Sadhoke Baigpur road.", structureType: "Culvert", name: "Bridge 1", dateTime: "2024-04-07 08:30 AM" },
    { id: 8, district: "District D", roadName: "Sadhoke Baigpur road.", structureType: "Bridge", name: "Bridge 2", dateTime: "2024-04-08 12:00 PM" },
  ],
};

const PrioritizationTable = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [chartHeight, setChartHeight] = useState(0); // Initialize to 0
  const tableRef = useRef(null);

  useEffect(() => {
    setBridgeScoreData(dummyData);
    setLoading(false);

    // Set chart height based on table height
    if (tableRef.current) {
      const tableHeight = tableRef.current.getBoundingClientRect().height;
      setChartHeight(tableHeight);
    }

    // Initialize Highcharts pie chart
    const chartData = dummyData.map(row => ({
      name: row.category,
      y: Object.values(row).slice(1).reduce((sum, val) => sum + (val === "N.A" ? 0 : parseInt(val)), 0),
      color: getCategoryColor(row.category)
    }));

    Highcharts.chart('chart-container', {
      chart: {
        type: 'pie',
        height: chartHeight
      },
      title: {
        text: 'Bridge Counts by Category',
        align: 'center'
      },
      series: [{
        name: 'Categories',
        data: chartData,
        size: '60%',
        dataLabels: {
          enabled: true,
          distance: 30,
          format: '{point.name}: {point.y}',
          style: {
            fontSize: '12px'
          }
        }
      }],
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        itemStyle: {
          fontSize: '12px'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: true
        }
      }
    });
  }, [chartHeight]);

  const getCategoryStyle = (category) => {
    switch (category) {
      case "Good": return { backgroundColor: "#28a745", color: "white" };
      case "Fair": return { backgroundColor: "#ffc107", color: "black" };
      case "Poor": return { backgroundColor: "#fd7e14", color: "white" };
      case "Severe": return { backgroundColor: "#dc3545", color: "white" };
      default: return {};
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Good": return "#28a745";
      case "Fair": return "#ffc107";
      case "Poor": return "#fd7e14";
      case "Severe": return "#dc3545";
      default: return "#000000";
    }
  };

  const handleDownloadCSV = () => {
    if (!bridgeScoreData.length) {
      console.warn("No data available for CSV download.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," +
      [
        ["Category", "Group A", "Group B", "Group C", "Group D"].join(","),
        ...bridgeScoreData.map(row =>
          [row.category, row.GroupA, row.GroupB, row.GroupC, row.GroupD].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Bridges_Category_Summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCellClick = (category, group) => {
    const selectedValue = bridgeScoreData.find(row => row.category === category)?.[group];
    if (selectedValue === "N.A") return;

    const key = group;
    const data = dummyBridgeDetails[key] || [];
    setModalData(data);
    setSelectedTitle(`${category} - ${group}`);
    setShowModal(true);
  };

  return (
    <Container fluid className="py-2 bg-light mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="card shadow-sm border-0" ref={tableRef}>
            <div className="card-header border-1 text-white p-2 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-black">Bridge Prioritization Table</h5>
              <Button variant="light" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                CSV
              </Button>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="spinner-border mx-auto my-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <Table bordered hover striped className="mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">Category</th>
                      <th className="text-center">Group A</th>
                      <th className="text-center">Group B</th>
                      <th className="text-center">Group C</th>
                      <th className="text-center">Group D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bridgeScoreData.map((row, index) => (
                      <tr key={index}>
                        <td className="text-center" style={getCategoryStyle(row.category)}>
                          {row.category}
                        </td>
                        {["GroupA", "GroupB", "GroupC", "GroupD"].map(group => (
                          <td
                            key={group}
                            className="text-center"
                            style={{ cursor: row[group] !== "N.A" ? "pointer" : "default" }}
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
        </Col>
        <Col md={4} className="d-flex align-items-center">
          <div className="card shadow-sm border-1 w-100">
            <div className="card-body p-2">
              <div id="chart-container"></div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bridges Category - {selectedTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData.length > 0 ? (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Road Name</th>
                  <th>Structure Type</th>
                  <th>Bridge Name</th>
                  <th>Date Time</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((bridge, idx) => (
                  <tr key={idx}>
                    <td>{bridge.district}</td>
                    <td>{bridge.roadName}</td>
                    <td>{bridge.structureType}</td>
                    <td>{bridge.name}</td>
                    <td>{bridge.dateTime}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bridges found for this group.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PrioritizationTable;