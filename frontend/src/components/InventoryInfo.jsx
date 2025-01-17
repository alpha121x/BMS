import React, { useState } from "react";
import { Row, Col, Form, Modal } from "react-bootstrap";

const InventoryInfo = ({ inventoryData }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedSpan, setSelectedSpan] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false); // Show upload options

  const photos = inventoryData?.photos || []; // Defaults to empty array if no photos

  const spanphotos = inventoryData?.images_spans || []; // Defaults to empty array if no photos

  // This will hold the number of spans for the bridge
  const spanCount = inventoryData?.no_of_span || 0;

  // Generate an array of span values based on `spanCount`
  const spanIndexes = Array.from(
    { length: spanCount },
    (_, index) => index + 1
  );

  // Handling the selection change
  const handleSpanSelect = (e) => {
    setSelectedSpan(e.target.value);
    setShowUploadOptions(true); // Show upload options when a span is selected
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const closeModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card p-2 rounded-lg text-black"
        style={{
          background: "#FFFFFF",
          border: "2px solid #60A5FA",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <div className="card-body pb-0">
          <h5 className="card-title text-lg font-semibold pb-2">
            Inventory Info
          </h5>
          <Form>
            <Row>
              {[
                { label: "Bridge ID", field: "uu_bms_id" },
                { label: "Bridge Name", field: "bridge_name" },
                { label: "Structure Type", field: "structure_type" },
                { label: "Construction Year", field: "construction_year" },
                { label: "District", field: "district" },
                { label: "Road Name", field: "road_name" },
                { label: "Road Name CWD", field: "road_name_cwd" },
                { label: "Construction Type", field: "construction_type" },
                { label: "Survey ID", field: "survey_id" },
                { label: "Surveyor Name", field: "surveyor_name" },
                { label: "Road Classification", field: "road_classification" },
                { label: "Carriageway Type", field: "carriageway_type" },
                { label: "Road Surface Type", field: "road_surface_type" },
                { label: "Visual Condition", field: "visual_condition" },
                { label: "Direction", field: "direction" },
                {
                  label: "Last Maintenance Date",
                  field: "last_maintenance_date",
                  type: "date",
                },
                { label: "Width Structure", field: "structure_width_m" },
                { label: "Span Length", field: "span_length_m" },
                { label: "No of Spans", field: "no_of_span" },
                { label: "Latitude", field: "y_centroid" },
                { label: "Longitude", field: "x_centroid" },
                { label: "Remarks", field: "remarks" },
              ].map(({ label, field }, index) => {
                let value = "";
                if (field.includes(",")) {
                  const fields = field.split(",");
                  value = fields
                    .map((f) => inventoryData[f.trim()] || "")
                    .join(", ");
                } else {
                  value = inventoryData ? inventoryData[field] || "" : "";
                }

                return (
                  <Col key={index} md={6}>
                    <Form.Group controlId={`form${field}`}>
                      <Form.Label>{label}</Form.Label>
                      <Form.Control type="text" value={value} readOnly />
                    </Form.Group>
                  </Col>
                );
              })}

              {/* Span Select Dropdown */}
              <div className="form-group">
                <label>Select Span</label>
                <select
                  className="form-control"
                  value={selectedSpan}
                  onChange={handleSpanSelect}
                >
                  <option value="">-- Select Span --</option>
                  {spanIndexes.map((span, index) => (
                    <option key={index} value={span}>
                      Span {span}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show photo upload options if a span is selected */}
              {showUploadOptions && selectedSpan && (
                <>
                  {/* Display selected span */}
                  <Col md={12}>
                    <Form.Label>Photos for Span {selectedSpan}</Form.Label>
                  </Col>

                  {/* Display Span Photos */}
                  <Col md={8}>
                    <Form.Group controlId="formSpanPhotos">
                      <div className="d-flex flex-wrap">
                        {/* Check if photos are available for the selected span */}
                        {spanphotos[selectedSpan] &&
                        spanphotos[selectedSpan].length > 0 ? (
                          // Display photos if available
                          spanphotos[selectedSpan].map((photo, index) => (
                            <div key={photo.fileName} className="m-2">
                              <img
                                src={`${photo.fileName}`} // Adjust the path if needed
                                alt={`Span Photo ${index + 1}`}
                                className="img-thumbnail"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handlePhotoClick(photo.fileName)} // Add any click functionality if needed
                              />
                            </div>
                          ))
                        ) : (
                          // Display message if no photos are available
                          <p>No photos available for this span.</p>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </>
              )}

              {/* Display Photos */}
              <Col md={12}>
                <Form.Group controlId="formPhotos">
                  <Form.Label>Photos</Form.Label>
                  <div className="d-flex flex-wrap">
                    {photos.length > 0 ? (
                      photos.map((photo, index) => (
                        <div key={index} className="m-2">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="img-thumbnail"
                            style={{
                              width: "100px",
                              height: "100px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSelectedPhoto(photo);
                              setShowPhotoModal(true);
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <span>No photos available</span>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
      </div>

      {/* Photo Modal */}
      <Modal
        show={showPhotoModal}
        onHide={closeModal}
        centered
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Selected Photo"
              className="img-fluid"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventoryInfo;
