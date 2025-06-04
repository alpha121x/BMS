import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import Highcharts from "highcharts";
import DataTable from "react-data-table-component";
import styled from "styled-components";
import { BASE_URL } from "./config";
import PrioritizationMap from "./PriortizationMap";
import Header from "./Header";
import Footer from "./Footer";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import PriortizationModal from "./PriortizationModal";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";


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

const PrioritizationTable = ({ districtId }) => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [bridgeDetails, setBridgeDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [chartHeight, setChartHeight] = useState(300);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeTab, setActiveTab] = useState("map");
  const [searchTerm, setSearchTerm] = useState("");
  const tableRef = useRef(null);
  const chartRef = useRef(null);
    const navigate = useNavigate(); // Must be inside a component

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
      name: "Damage Score",
      selector: (row) => row.score, // Update to use `score` instead of `damagescore`
      sortable: true,
    },
    {
      name: "Bridge Information",
      selector: (row) => row.uu_bms_id,
      sortable: false,
      cell: (row) => (
        <span
          onClick={() =>
            navigate(`/PrioritizationInformation?uu_bms_id=${row.id}`)
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#007bff",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#e6f0ff")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <FaEye size={18} /> {/* Eye icon */}
          View Details
        </span>
      ),
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
        paddingLeft: "6px",
        paddingRight: "6px",
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "#e9ecef",
      },
    },
    cells: {
      style: {
        paddingLeft: "6px",
        paddingRight: "6px",
      },
    },
  };

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/bms-matrix`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();

        const categories = ["Good", "Fair", "Poor", "Severe"];
        const groups = [
          "Critical Structures",
          "High-Value Structures",
          "Moderate-Value Structures",
          "Basic Structures",
        ];
        const districtMapping = {
          1: "Critical Structures",
          2: "High-Value Structures",
          3: "Moderate-Value Structures",
          4: "Basic Structures",
        };

        const scoreData = categories.map((category) => {
          const row = { category };
          groups.forEach((group) => {
            row[group] = "N.A";
          });
          return row;
        });

        const details = {
          "Critical Structures": [],
          "High-Value Structures": [],
          "Moderate-Value Structures": [],
          "Basic Structures": [],
        };

        rawData.forEach((item) => {
          const group =
            districtMapping[item.district_id] || "Critical Structures";
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
              name: item.bridge_name,
              dateTime: excelSerialToDate(parseFloat(item.date_time)),
              category: item.damagecategory,
              score: item.damagescore,
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
      setChartHeight(tableHeight || 300);
    }
  }, [loading, bridgeScoreData]);

  // Initialize or update Highcharts pie chart
  useEffect(() => {
    if (!bridgeScoreData.length || loading) return;

    const chartData = bridgeScoreData
      .map((row) => ({
        name: `${row.category} (${categoryRanges[row.category]})`,
        y: Object.values(row)
          .slice(1)
          .reduce((sum, val) => sum + (val === "N.A" ? 0 : parseInt(val)), 0),
        color: getCategoryColor(row.category),
      }))
      .filter((item) => item.y > 0);

    const totalCount = chartData.reduce((sum, item) => sum + item.y, 0);

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const chartContainer = document.getElementById("chart-container");
    if (chartContainer) {
      chartRef.current = Highcharts.chart("chart-container", {
        chart: {
          type: "pie",
          height: chartHeight || 300,
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
              : [{ name: "No Data", y: 1, color: "#cccccc" }],
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

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [bridgeScoreData, chartHeight, loading]);

  // Function to get color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Good":
        return "#28a745";
      case "Fair":
        return "#ffc107";
      case "Poor":
        return "#fd7e14";
      case "Severe":
        return "#dc3545";
      default:
        return "#ffffff";
    }
  };

  const getCellColor = (category, value, groupIndex) => {
    const shades = categoryGroupColors[category];
    return shades?.[groupIndex] || "#ffffff";
  };

  const categoryGroupColors = {
    Good: ["#218838", "#28a745", "#5ec17a", "#c8e6c9"],
    Fair: ["#e0a800", "#ffc107", "#ffda66", "#fff3cd"],
    Poor: ["#d85f00", "#fd7e14", "#ffa25c", "#ffe5d0"],
    Severe: ["#bd2130", "#dc3545", "#e4606d", "#f8d7da"],
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
        [
          "Category",
          "Critical Structures (25-30)",
          "High-Value Structures (20-24)",
          "Moderate-Value Structures (15-19)",
          "Basic Structures (10-14)",
        ].join(","),
        ...bridgeScoreData.map((row) =>
          [
            row.category,
            row["Critical Structures"],
            row["High-Value Structures"],
            row["Moderate-Value Structures"],
            row["Basic Structures"],
          ].join(",")
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
    setActiveTab("table");
  };

  const handleViewTabChange = (key) => {
    setActiveTab(key);
  };

  // Handle cell click to show bridge details in modal
  const handleCellClick = (category, group) => {
    if (bridgeDetails[group] && bridgeDetails[group].length > 0) {
      const filteredBridges = bridgeDetails[group]
        .filter((bridge) => bridge.category === category)
        .sort((a, b) => b.score - a.score); // Sort by score descending
      setModalData(filteredBridges);
      setSelectedTitle(`${category} (${categoryRanges[category]}) - ${group}`);
      setShowModal(true);
    }
  };

  const filteredBridgeDetails = () => {
    const selectedRow = bridgeScoreData.find(
      (row) => row.category === selectedCategory
    );
    if (!selectedRow) return [];
    const groups = [
      "Critical Structures",
      "High-Value Structures",
      "Moderate-Value Structures",
      "Basic Structures",
    ];
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

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter data based on search term
  const filteredData = filteredBridgeDetails()
        .filter((row) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (row.district || "").toLowerCase().includes(searchLower) ||
            (row.roadName || "").toLowerCase().includes(searchLower) ||
            (row.structureType || "").toLowerCase().includes(searchLower) ||
            (row.name || "").toLowerCase().includes(searchLower) ||
            (row.dateTime || "").toLowerCase().includes(searchLower) ||
            (row.score || "").toString().toLowerCase().includes(searchLower)
          );
        })
  .sort((a, b) => b.score - a.score); // Sort by score descending

  // Define group metadata
  const groupMetadata = {
    "Critical Structures": {
      scoreRange: "25–30",
      description:
        "Highly important infrastructure critical for connectivity, safety, or economic activity.",
    },
    "High-Value Structures": {
      scoreRange: "20–24",
      description:
        "Important structures that support significant traffic or strategic routes.",
    },
    "Moderate-Value Structures": {
      scoreRange: "15–19",
      description:
        "Moderately important structures with secondary significance, mainly on less critical routes.",
    },
    "Basic Structures": {
      scoreRange: "10–14",
      description:
        "Low-priority structures, typically with minimal impact on the overall network.",
    },
  };

  // Define category descriptions (optional)
  const categoryDescriptions = {
    Good: "Structures in good condition with minimal damage.",
    Fair: "Structures with moderate damage, still functional.",
    Poor: "Structures with significant damage, may need repairs.",
    Severe: "Structures with critical damage, urgent repairs needed.",
  };

  const categoryRanges = {
    Good: "~200",
    Fair: "~500",
    Poor: "~1000",
    Severe: "~1001",
  };

  const groupInventoryRanges = {
    "Critical Structures": "25–30",
    "High-Value Structures": "20–24",
    "Moderate-Value Structures": "15–19",
    "Basic Structures": "10–14",
  };

  return (
    <>
      {!districtId && <Header />}
      <Container fluid className="py-2 bg-light mt-[55px]">
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
                        {[
                          "Critical Structures",
                          "High-Value Structures",
                          "Moderate-Value Structures",
                          "Basic Structures",
                        ].map((group) => (
                          <th key={group} className="text-center">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {group}: {groupMetadata[group].scoreRange}
                                  <br />
                                  {groupMetadata[group].description}
                                </Tooltip>
                              }
                            >
                              <span>
                                {group} ({groupInventoryRanges[group]})
                              </span>
                            </OverlayTrigger>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bridgeScoreData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="text-center">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {row.category} ({categoryRanges[row.category]}
                                  )
                                  <br />
                                  {categoryDescriptions[row.category]}
                                </Tooltip>
                              }
                            >
                              <span>
                                {row.category} ({categoryRanges[row.category]})
                              </span>
                            </OverlayTrigger>
                          </td>
                          {[
                            "Critical Structures",
                            "High-Value Structures",
                            "Moderate-Value Structures",
                            "Basic Structures",
                          ].map((group, groupIndex) => (
                            <td
                              key={group}
                              className="text-center"
                              style={{
                                backgroundColor: getCellColor(
                                  row.category,
                                  row[group],
                                  groupIndex
                                ),
                                cursor:
                                  row[group] !== "N.A" ? "pointer" : "default",
                              }}
                              onClick={() =>
                                row[group] !== "N.A" &&
                                handleCellClick(row.category, group)
                              }
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
                <div id="chart-container" style={{ minHeight: "300px" }}></div>
              </div>
            </div>
          </Col>
        </Row>

         <PriortizationModal
          showModal={showModal}
          setShowModal={setShowModal}
          selectedTitle={selectedTitle}
          modalData={modalData}
        />

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
                  {activeTab === "table" && (
                    <>
                      <div className="p-3">
                        <Form.Control
                          type="text"
                          placeholder="Search bridges..."
                          value={searchTerm}
                          onChange={handleSearch}
                          style={{ maxWidth: "300px", marginBottom: "10px" }}
                        />
                      </div>
                      <StyledDataTable
                        columns={columns}
                        data={filteredData}
                        customStyles={customStyles}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50]}
                        highlightOnHover
                        striped
                        noDataComponent={
                          searchTerm
                            ? "No matching bridges found."
                            : "No bridges found for this category."
                        }
                        progressPending={loading}
                        progressComponent={
                          <div
                            className="spinner-border mx-auto my-3"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        }
                        defaultSortFieldId="score" // Set default sort field
                        defaultSortAsc={false} // Sort descending by default
                      />
                    </>
                  )}
                  {activeTab === "map" && <PrioritizationMap districtId={districtId} />}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>
      {!districtId && <Footer />}
    </>
  );
};

export default PrioritizationTable;
