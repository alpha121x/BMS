import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import CheckingDetailsModal from "./CheckingDetailsModal";
import Papa from "papaparse";
import Filters from "./Filters.jsx";
import { FaFileCsv } from "react-icons/fa6";

const DamagesRepairs = ({ districtId, bridgeName }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Existing view modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // New status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isRepaired, setIsRepaired] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
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

  // View modal
  const handleViewClick = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  // Status modal
  const handleStatusClick = (row) => {
    setSelectedRow(row);
    setShowStatusModal(true);
  };

  const handleStatusSave = async () => {
    if (!selectedRow?.inspection_id) {
      alert("No inspection selected.");
      return;
    }

    console.log("Saving status for ID:", selectedRow);
    console.log("Remarks:", remarks);
    console.log("Is Repaired:", isRepaired);
    console.log("Uploaded Images:", uploadedImages);
    // return;

    const formData = new FormData();
    formData.append("remarks", remarks);
    formData.append("isRepaired", isRepaired);

    uploadedImages.forEach((file) => {
      formData.append("images", file); // multer will parse this
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
        alert("Status updated successfully!");
        setShowStatusModal(false);
        setRemarks("");
        setIsRepaired(false);
        setUploadedImages([]);
        fetchData(); // refresh table
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

  // CSV Export Function
  const handleDownloadCSV = () => {
    const csvData = Papa.unparse(tableData);
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    link.target = "_blank";
    link.download = `DamagesRepairs.csv`;
    link.click();
  };

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
        <Table
          className="table table-striped table-bordered table-hover"
          style={{ fontSize: ".9rem" }}
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
            {currentData.length > 0 ? (
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
                  <td className="space-x-2">
                    <button
                      className="bg-[#009CB8] text-white px-3 py-1 rounded-md hover:bg-[#007A91]"
                      onClick={() => handleViewClick(row)}
                    >
                      View
                    </button>
                    <button
                      className="bg-[#005D7F] text-white px-3 py-1 rounded-md hover:bg-[#00425A]"
                      onClick={() => handleStatusClick(row)}
                    >
                      Repair Status
                    </button>
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
            {/* Remarks */}
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

            {/* Checkbox */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Repaired"
                checked={isRepaired}
                onChange={(e) => setIsRepaired(e.target.checked)}
              />
            </Form.Group>

            {/* Image Upload */}
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
    </div>
  );
};

export default DamagesRepairs;
