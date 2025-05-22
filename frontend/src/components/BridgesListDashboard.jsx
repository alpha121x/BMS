import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import "./BridgeList.css";
import Papa from "papaparse";
import InventoryInfoDashboard from "./InventoryInfoDashboard";
import InspectionListDashboard from "./InspectionListDashboard";
import MapModal from "./MapModal";
import { FaSpinner } from "react-icons/fa";
import { FaFileCsv, FaFileExcel } from "react-icons/fa6";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import "leaflet/dist/leaflet.css";
import Map from "./Map";
import FilterComponent from "./FilterComponent";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";

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
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
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
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllBridges(currentPage);
  }, [currentPage, districtId, structureType, constructionType, bridgeName, bridgeLength, age, underFacility, roadClassification]);

  const fetchAllBridges = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const set = (page - 1) * limit;

      const url = new URL(`${BASE_URL}/api/bridges`);
      const params = {
        set,
        limit,
        district: districtId,
        structureType,
        constructionType,
        bridgeName,
        bridgeLength,
        age,
        underFacility,
        roadClassification,
      };

      url.search = new URLSearchParams(params).toString();

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch bridge data");

      const data = await response.json();
      setTableData(data.bridges || []);
      setBridgeCount(data.totalCount || 0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInventory = (bridge) => {
    setSelectedBridge(bridge);
    setShowModal(true);
  };

  const handleRowClick = (bridge) => {
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
    const editUrl = `/BridgeInfoDashboard?bridgeData=${serializedBridgeData}`;
    window.location.href = editUrl;
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
    setLoading(true);
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
      };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${BASE_URL}/api/bridgesdownloadCsv?${queryString}`, { method: "GET" });

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
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
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
      };
      const queryString = new URLSearchParams(params).toString();

      const response = await fetch(`${BASE_URL}/api/bridgesdownloadExcel?${queryString}`, { method: "GET" });

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
        (key) => key !== "ROW RANK" && key !== "Overview Photos" && key !== "PhotoPaths"
      );

      const columns = columnKeys.map((key) => ({
        header: key.replace(/_/g, " "),
        key: key,
        width: Math.min(Math.max(...summaryData.map((row) => (row[key] ? row[key].toString().length : 10)), 10), 30),
      }));

      for (let i = 1; i <= 5; i++) {
        columns.push({ header: `Overview Photo ${i}`, key: `photo${i}`, width: 22 });
      }
      for (let i = 1; i <= 5; i++) {
        columns.push({ header: `Inspection Photo ${i}`, key: `inspection${i}`, width: 22 });
      }

      worksheet.columns = columns;

      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
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
              const imageId = workbook.addImage({ buffer: arrayBuffer, extension: "jpeg" });
              worksheet.addImage(imageId, { tl: { col: columnKeys.length + columnOffset + j, row: rowIndex - 1 }, ext: { width: 150, height: 90 } });
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
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "District",
      selector: (row) => row.district || "N/A",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Road Name",
      selector: (row) => row.road_name || "N/A",
      sortable: true,
      wrap: true,
      grow: 1.5,
      cell: (row) => (
        <div className="truncate-text" title={row.road_name || "N/A"}>
          {row.road_name || "N/A"}
        </div>
      ),
    },
    {
      name: "Structure Type",
      selector: (row) => row.structure_type || "N/A",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Construction Type",
      selector: (row) => row.construction_type || "N/A",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Road Classification",
      selector: (row) => row.road_classification || "N/A",
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Bridge Name",
      selector: (row) => `${row.pms_sec_id || "N/A"}, ${row.structure_no || "N/A"}`,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: "Date Time",
      selector: (row) => (row.data_date_time ? new Date(row.data_date_time).toLocaleString() : "N/A"),
      sortable: true,
      wrap: true,
      grow: 1.5,
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
    className="bg-[#009CB8] text-white px-1 py-0.5 rounded-1 hover:bg-[#007485]"
    style={{ minWidth: "60px", fontSize: "12px" }} // Reduced minWidth and added smaller font size
  >
    Inventory Info
  </button>
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleViewInspection(row);
    }}
    className="bg-[#3B9895] text-white px-1 py-0.5 rounded-1 hover:bg-[#2d7270]"
    style={{ minWidth: "60px", fontSize: "12px" }}
  >
    Inspection Info
  </button>
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleZoomToBridge(row);
    }}
    className="bg-[#88B9B8] text-white px-1 py-0.5 rounded-1 hover:bg-[#6a8f8f]"
    style={{ minWidth: "60px", fontSize: "12px" }}
  >
    Zoom To
  </button>
</div>
      ),
      ignoreRowClick: true,
      button: true,
      grow: 2,
      minWidth: "240px",
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
      <div>
        <Map districtId={districtId} />
      </div>
      <div
        className="card p-0 rounded-0 text-black"
        style={{ background: "#FFFFFF", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", position: "relative", width: "100%" }}
      >
        <div className="card-header rounded-0 p-2" style={{ background: "#005D7F", color: "#fff" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <h5 className="mb-0 me-5">Inventory</h5>
              <h6 className="mb-0" id="structure-heading">
                Structures Count:
                <span className="badge text-white ms-2" style={{ background: "#009CB8" }}>
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
              onApplyFilters={() => fetchAllBridges(currentPage)}
            />

            <div className="flex items-center gap-1">
              <button className="btn text-white" onClick={handleDownloadCSV} disabled={loadingCSV}>
                <div className="flex items-center gap-1">
                  <FaFileCsv />
                  {loadingCSV ? "Downloading CSV..." : "CSV"}
                </div>
              </button>
              <button className="btn text-white" onClick={handleDownloadExcel} disabled={loadingExcel}>
                {loadingExcel ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Downloading Excel...
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <FaFileExcel />
                    {loading ? "Downloading Excel..." : "Excel"}
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

          {error && <div className="text-danger text-center"><strong>Error:</strong> {error}</div>}

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
                noDataComponent={<div className="text-center p-4">No data available</div>}
                highlightOnHover
                pointerOnHover
                fixedHeader
                responsive
              />

              <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="custom-modal">
                <Modal.Header closeButton><Modal.Title>Bridge Inventory Details</Modal.Title></Modal.Header>
                <Modal.Body>{selectedBridge && <InventoryInfoDashboard inventoryData={selectedBridge} />}</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={handleCloseModal}>Close</Button></Modal.Footer>
              </Modal>

              <Modal show={showInspectionModal} onHide={handleCloseInspectionModal} size="lg" centered className="custom-modal">
                <Modal.Header closeButton><Modal.Title>Inspection Details</Modal.Title></Modal.Header>
                <Modal.Body>{selectedBridge && <InspectionListDashboard bridgeId={selectedBridge.uu_bms_id} />}</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={handleCloseInspectionModal}>Close</Button></Modal.Footer>
              </Modal>

              <Modal show={showMapModal} onHide={handleCloseMapModal} size="lg" centered className="custom-modal">
                <Modal.Header closeButton><Modal.Title>Bridge Location on Map</Modal.Title></Modal.Header>
                <Modal.Body>{selectedLocation && <MapModal location={selectedLocation} onClose={handleCloseMapModal} markerLabel={selectedLocation?.name || "Bridge Location"} bridgeName={selectedLocation?.bridgeName} district={selectedLocation?.district} road={selectedLocation?.road} />}</Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={handleCloseMapModal}>Close</Button></Modal.Footer>
              </Modal>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BridgesListDashboard;