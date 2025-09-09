import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import CheckingDetailsModal from "./CheckingDetailsModal";
import Papa from "papaparse";
import { FaFileCsv } from "react-icons/fa6";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

const styles = {
  chartContainer: {
    margin: "20px 0",
    maxWidth: "100%",
    height: "400px",
  },
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

const DamagesRepairs = ({ districtId, bridgeName, structureType }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isRepaired, setIsRepaired] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [chartOptions, setChartOptions] = useState(null);
  const [chartError, setChartError] = useState(null);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairImages, setRepairImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchData();
    fetchChartData();
  }, [districtId, bridgeName, structureType]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${BASE_URL}/api/inspections-damages-repairs`);
      const params = new URLSearchParams();
      if (districtId) params.append("district", districtId);
      if (bridgeName) params.append("bridge", bridgeName);
      if (structureType) params.append("structure_type", structureType);
      url.search = params.toString();
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      if (Array.isArray(result.data)) {
        setTableData(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/damage-level-summary`);
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const response = await res.json();

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error("Invalid chart data format");
      }

      const data = response.data;
      if (data.length === 0) {
        setChartError("No chart data available");
        setChartOptions(null);
        return;
      }

      const categories = data.map((d) => d.district || "Unknown");
      const repairedDamages = data.map((d) => Number(d.repaired_damages) || 0);
      const unrepairedDamages = data.map(
        (d) => Number(d.unrepaired_damages) || 0
      );

      setChartOptions({
        chart: {
          type: "column",
          height: 400,
        },
        title: {
          text: "Damages vs Repaired (District-wise)",
        },
        xAxis: {
          categories: categories,
          title: { text: "Districts" },
          labels: {
            rotation: -45,
            style: { fontSize: "12px" },
          },
        },
        yAxis: {
          min: 0,
          title: { text: "Count" },
        },
        legend: { reversed: true },
        plotOptions: {
          series: { stacking: "normal" },
        },
        series: [
          {
            name: "Unrepaired",
            data: unrepairedDamages,
            color: "#FF6B6B",
          },
          {
            name: "Repaired",
            data: repairedDamages,
            color: "#4CAF50",
          },
        ],
        responsive: {
          rules: [
            {
              condition: { maxWidth: 500 },
              chartOptions: {
                legend: { align: "center", verticalAlign: "bottom" },
                xAxis: { labels: { rotation: -90 } },
              },
            },
          ],
        },
      });
      setChartError(null);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setChartError(err.message);
      setChartOptions(null);
    }
  };

  // --- Filter table data based on search input ---
  const filteredData = tableData.filter((row) => {
    const bridgeName = row.bridge_name?.toLowerCase() || "";
    const workKind = row.WorkKindName?.toLowerCase() || "";
    const damageLevel = row.DamageLevel?.toLowerCase() || "";
    const material = row.MaterialName?.toLowerCase() || "";
    const element = row.PartsName?.toLowerCase() || "";

    return (
      bridgeName.includes(filterText.toLowerCase()) ||
      workKind.includes(filterText.toLowerCase()) ||
      damageLevel.includes(filterText.toLowerCase()) ||
      material.includes(filterText.toLowerCase()) ||
      element.includes(filterText.toLowerCase())
    );
  });

  const handleViewClick = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleStatusClick = (row) => {
    setSelectedRow(row);

    // ✅ Pre-fill remarks if they exist
    setRemarks(row.repair_remarks || "");

    // ✅ Pre-fill checkbox state
    // if DB has true → checked, false → unchecked
    setIsRepaired(row.is_repaired === true || row.is_repaired === "true");

    setShowStatusModal(true);
  };

  const handleStatusSave = async () => {
    if (!selectedRow?.inspection_id) {
      alert("No inspection selected.");
      return;
    }
    // console.log("Saving status for ID:", selectedRow);
    // console.log("Remarks:", remarks);
    // console.log("Is Repaired:", isRepaired);
    // console.log("Uploaded Images:", uploadedImages);

    const formData = new FormData();
    formData.append("remarks", remarks);
    formData.append("isRepaired", isRepaired);
    uploadedImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        `${BASE_URL}/api/update-inspection-status/${selectedRow.inspection_id}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Status updated successfully!",
          confirmButtonColor: "#005D7F",
        });
        setShowStatusModal(false);
        setRemarks("");
        setIsRepaired(false);
        setUploadedImages([]);
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Failed to update status.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("Error saving status:", err);
      alert("Failed to save status.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!selectedRow?.inspection_id) {
      Swal.fire({
        icon: "error",
        title: "No Inspection",
        text: "No inspection selected.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setUploadedImages([...uploadedImages, ...files]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  // --- Handler to open Repair Images modal ---
  const handleRepairImagesClick = (row) => {
    if (Array.isArray(row.RepairPaths)) {
      setRepairImages(row.RepairPaths);
    } else {
      setRepairImages([]);
    }
    setCurrentImageIndex(0);
    setShowRepairModal(true);
  };

  // --- Navigation ---
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? repairImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === repairImages.length - 1 ? 0 : prev + 1
    );
  };

  // --- Conditional Row Styles ---
  const conditionalRowStyles = [
    {
      when: (row) => row.is_repaired === true || row.is_repaired === "true",
      style: {
        backgroundColor: "#d1fae5", // light green (tailwind's green-100)
        color: "#065f46", // dark green text
      },
    },
  ];

  const handleDownloadCSV = () => {
    const csvData = Papa.unparse(tableData);
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    link.target = "_blank";
    link.download = `DamagesRepairs.csv`;
    link.click();
  };

  // DataTable Columns
  const columns = [
    {
      name: "Bridge Name",
      selector: (row) => row.bridge_name || "N/A",
      sortable: true,
      width: "280px",
    },
    {
      name: "Work Kind",
      selector: (row) => row.WorkKindName || "N/A",
      sortable: true,
    },
    {
      name: "Damage Level",
      selector: (row) => row.DamageLevel || "N/A",
      sortable: true,
    },
    { name: "Damage Extent", selector: (row) => row.damage_extent || "N/A" },
    { name: "Material", selector: (row) => row.MaterialName || "N/A" },
    { name: "Element", selector: (row) => row.PartsName || "N/A" },
    {
      name: "Date Time",
      selector: (row) =>
        row.current_date_time
          ? new Date(row.current_date_time).toLocaleString()
          : "N/A",
      sortable: true,
    },
    {
      name: "Action",
      width: "300px", // ✅ wider than other columns
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="bg-[#009CB8] text-white px-2 py-1 rounded-md"
            onClick={() => handleViewClick(row)}
          >
            View
          </button>
          <button
            className="bg-[#005D7F] text-white px-2 py-1 rounded-md"
            onClick={() => handleStatusClick(row)}
          >
            Repair Status
          </button>
          <button
            className="bg-[#4CAF50] text-white px-2 py-1 rounded-md"
            onClick={() => handleRepairImagesClick(row)}
          >
            Repair Images
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="card p-0 rounded-0 text-black"
      style={{ background: "#FFFFFF" }}
    >
      <div
        className="card-header rounded-0 p-2"
        style={{ background: "#005D7F", color: "#fff" }}
      >
        <div className="flex items-center justify-between">
          <h5 className="mb-0">Damages Records</h5>
          <h5 className="mb-0" id="structure-heading">
            Count:
            <span
              className="badge text-white ms-2"
              style={{ background: "#009CB8" }}
            >
              <h6 className="mb-0">{tableData.length || 0}</h6>
            </span>
          </h5>
          <div className="flex items-center gap-1">
            <button
              className="btn text-white"
              onClick={handleDownloadCSV}
              disabled={loading}
            >
              <FaFileCsv /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="card-body p-0 pb-2">
        {/* Chart */}
        {chartError ? (
          <div className="text-center text-danger mb-3">{chartError}</div>
        ) : chartOptions ? (
          <div style={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        ) : (
          <div className="text-center mb-3">Loading chart...</div>
        )}

        <div className="p-2">
          <input
            type="text"
            placeholder="Search in table..."
            className="form-control"
            value={filterText}
            style={{ maxWidth: "300px" }}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData} // ✅ Use filtered data here
          progressPending={loading}
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent="No data available"
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
        />
      </div>

      {/* View Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Inspection Details</Modal.Title>
        </Modal.Header>
        <CheckingDetailsModal selectedRow={selectedRow} />
      </Modal>

      {/* Status Modal */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks here..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Repaired"
                checked={isRepaired}
                onChange={(e) => setIsRepaired(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Images (max 4)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative border p-1 rounded">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Repair Images Modal */}
      <Modal
        show={showRepairModal}
        onHide={() => setShowRepairModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Repair Images</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {repairImages.length > 0 ? (
            <>
              <div className="relative flex justify-center items-center">
                <img
                  src={repairImages[currentImageIndex]}
                  alt={`Repair ${currentImageIndex + 1}`}
                  style={{
                    maxHeight: "400px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                  }}
                />
                {/* Left Button */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 bg-black text-white px-3 py-1 rounded-full opacity-70 hover:opacity-100"
                >
                  ‹
                </button>
                {/* Right Button */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 bg-black text-white px-3 py-1 rounded-full opacity-70 hover:opacity-100"
                >
                  ›
                </button>
              </div>
              <p className="mt-2">
                {currentImageIndex + 1} / {repairImages.length}
              </p>
            </>
          ) : (
            <p>No repair images available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRepairModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DamagesRepairs;
