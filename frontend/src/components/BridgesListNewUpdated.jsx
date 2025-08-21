import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BASE_URL } from "./config";
import Papa from "papaparse";
import InventoryInfo from "./InventoryInfo";
import InspectionListCon from "./InspectionListCon";
import InspectionListEvaluator from "./InspectionListEvaluator";
import InspectionListRams from "./InspectionListRams";
import OverallBridgeCondition from "./OverallBridgeCondition";
import OverallBridgeConditionRams from "./OverallBridgeConditionRams";
import MapModal from "./MapModal";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaSpinner, FaFileCsv, FaFileExcel } from "react-icons/fa6";
import { MdInventory } from "react-icons/md";
import { FcInspection } from "react-icons/fc";
import { BiSolidZoomIn } from "react-icons/bi";
import { FaBridge } from "react-icons/fa6";
import "leaflet/dist/leaflet.css";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import OverallBridgeConditionEval from "./OverallBridgeConditionsEval";

const BridgesListNewUpdated = ({
  districtId,
  setDistrictId,
  structureType,
  setStructureType,
  bridgeName,
  setBridgeName,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bridgeCount, setBridgeCount] = useState(0);
  const [qcSummary, setQcSummary] = useState({});
  const itemsPerPage = 10;

  const userToken = JSON.parse(sessionStorage.getItem("userEvaluation"));
  const navigate = useNavigate();
  const user_type = userToken?.usertype;

  useEffect(() => {
    fetchAllBridges(currentPage);
  }, [currentPage, user_type, districtId, structureType, bridgeName]);

  const fetchAllBridges = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const set = (page - 1) * limit;
      let url;
      if (user_type === "consultant") {
        url = new URL(`${BASE_URL}/api/bridgesCon`);
      } else if (user_type === "rams") {
        url = new URL(`${BASE_URL}/api/bridgesRamsNew`);
      } else if (user_type === "evaluator") {
        url = new URL(`${BASE_URL}/api/bridgesEvaluatorNew`);
      }

      url.search = new URLSearchParams({
        set,
        limit,
        district: districtId,
        structureType,
        bridgeName,
      }).toString();

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch bridge data");

      const data = await response.json();
      setTableData(data.bridges || []);
      setBridgeCount(data.totalCount || 0);
      setQcSummary(data.qcSummary);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (bridge) => {
    navigate("/BridgeInfoEvaluation", { state: { bridge } });
  };

  const handleViewInventory = (bridge) => {
    setSelectedBridge(bridge);
    setShowModal(true);
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

  const handleViewCondition = (bridge) => {
    setSelectedBridge(bridge);
    setShowConditionModal(true);
  };

  const handleCloseConditionModal = () => {
    setShowConditionModal(false);
    setSelectedBridge(null);
  };

  const handleZoomToBridge = (bridge) => {
    setSelectedLocation({
      latitude: bridge.y_centroid,
      longitude: bridge.x_centroid,
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
      let url;
      if (user_type === "consultant") {
        url = new URL(`${BASE_URL}/api/bridgesConDownloadCsv`);
      } else if (user_type === "rams") {
        url = new URL(`${BASE_URL}/api/bridgesRamsDownloadCsvNew`);
      } else if (user_type === "evaluator") {
        url = new URL(`${BASE_URL}/api/bridgesEvalDownloadCsvNew`);
      }

      url.search = new URLSearchParams({
        district: districtId || "%",
        structureType: structureType || "%",
        bridgeName: bridgeName || "%",
      }).toString();

      const response = await fetch(url.toString(), { method: "GET" });
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
      link.download = "Structures_Data.csv";
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
      let url;
      if (user_type === "consultant") {
        url = new URL(`${BASE_URL}/api/bridgesConDownloadExcel`);
      } else if (user_type === "rams") {
        url = new URL(`${BASE_URL}/api/bridgesRamsDownloadExcelNew`);
      } else if (user_type === "evaluator") {
        url = new URL(`${BASE_URL}/api/bridgesEvalDownloadExcelNew`);
      }

      url.search = new URLSearchParams({
        district: districtId || "%",
        structureType: structureType || "%",
        bridgeName: bridgeName || "%",
      }).toString();

      const response = await fetch(url.toString(), { method: "GET" });
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
    },
    {
      name: "Bridge Name",
      selector: (row) =>
        `${row.pms_sec_id || "N/A"}, ${row.structure_no || "N/A"}`,
      sortable: true,
      wrap: true,
    },
    {
      name: "Structure Type",
      selector: (row) => row.structure_type || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Construction Type",
      selector: (row) => row.construction_type || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Road Classfication",
      selector: (row) => row.road_classification || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Bridge Situations",
      selector: (row) => row.bridge_situations || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Age (Y)",
      selector: (row) => row.age || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Structure Length (m)",
      selector: (row) =>
        row.bridge_length !== null && row.bridge_length !== undefined
          ? parseFloat(row.bridge_length).toFixed(2)
          : "—",
      sortable: true,
    },
    {
      name: "Date Time",
      selector: (row) =>
        row.data_date_time
          ? new Date(row.data_date_time).toLocaleString()
          : "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewInventory(row);
            }}
            className="bg-blue-400 p-1 text-white rounded hover:bg-blue-200"
            title="View Inventory"
          >
            <MdInventory />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewInspection(row);
            }}
            className="bg-blue-400 p-1 text-white rounded hover:bg-blue-200"
            title="View Inspection Info"
          >
            <FcInspection />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewCondition(row);
            }}
            className="bg-blue-400 p-1 text-white rounded hover:bg-blue-200"
            title="View Overall Bridge Condition"
          >
            <FaBridge />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomToBridge(row);
            }}
            className="bg-blue-400 p-1 text-white rounded hover:bg-blue-200"
            title="Zoom to Bridge"
          >
            <BiSolidZoomIn />
          </button>
        </div>
      ),
      ignoreRowClick: true,
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
      style: { fontSize: "13px", border: "1px solid #dee2e6" },
    },
    rows: {
      style: { "&:hover": { backgroundColor: "#f1f5f9", cursor: "pointer" } },
    },
  };

  return (
    <>
      <div
        className="card p-0 rounded-lg text-black"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="card-header p-2" style={{ background: "#005D7F" }}>
          <div className="flex items-center justify-between text-white">
            {/* Left side */}
            <h5 className="mb-0">Inventory</h5>

            {/* Middle section: Counts */}
            {user_type !== "evaluator" && (
              <div className="flex items-center gap-4">
                <h6 className="mb-0">
                  Structures Count:
                  <span
                    className="badge text-white ms-2"
                    style={{ background: "#009CB8" }}
                  >
                    {bridgeCount || 0}
                  </span>
                </h6>

                <h6 className="mb-0">
                  Approved Records:
                  <span
                    className="badge text-white ms-2"
                    style={{ background: "green" }}
                  >
                    {qcSummary?.approved_count || 0}
                  </span>
                </h6>

                <h6 className="mb-0">
                  Pending Records:
                  <span
                    className="badge text-white ms-2"
                    style={{ background: "orange" }}
                  >
                    {qcSummary?.pending_count || 0}
                  </span>
                </h6>
              </div>
            )}

            {/* Right side: Export buttons */}
            <div className="flex items-center gap-2">
              <button
                className="btn text-white"
                onClick={handleDownloadCSV}
                disabled={loadingCSV}
              >
                <FaFileCsv /> {loadingCSV ? "Downloading..." : "CSV"}
              </button>
              <button
                className="btn text-white"
                onClick={handleDownloadExcel}
                disabled={loadingExcel}
              >
                {loadingExcel ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaFileExcel /> Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-2">
          {error && (
            <div className="text-danger text-center">
              <strong>Error:</strong> {error}
            </div>
          )}
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
            responsive
          />
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Bridge Inventory Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBridge && <InventoryInfo inventoryData={selectedBridge} />}
        </Modal.Body>
      </Modal>

      <Modal
        show={showInspectionModal}
        onHide={handleCloseInspectionModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Inspection Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBridge && user_type === "consultant" && (
            <InspectionListCon bridgeId={selectedBridge.uu_bms_id} />
          )}
          {selectedBridge && user_type === "rams" && (
            <InspectionListRams bridgeId={selectedBridge.uu_bms_id} />
          )}
          {selectedBridge && user_type === "evaluator" && (
            <InspectionListEvaluator bridgeId={selectedBridge.uu_bms_id} />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showConditionModal}
        onHide={handleCloseConditionModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Overall Bridge Condition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBridge && user_type === "consultant" && (
            <OverallBridgeCondition inventoryData={selectedBridge} />
          )}
          {selectedBridge && user_type === "rams" && (
            <OverallBridgeConditionRams inventoryData={selectedBridge} />
          )}
          {selectedBridge && user_type === "evaluator" && (
            <OverallBridgeConditionEval inventoryData={selectedBridge} />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showMapModal}
        onHide={handleCloseMapModal}
        size="lg"
        centered
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
      </Modal>
    </>
  );
};

export default BridgesListNewUpdated;
