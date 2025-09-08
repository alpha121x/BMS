import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import CheckingDetailsModal from "./CheckingDetailsModal";
import Papa from "papaparse";
import { FaFileCsv } from "react-icons/fa6";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const styles = {
  container: {
    maxWidth: "100%",
    overflowX: "auto",
    padding: "0 15px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    padding: "10px 15px",
  },
  chartContainer: {
    margin: "20px 0",
    maxWidth: "100%",
    height: "400px",
  },
  table: {
    marginBottom: "20px",
    minWidth: "700px",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  imagePreview: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
};

const DamagesRepairs = ({ districtId, bridgeName }) => {
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

  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
    fetchChartData();
  }, [districtId, bridgeName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${BASE_URL}/api/inspections-damages-repairs`);
      const params = new URLSearchParams();
      if (districtId) params.append("district", districtId);
      if (bridgeName) params.append("bridge", bridgeName);
      url.search = params.toString();
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch table data");
      const result = await response.json();
      if (Array.isArray(result.data)) {
        setTableData(result.data);
      } else {
        throw new Error("Invalid table data format");
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

      // Validate response structure
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error("Invalid chart data format");
      }

      const data = response.data;

      // Check if data is empty
      if (data.length === 0) {
        setChartError("No chart data available");
        setChartOptions(null);
        return;
      }

      const categories = data.map((d) => d.district || "Unknown");
      const totalDamages = data.map((d) => Number(d.total_damages) || 0);
      const repairedDamages = data.map((d) => Number(d.repaired_damages) || 0);
      const unrepairedDamages = data.map((d) => Number(d.unrepaired_damages) || 0);

      setChartOptions({
        chart: {
          type: "column",
          height: 400,
        },
        title: {
          text: "Severe Damages vs Repaired (District-wise)",
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

  const handleViewClick = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleStatusClick = (row) => {
    setSelectedRow(row);
    setShowStatusModal(true);
  };

  const handleStatusSave = async () => {
    if (!selectedRow?.inspection_id) {
      alert("No inspection selected.");
      return;
    }
    const formData = new FormData();
    formData.append("remarks", remarks);
    formData.append("isRepaired", isRepaired);
    uploadedImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        `${BASE_URL}/api/update-inspection-status/${selectedRow.inspection_id}`,
        { method: "POST", body: formData }
      );
      const result = await response.json();
      if (result.success) {
        alert("Status updated successfully!");
        setShowStatusModal(false);
        setRemarks("");
        setIsRepaired(false);
        setUploadedImages([]);
        fetchData();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Error saving status:", err);
      alert("Failed to save status.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 4) {
      alert("You can upload up to 4 images only.");
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

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleDownloadCSV = () => {
    const csvData = Papa.unparse(tableData);
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    link.download = `DamagesRepairs.csv`;
    link.click();
  };

  return (
    <div className="card rounded-0 text-black" style={{ background: "#FFFFFF" }}>
      <div
        className="card-header rounded-0"
        style={{ ...styles.cardHeader, background: "#005D7F", color: "#fff" }}
      >
        <h5 className="mb-0">Damages Records</h5>
        <h5 className="mb-0">
          Count:
          <span
            className="badge text-white ms-2"
            style={{ background: "#009CB8" }}
          >
            {tableData.length || 0}
          </span>
        </h5>
        <Button
          variant="light"
          onClick={handleDownloadCSV}
          disabled={loading}
          className="d-flex align-items-center gap-1"
        >
          <FaFileCsv /> CSV
        </Button>
      </div>

      <div className="card-body p-3" style={styles.container}>
        {/* Chart */}
        {chartError ? (
          <div className="text-center text-danger mb-3">
            {chartError}
          </div>
        ) : chartOptions ? (
          <div style={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        ) : (
          <div className="text-center mb-3">Loading chart...</div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <Table
            striped
            bordered
            hover
            style={styles.table}
            className="table-sm"
          >
            <thead>
              <tr>
                <th>Bridge Name</th>
                <th>Work Kind</th>
                <th>Damage Level</th>
                <th>Damage Extent</th>
                <th>Material</th>
                <th>Element</th>
                <th>Date Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    Error: {error}
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.bridge_name || "N/A"}</td>
                    <td>{row.WorkKindName || "N/A"}</td>
                    <td>{row.DamageLevel || "N/A"}</td>
                    <td>{row.damage_extent || "N/A"}</td>
                    <td>{row.MaterialName || "N/A"}</td>
                    <td>{row.PartsName || "N/A"}</td>
                    <td>
                      {row.current_date_time
                        ? new Date(row.current_date_time).toLocaleString()
                        : "N/A"}
                    </td>
                    <td style={styles.actionButtons}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewClick(row)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusClick(row)}
                      >
                        Repair Status
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Inspection Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CheckingDetailsModal selectedRow={selectedRow} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
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
              <div style={styles.imagePreview} className="mt-3">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="position-relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        padding: "2px 6px",
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowStatusModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DamagesRepairs;