import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import "./BridgeList.css";
import Papa from "papaparse";
import InventoryInfoDashboard from "./InventoryInfoDashboard";
import InspectionListDashboard from "./InspectionListDashboard";
import InspectionListHistory from "./InspectionListHistory";
import MapModal from "./MapModal";
import { FaSpinner } from "react-icons/fa";
import { FaFileCsv, FaFileExcel } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import "leaflet/dist/leaflet.css";
import Map from "./Map";
import FilterComponent from "./FilterComponent";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import Graph from "./GraphInventory"; // Assuming you have a Graph component for the graph view
import { useNavigate } from "react-router-dom";
import DamageSummary from "./DamageSummary";

const BridgesListDashboard = ({
  districtId,
  structureType,
  bridgeName,
  constructionType,
  setConstructionType,
  bridgeLength,
  setBridgeLength,
  age,
  setAge,
  underFacility,
  setUnderFacility,
  roadClassification,
  setRoadClassification,
  spanLength,
  setSpanLength,
  inspectionStatus, // New prop
  setInspectionStatus, // New prop
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInspectionSummaryModal, setShowInspectionSummaryModal] =
    useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showHistoryModal, setShowHistroyModal] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [viewMode, setViewMode] = useState("map"); // New state for view mode
  const [workKinds, setWorkKinds] = useState([]);
  const [damageCounts, setDamageCounts] = useState({});
  const [loadingWorkKinds, setLoadingWorkKinds] = useState(false);
  const [loadingDamageCounts, setLoadingDamageCounts] = useState(false);
  const [visualConditions, setVisualConditions] = useState([]);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllBridges(currentPage);
  }, [
    currentPage,
    districtId,
    structureType,
    constructionType,
    bridgeName,
    bridgeLength,
    age,
    underFacility,
    roadClassification,
    spanLength,
    inspectionStatus,
  ]);

  const fetchAllBridges = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);

    // Create a unique request ID to prevent race conditions
    const requestId = Date.now();
    fetchAllBridges.latestRequestId = requestId;

    try {
      // Prevent queries with uninitialized filters
      if (!districtId && !structureType && !constructionType) {
        setTableData([]);
        setBridgeCount(0);
        setLoading(false);
        return;
      }

      const set = (page - 1) * limit;

      const url = new URL(`${BASE_URL}/api/bridges`);
      const params = {
        set,
        limit,
        district: districtId || "%",
        structureType: structureType || "%",
        constructionType: constructionType || "%",
        bridgeName: bridgeName || "%",
        bridgeLength: bridgeLength || "%",
        age: age || "%",
        underFacility: underFacility || "%",
        roadClassification: roadClassification || "%",
        spanLength: spanLength || "%",
        inspectionStatus: inspectionStatus || "%",
      };

      url.search = new URLSearchParams(params).toString();

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch bridge data");

      const data = await response.json();

      // Only update state if this is the latest request
      if (fetchAllBridges.latestRequestId === requestId) {
        setTableData(data.bridges || []);
        setBridgeCount(data.totalCount || 0);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      // Only stop loading if this request is latest
      if (fetchAllBridges.latestRequestId === requestId) {
        setLoading(false);
      }
    }
  };

  // Fetch Visual Conditions from API
  useEffect(() => {
    const fetchVisualConditions = async () => {
      setLoadingConditions(true);
      try {
        const response = await fetch(`${BASE_URL}/api/visual-conditions`);
        if (!response.ok) {
          throw new Error("Failed to fetch visual conditions");
        }
        const data = await response.json();
        setVisualConditions(data);
      } catch (error) {
        console.error("Error fetching visual conditions:", error);
        setVisualConditions([
          { id: 1, visual_condition: "FAIR" },
          { id: 2, visual_condition: "GOOD" },
          { id: 3, visual_condition: "POOR" },
          { id: 4, visual_condition: "UNDER CONSTRUCTION" },
        ]);
      } finally {
        setLoadingConditions(false);
      }
    };

    fetchVisualConditions();
  }, []);

  // Fetch Work Kinds from API
  useEffect(() => {
    const fetchWorkKinds = async () => {
      setLoadingWorkKinds(true);
      try {
        const response = await fetch(`${BASE_URL}/api/work-kinds`);
        if (!response.ok) {
          throw new Error("Failed to fetch work kinds");
        }
        const data = await response.json();
        setWorkKinds(data);
      } catch (error) {
        console.error("Error fetching work kinds:", error);
        setError("Failed to load work kinds");
      } finally {
        setLoadingWorkKinds(false);
      }
    };

    fetchWorkKinds();
  }, []);

  // Fetch Damage Counts for the specific bridge
  useEffect(() => {
    const fetchDamageCounts = async () => {
      if (!selectedBridge?.uu_bms_id) return;
      setLoadingDamageCounts(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/damage-counts?uu_bms_id=${selectedBridge.uu_bms_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch damage counts");
        }
        const data = await response.json();
        const countsMap = {};
        data.forEach((item) => {
          countsMap[item.WorkKindID] = item;
        });
        setDamageCounts(countsMap);
      } catch (error) {
        console.error("Error fetching damage counts:", error);
        setError("Failed to load damage counts");
      } finally {
        setLoadingDamageCounts(false);
      }
    };

    fetchDamageCounts();
  }, [selectedBridge?.uu_bms_id]);

  const handleViewInventory = (bridge) => {
    setSelectedBridge(bridge);
    setShowModal(true);
  };

  const handleViewHistory = (bridge) => {
    setSelectedBridge(bridge);
    setShowHistroyModal(true);
  };

  const handleCloseHistoryModal = () => {
    setShowHistroyModal(false);
    setSelectedBridge(null);
  };

  const handleRowClick = (bridge) => {
    navigate("/BridgeInfoDashboard", { state: { bridge } });
  };

  const handleViewInspectionSummary = (bridge) => {
    setSelectedBridge(bridge);
    setShowInspectionSummaryModal(true);
  };

  const handleCloseInspectionSummaryModal = () => {
    setShowInspectionSummaryModal(false);
    setSelectedBridge(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBridge(null);
  };

  const handleViewInspection = (bridge) => {
    setSelectedBridge(bridge);
    setShowInspectionModal(true);
  };

  const handleCloseInspectionModal = () => {
    setShowInspectionModal(false);
    setSelectedBridge(null);
  };

  const handleZoomToBridge = (bridge) => {
    setSelectedLocation({
      latitude: bridge.x_centroid,
      longitude: bridge.y_centroid,
      name: bridge.BridgeName,
      bridgeName: `${bridge.pms_sec_id} - ${bridge.structure_no}`,
      district: bridge.district,
      road: bridge.road_name,
    });
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  const handleDownloadCSV = async () => {
    setLoadingCSV(true);
    try {
      const params = {
        district: districtId || "%",
        structureType: structureType || "%",
        constructionType: constructionType || "%",
        bridgeName: bridgeName || "%",
        bridgeLength: bridgeLength || "",
        age: age || "%",
        underFacility: underFacility || "%",
        roadClassification: roadClassification || "%",
        spanLength: spanLength || "%",
        inspectionStatus: inspectionStatus || "%", // New filter parameter
      };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${BASE_URL}/api/bridgesdownloadCsv?${queryString}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (!data.bridges || data.bridges.length === 0) {
        Swal.fire("No data available for export", "error");
        return;
      }

      const csv = Papa.unparse(data.bridges);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Bridges_Data.csv";
      link.click();
    } catch (error) {
      Swal.fire("Error!", "Failed to download CSV file", "error");
    } finally {
      setLoadingCSV(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoadingExcel(true);
    try {
      const params = {
        district: districtId || "%",
        structureType: structureType || "%",
        constructionType: constructionType || "%",
        bridgeName: bridgeName || "%",
        bridgeLength: bridgeLength || "",
        age: age || "%",
        underFacility: underFacility || "%",
        roadClassification: roadClassification || "%",
        spanLength: spanLength || "%",
        inspectionStatus: inspectionStatus || "%", // New filter parameter
      };
      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(
        `${BASE_URL}/api/bridgesdownloadExcel?${queryString}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (!data.bridges || data.bridges.length === 0) {
        Swal.fire("No data available for export", "error");
        return;
      }

      const summaryData = data.bridges;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Bridges Data");

      const columnKeys = Object.keys(summaryData[0]).filter(
        (key) =>
          key !== "ROW RANK" &&
          key !== "Overview Photos" &&
          key !== "PhotoPaths"
      );

      const columns = columnKeys.map((key) => ({
        header: key.replace(/_/g, " "),
        key: key,
        width: Math.min(
          Math.max(
            ...summaryData.map((row) =>
              row[key] ? row[key].toString().length : 10
            ),
            10
          ),
          30
        ),
      }));

      for (let i = 1; i <= 5; i++) {
        columns.push({
          header: `Overview Photo ${i}`,
          key: `photo${i}`,
          width: 22,
        });
      }
      for (let i = 1; i <= 5; i++) {
        columns.push({
          header: `Inspection Photo ${i}`,
          key: `inspection${i}`,
          width: 22,
        });
      }

      worksheet.columns = columns;

      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getRow(1).height = 25;

      for (let i = 0; i < summaryData.length; i++) {
        const item = summaryData[i];
        const overviewPhotos = item["Overview Photos"] || [];
        const inspectionPhotos = item["PhotoPaths"] || [];
        const rowData = {};
        columnKeys.forEach((key) => (rowData[key] = item[key] || ""));

        const rowIndex = worksheet.addRow(rowData).number;
        worksheet.getRow(rowIndex).height = 90;

        const insertImage = async (photoUrls, columnOffset) => {
          for (let j = 0; j < photoUrls.length && j < 5; j++) {
            try {
              const imgResponse = await fetch(photoUrls[j]);
              if (!imgResponse.ok) continue;
              const imgBlob = await imgResponse.blob();
              const arrayBuffer = await imgBlob.arrayBuffer();
              const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: "jpeg",
              });
              worksheet.addImage(imageId, {
                tl: {
                  col: columnKeys.length + columnOffset + j,
                  row: rowIndex - 1,
                },
                ext: { width: 150, height: 90 },
              });
            } catch (error) {
              console.error("Failed to load image:", photoUrls[j], error);
            }
          }
        };

        await insertImage(overviewPhotos, 0);
        await insertImage(inspectionPhotos, 5);
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `BridgeData.xlsx`);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
    } finally {
      setLoadingExcel(false);
    }
  };

  const columns = [
    {
      name: "District",
      selector: (row) => row.district || "N/A",
      sortable: true,
      wrap: true,
      grow: 0.7,
    },
    {
      name: "Structure Type",
      selector: (row) => row.structure_type || "N/A",
      sortable: true,
      wrap: true,
      grow: 0.7,
    },
    {
      name: "Construction Type",
      selector: (row) => row.construction_type || "N/A",
      sortable: true,
      wrap: true,
      grow: 0.7,
    },
    {
      name: "Road Classification",
      selector: (row) => row.road_classification || "N/A",
      sortable: true,
      wrap: true,
      grow: 0.7,
    },
    {
      name: "Bridge Name",
      selector: (row) =>
        `${row.pms_sec_id || "N/A"}, ${row.structure_no || "N/A"}`,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Length of structure (Number of span @ span length)",
      selector: (row) => row.bridge_length || "N/A",
      sortable: true,
      wrap: true,
      grow: 0.5,
    },
    {
      name: "Date Time",
      selector: (row) =>
        row.data_date_time
          ? new Date(row.data_date_time).toLocaleString()
          : "N/A",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Action",
      cell: (row) => (
        <div
          className="flex flex-wrap gap-2 justify-center"
          style={{ minWidth: "360px" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewInventory(row);
            }}
            className="bg-[#009CB8] text-white px-2 py-1 rounded hover:bg-[#007485] text-xs"
          >
            Inventory Info
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewInspection(row);
            }}
            className="bg-[#3B9895] text-white px-2 py-1 rounded hover:bg-[#2d7270] text-xs"
          >
            Inspection Info
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewInspectionSummary(row);
            }}
            className="bg-[#005D7F] text-white px-2 py-1 rounded hover:bg-[#003f5f] text-xs"
          >
            Inspection Summary
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomToBridge(row);
            }}
            className="bg-[#88B9B8] text-white px-2 py-1 rounded hover:bg-[#6a8f8f] text-xs"
          >
            Zoom To
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewHistory(row);
            }}
          >
            <FaHistory />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      grow: 3, // more space for action buttons
    },
  ];

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
      style: {
        fontSize: "13px",
        border: "1px solid #dee2e6",
      },
    },
    rows: {
      style: {
        "&:hover": {
          backgroundColor: "#f1f5f9",
          cursor: "pointer",
        },
      },
    },
    table: {
      style: {
        width: "100%",
        border: "1px solid #dee2e6",
      },
    },
    header: {
      style: {
        minHeight: "auto",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #dee2e6",
        padding: "10px",
        display: "flex",
        justifyContent: "center",
      },
    },
  };

  return (
    <>
      <div className="flex justify-between items-center p-2 bg-gray-100 border-b">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              viewMode === "map" ? "bg-[#005D7F] text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("map")}
          >
            Map
          </button>
          <button
            className={`px-3 py-1 rounded ${
              viewMode === "graph" ? "bg-[#005D7F] text-white" : "bg-gray-200"
            }`}
            onClick={() => setViewMode("graph")}
          >
            Graph
          </button>
        </div>
      </div>
      <div>
        {viewMode === "map" ? (
          <Map
            districtId={districtId}
            structureType={structureType}
            bridgeName={bridgeName}
            constructionType={constructionType}
            bridgeLength={bridgeLength}
            age={age}
            underFacility={underFacility}
            roadClassification={roadClassification}
            spanLength={spanLength}
          />
        ) : (
          <div className="p-4 text-center">
            <Graph />
          </div>
        )}
      </div>
      <div
        className="card p-0 rounded-0 text-black"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          className="card-header rounded-0 p-2"
          style={{ background: "#005D7F", color: "#fff" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <h5 className="mb-0 me-5">Inventory</h5>
              <h6 className="mb-0" id="structure-heading">
                Structures Count:
                <span
                  className="badge text-white ms-2"
                  style={{ background: "#009CB8" }}
                >
                  <h6 className="mb-0">{bridgeCount || 0}</h6>
                </span>
              </h6>
            </div>

            <FilterComponent
              constructionType={constructionType}
              setConstructionType={setConstructionType}
              bridgeLength={bridgeLength}
              setBridgeLength={setBridgeLength}
              age={age}
              setAge={setAge}
              underFacility={underFacility}
              setUnderFacility={setUnderFacility}
              roadClassification={roadClassification}
              setRoadClassification={setRoadClassification}
              inspectionStatus={inspectionStatus}
              setInspectionStatus={setInspectionStatus}
              spanLength={spanLength}
              setSpanLength={setSpanLength}
              onApplyFilters={() => fetchAllBridges(currentPage)}
            />

            <div className="flex items-center gap-1">
              <button
                className="btn text-white"
                onClick={handleDownloadCSV}
                disabled={loadingCSV}
              >
                <div className="flex items-center gap-1">
                  <FaFileCsv />
                  {loadingCSV ? "Downloading CSV..." : "CSV"}
                </div>
              </button>
              <button
                className="btn text-white"
                onClick={handleDownloadExcel}
                disabled={loadingExcel}
              >
                {loadingExcel ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Downloading
                    Excel...
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <FaFileExcel />
                    Excel
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-2" style={{ width: "100%" }}>
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
              <DataTable
                columns={columns}
                data={tableData}
                pagination
                paginationServer
                paginationTotalRows={bridgeCount}
                paginationDefaultPage={currentPage}
                paginationPerPage={itemsPerPage}
                onChangePage={(page) => setCurrentPage(page)}
                onRowClicked={(row) => handleRowClick(row)}
                customStyles={customStyles}
                noDataComponent={
                  <div className="text-center p-4">No data available</div>
                }
                highlightOnHover
                pointerOnHover
                fixedHeader
                responsive
              />

              <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Bridge Inventory Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBridge && (
                    <InventoryInfoDashboard inventoryData={selectedBridge} />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              <Modal
                show={showInspectionModal}
                onHide={handleCloseInspectionModal}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Inspection Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBridge && (
                    <InspectionListDashboard
                      bridgeId={selectedBridge.uu_bms_id}
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={handleCloseInspectionModal}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              <Modal
                show={showInspectionSummaryModal}
                onHide={handleCloseInspectionSummaryModal}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Inspection Summary</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBridge && (
                    <DamageSummary
                      workKinds={workKinds}
                      damageCounts={damageCounts}
                      loadingWorkKinds={loadingWorkKinds}
                      loadingDamageCounts={loadingDamageCounts}
                      error={error}
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={handleCloseInspectionSummaryModal}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              <Modal
                show={showMapModal}
                onHide={handleCloseMapModal}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Bridge Location on Map</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedLocation && (
                    <MapModal
                      location={selectedLocation}
                      onClose={handleCloseMapModal}
                      markerLabel={selectedLocation?.name || "Bridge Location"}
                      bridgeName={selectedLocation?.bridgeName}
                      district={selectedLocation?.district}
                      road={selectedLocation?.road}
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseMapModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>

              <Modal
                show={showHistoryModal}
                onHide={handleCloseHistoryModal}
                size="lg"
                centered
                className="custom-modal"
              >
                <Modal.Header closeButton>
                  <Modal.Title>History Records</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBridge && (
                    <InspectionListHistory
                      bridgeId={selectedBridge.uu_bms_id}
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseHistoryModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BridgesListDashboard;
