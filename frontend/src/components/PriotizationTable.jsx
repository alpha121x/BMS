import React, { useEffect, useState, useRef } from "react";
import { Button, Table, Modal, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import Highcharts from "highcharts";
import DataTable from "react-data-table-component";
import styled from "styled-components";
import { BASE_URL } from "./config";
import Map from "./Map";

// Utility function to convert Excel serial date to human-readable date
const excelSerialToDate = (serial) => {
  if (!serial || isNaN(serial)) return "Invalid Date";
  const excelEpochOffset = 25569;
  const secondsInDay = 86400;
  const utcDate = new Date((serial - excelEpochOffset) * secondsInDay * 1000);
  const offsetDate = new Date(
    utcDate.getTime() + utcDate.getTimezoneOffset() * 60 * 1000
  );
  return offsetDate.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// Styled components for custom table styling
const StyledDataTable = styled(DataTable)`
  .rdt_Table {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .rdt_TableHeadRow {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  .rdt_TableRow {
    transition: background-color 0.2s;
    &:hover {
      background-color: #f1f3f5 !important;
    }
  }

  .rdt_Pagination {
    background-color: #ffffff;
    border-top: 1px solid #dee2e6;
    padding: 10px;
  }
`;

const PrioritizationTable = () => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [bridgeDetails, setBridgeDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [chartHeight, setChartHeight] = useState(300); // Default height
  const [selectedCategory, setSelectedCategory] = useState("Severe");
  const [activeTab, setActiveTab] = useState("table"); // State to manage Table/Map tabs
  const tableRef = useRef(null);
  const chartRef = useRef(null); // Ref to store the chart instance

  // DataTable columns configuration
  const columns = [
    {
      name: "District",
      selector: (row) => row.district,
      sortable: true,
      cell: (row) => (
        <span style={{ color: getCategoryColor(row.category) }}>
          {row.district}
        </span>
      ),
    },
    {
      name: "Road Name",
      selector: (row) => row.roadName,
      sortable: true,
    },
    {
      name: "Structure Type",
      selector: (row) => row.structureType,
      sortable: true,
    },
    {
      name: "Bridge Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Date Time",
      selector: (row) => row.dateTime,
      sortable: true,
    },
  ];

  // Custom styles for conditional formatting
  const customStyles = {
    rows: {
      style: {
        minHeight: "50px",
        backgroundColor: (row) => getRowBackgroundColor(row.category),
      },
    },
    headCells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#e9ecef",
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/bms_matrix`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();

        const categories = ["Good", "Fair", "Poor", "Severe"];
        const groups = ["GroupA", "GroupB", "GroupC", "GroupD"];
        const districtMapping = {
          1: "GroupA",
          2: "GroupB",
          3: "GroupC",
          4: "GroupD",
        };

        const scoreData = categories.map((category) => {
          const row = { category };
          groups.forEach((group) => {
            row[group] = "N.A";
          });
          return row;
        });

        const details = {
          GroupA: [],
          GroupB: [],
          GroupC: [],
          GroupD: [],
        };

        rawData.forEach((item) => {
          const group = districtMapping[item.district_id] || "GroupA";
          const category = item.damagecategory;

          const row = scoreData.find((r) => r.category === category);
          if (row) {
            row[group] = row[group] === "N.A" ? 1 : row[group] + 1;
          }

          if (details[group]) {
            details[group].push({
              id: item.uu_bms_id,
              district: item.district,
              roadName: item.road_name,
              structureType: item.structure_type,
              name: item.structure_no,
              dateTime: excelSerialToDate(parseFloat(item.date_time)),
              category: item.damagecategory,
            });
          }
        });

        setBridgeScoreData(scoreData);
        setBridgeDetails(details);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update chart height when tableRef is available
  useEffect(() => {
    if (tableRef.current) {
      const tableHeight = tableRef.current.getBoundingClientRect().height;
      setChartHeight(tableHeight || 300); // Fallback to 300px if height is 0
    }
  }, [loading, bridgeScoreData]); // Recompute height when data loads

  // Initialize or update Highcharts pie chart
  useEffect(() => {
    if (!bridgeScoreData.length || loading) return; // Wait for data to load

    const chartData = bridgeScoreData
      .map((row) => ({
        name: row.category,
        y: Object.values(row)
          .slice(1)
          .reduce((sum, val) => sum + (val === "N.A" ? 0 : parseInt(val)), 0),
        color: getCategoryColor(row.category),
      }))
      .filter((item) => item.y > 0); // Filter out categories with zero counts

    // Calculate total counts
    const totalCount = chartData.reduce((sum, item) => sum + item.y, 0);

    console.log("Chart Data:", chartData); // Debug log to verify data

    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const chartContainer = document.getElementById("chart-container");
    if (chartContainer) {
      chartRef.current = Highcharts.chart("chart-container", {
        chart: {
          type: "pie",
          height: chartHeight || 300, // Use chartHeight with fallback
        },
        title: {
          text: `Bridge Counts by Category (Total: ${totalCount})`,
          align: "center",
        },
        series: [
          {
            name: "Categories",
            data: chartData.length
              ? chartData
              : [{ name: "No Data", y: 1, color: "#cccccc" }], // Fallback for empty data
            size: "60%",
            dataLabels: {
              enabled: true,
              distance: 30,
              format: "{point.name}: {point.y}",
              style: { fontSize: "12px" },
            },
          },
        ],
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "12px" },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: "pointer",
            showInLegend: true,
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [bridgeScoreData, chartHeight, loading]); // Re-render chart when data or height changes

  // Function to get color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Good":
        return "#28a745"; // Green
      case "Fair":
        return "#ffc107"; // Yellow
      case "Poor":
        return "#fd7e14"; // Orange
      case "Severe":
        return "#dc3545"; // Red
      default:
        return "#ffffff"; // White for N.A
    }
  };

  const getCellColor = (category, value, groupIndex) => {
    const shades = categoryGroupColors[category];
    return shades?.[groupIndex] || "#ffffff";
  };

  const categoryGroupColors = {
    Good: ["#218838", "#28a745", "#5ec17a", "#c8e6c9"], // Dark → Light green
    Fair: ["#e0a800", "#ffc107", "#ffda66", "#fff3cd"], // Dark → Light yellow
    Poor: ["#d85f00", "#fd7e14", "#ffa25c", "#ffe5d0"], // Dark → Light orange
    Severe: ["#bd2130", "#dc3545", "#e4606d", "#f8d7da"], // Dark → Light red
  };

  const getRowBackgroundColor = (category) => {
    switch (category) {
      case "Good":
        return "#e6f3e6";
      case "Fair":
        return "#fff3cd";
      case "Poor":
        return "#ffe4cc";
      case "Severe":
        return "#f8d7da";
      default:
        return "#ffffff";
    }
  };

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
    link.setAttribute("download", "Bridges_Category_Summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabClick = (category) => {
    setSelectedCategory(category);
    setActiveTab("table"); // Reset to table view when selecting a category
  };

  const handleViewTabChange = (key) => {
    setActiveTab(key);
  };

  const filteredBridgeDetails = () => {
    const selectedRow = bridgeScoreData.find(
      (row) => row.category === selectedCategory
    );
    if (!selectedRow) return [];
    const groups = ["GroupA", "GroupB", "GroupC", "GroupD"];
    const details = [];
    groups.forEach((group) => {
      if (selectedRow[group] !== "N.A") {
        const groupDetails = bridgeDetails[group] || [];
        const filteredDetails = groupDetails.filter(
          (detail) => detail.category === selectedCategory
        );
        details.push(...filteredDetails);
      }
    });
    return details;
  };
  return (
    <Container fluid className="py-2 bg-light mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="card shadow-sm border-1" ref={tableRef}>
            <div className="card-header border-1 text-white p-2 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-black">Bridge Prioritization Table</h5>
              <Button variant="light" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" /> CSV
              </Button>
            </div>
            <div className="card-body p-5">
              {loading ? (
                <div className="spinner-border mx-auto my-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <Table bordered hover striped className="mb-0 p-2">
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
                    {bridgeScoreData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="text-center">{row.category}</td>
                        {["GroupA", "GroupB", "GroupC", "GroupD"].map(
                          (group, groupIndex) => (
                            <td
                              key={group}
                              className="text-center"
                              style={{
                                backgroundColor: getCellColor(
                                  row.category,
                                  row[group],
                                  groupIndex
                                ),
                              }}
                            >
                              {row[group]}
                            </td>
                          )
                        )}
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
              <div id="chart-container" style={{ minHeight: "300px" }}></div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
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

      <Container fluid className="py-2 bg-light mt-3">
        <Row className="justify-content-center">
          <Col md={12}>
            <div className="card shadow-sm border-0">
              <div className="card-header border-1 p-2 d-flex justify-content-between align-items-center">
                <div>
                  {["Good", "Fair", "Poor", "Severe"].map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category
                          ? "primary"
                          : "outline-primary"
                      }
                      onClick={() => handleTabClick(category)}
                      className="mx-1"
                    >
                      {category}
                    </Button>
                  ))}
                  <Button
                    variant={
                      activeTab === "map" ? "primary" : "outline-primary"
                    }
                    onClick={() => handleViewTabChange("map")}
                    className="mx-1"
                  >
                    Map
                  </Button>
                </div>
              </div>
              <div className="card-body p-0">
                {activeTab === "table" ? (
                  <StyledDataTable
                    columns={columns}
                    data={filteredBridgeDetails()}
                    customStyles={customStyles}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50]}
                    highlightOnHover
                    striped
                    noDataComponent="No bridges found for this category."
                    progressPending={loading}
                    progressComponent={
                      <div
                        className="spinner-border mx-auto my-3"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    }
                  />
                ) : (
                  <Map />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default PrioritizationTable;
