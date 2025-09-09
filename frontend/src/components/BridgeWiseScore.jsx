import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";

const BridgeWiseScore = ({ districtId, structureType, bridgeName }) => {
  const [bridgeScoreData, setBridgeScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const [bridgeCount, setBridgeCount] = useState(0);
  const [selectedType, setSelectedType] = useState("damage_scores"); // Default active type

  const handleClick = (bridge) => {
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
    const editUrl = `/BridgeInformation?bridgeData=${serializedBridgeData}`;
    window.location.href = editUrl;
  };

  useEffect(() => {
    fetchData(); // Fetch data whenever selectedType or filters change
  }, [districtId, structureType, bridgeName, selectedType]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/bridge-scores?type=${selectedType}&district=${districtId}&structureType=${structureType}&bridgeName=${bridgeName}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setBridgeScoreData(result.data);
        setBridgeCount(result.data.length); // Use length of returned data
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentData = bridgeScoreData; // Full dataset for client-side pagination

  // Dynamic columns based on selected type
  const getColumns = (type) => {
    const baseColumns = [
      {
        name: "Bridge Name",
        selector: (row) => row.bridge_name || "N/A",
        sortable: true,
      },
      {
        name: "District",
        selector: (row) => row.district || "N/A",
        sortable: true,
      },
    ];

    const typeSpecificColumns = {
      damage_scores: [
        {
          name: "Total Damage Score",
          selector: (row) =>
            parseFloat(row.total_damage_score || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Critical Damage Score",
          selector: (row) =>
            parseFloat(row.critical_damage_score || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Average Damage Score",
          selector: (row) =>
            parseFloat(row.average_damage_score || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "BPI",
          selector: (row) =>
            parseFloat(row.bridge_performance_index || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Damage Score Group",
          selector: (row) => row.damage_score_group || "N/A",
          sortable: true,
        },
      ],
      inventory_score: [
        {
          name: "Road Classification Weight",
          selector: (row) =>
            parseFloat(row.road_classification_weight || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Carriageway Weight",
          selector: (row) =>
            parseFloat(row.carriageway_weight || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Bridge Age Weight",
          selector: (row) =>
            parseFloat(row.bridge_age_weight || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Crossing Weight",
          selector: (row) =>
            parseFloat(row.crossing_weight || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Dimensions Weight",
          selector: (row) =>
            parseFloat(row.dimensions_weight || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Inventory Score",
          selector: (row) =>
            parseFloat(row.inventory_score || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "Inventory Weight Group",
          selector: (row) => row.inventory_weight_group || "N/A",
          sortable: true,
        },
      ],
      total_bridge_score: [
        {
          name: "TBS Total Damage",
          selector: (row) =>
            parseFloat(row.tbs_totaldamage || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "TBS Average Damage",
          selector: (row) =>
            parseFloat(row.tbs_averagedamage || "N/A").toFixed(2),
          sortable: true,
        },
        {
          name: "TBS Critical Damage",
          selector: (row) =>
            parseFloat(row.tbs_criticaldamage || "N/A").toFixed(2),
          sortable: true,
        },
      ],
    };

    return [
      ...baseColumns,
      ...typeSpecificColumns[type],
      {
        name: "Bridge Info",
        cell: (row) => (
          <button
            onClick={() => handleClick(row)}
            className="btn btn-sm"
            style={{ backgroundColor: "#3B9996", color: "white" }}
          >
            Bridge Info
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ];
  };

const handleDownloadCSV = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/bridge-scores-export?district=${districtId}&structureType=${structureType}&bridgeName=${bridgeName}`
    );
    const json = await response.json();
    const data = json.Data;

    if (!data || !data.length) {
      console.warn("No data available for CSV download.");
      return;
    }

    // Function to safely escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const str = value.toString();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = Object.keys(data[0]).map(escapeCSV).join(",");
    const rows = data.map((row) =>
      Object.values(row).map(escapeCSV).join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BridgeWiseScore.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading CSV:", error);
  }
};

const handleDownloadExcel = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/bridge-scores-export?district=${districtId}&structureType=${structureType}&bridgeName=${bridgeName}`
    );
    const json = await response.json();
    const data = json.Data;

    if (!data || !data.length) {
      console.warn("No data available for Excel download.");
      return;
    }

    // Optional: Convert arrays to comma-separated strings for Excel
    const formattedData = data.map((row) => {
      const newRow = {};
      for (const key in row) {
        if (Array.isArray(row[key])) {
          newRow[key] = row[key].filter(Boolean).join(", "); // Join only non-empty values
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
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
    link.download = `BridgeWiseScore.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading Excel:", error);
  }
};



  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#005D7F",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
        border: "1px solid #dee2e6",
      },
    },
    cells: {
      style: { fontSize: "13px", border: "1px solid #dee2e6" },
    },
    rows: {
      style: { "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" } },
    },
  };

  return (
    <>
      <section className="bg-white border-1 p-0 rounded-0 shadow-md">
        <div className="row">
          <div className="col-md-12">
            <div
              className="card-header rounded-0 p-2"
              style={{ background: "#005D7F", color: "#fff" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h5 className="mb-0">Bridge Wise Score</h5>
                  <h6 className="mb-0" id="structure-heading">
                    Count:
                    <span
                      className="badge text-white ms-2"
                      style={{ background: "#009CB8" }}
                    >
                      <h6 className="mb-0">{bridgeCount || 0}</h6>
                    </span>
                  </h6>
                </div>

                {/* 🔹 Type Selection Buttons - centered */}
                <div className="flex gap-2 justify-center flex-grow">
                  <button
                    className={`btn text-white ${
                      selectedType === "damage_scores"
                        ? "btn-primary"
                        : "btn-info"
                    }`}
                    onClick={() => setSelectedType("damage_scores")}
                  >
                    Damage Scores
                  </button>
                  <button
                    className={`btn text-white ${
                      selectedType === "inventory_score"
                        ? "btn-primary"
                        : "btn-info"
                    }`}
                    onClick={() => setSelectedType("inventory_score")}
                  >
                    Inventory Score
                  </button>
                  <button
                    className={`btn text-white ${
                      selectedType === "total_bridge_score"
                        ? "btn-primary"
                        : "btn-info"
                    }`}
                    onClick={() => setSelectedType("total_bridge_score")}
                  >
                    Total Bridge Score
                  </button>
                </div>

                {/* 🔹 Download Buttons - aligned right */}
                <div className="flex gap-2">
                  <button
                    className="btn text-white"
                    onClick={handleDownloadCSV}
                    style={{ backgroundColor: "#28a745" }}
                  >
                    <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
                    CSV
                  </button>
                  <button
                    className="btn text-white"
                    onClick={handleDownloadExcel}
                    style={{ backgroundColor: "#007bff" }}
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
              ) : (
                <>
                  <DataTable
                    key={selectedType} // Ensures DataTable re-renders on type change
                    columns={getColumns(selectedType)}
                    data={currentData}
                    progressPending={loading}
                    pagination
                    paginationPerPage={itemsPerPage}
                    highlightOnHover
                    responsive
                    persistTableHead
                    noDataComponent="No data available"
                    customStyles={customStyles}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BridgeWiseScore;
