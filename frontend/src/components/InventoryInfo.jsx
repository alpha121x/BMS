import React, { useState } from "react";
import { Row, Col, Form, Modal, Button } from "react-bootstrap";

const InventoryInfo = ({ inventoryData }) => {
  console.log("Inventory Data: ", inventoryData);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Extract photos from inventoryData
  const photos = [
    inventoryData?.image_1,
    inventoryData?.image_2,
    inventoryData?.image_3,
    inventoryData?.image_4,
    inventoryData?.image_5,
  ].filter(Boolean); // Remove null or undefined values

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
                { label: "Structure Type", field: "structure_type" },
                { label: "Construction Year", field: "construction_year" },
                { label: "District", field: "district" },
                { label: "Road", field: "road_name" },
                { label: "Construction Type", field: "construction_type" },
                { label: "Survey ID", field: "survey_id" },
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
                { label: "Structure Width (m)", field: "structure_width_m" },
                { label: "Span Length (m)", field: "span_length_m" },
                { label: "Number of Spans", field: "no_of_span" },
                { label: "Latitude", field: "x_centroid" },
                { label: "Longitude", field: "y_centroid" },
              ].map(({ label, field }, index) => (
                <Col key={index} md={6}>
                  <Form.Group controlId={`form${field}`}>
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      type="text"
                      value={inventoryData ? inventoryData[field] || "" : ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              ))}

              <Col md={12}>
                <Form.Group controlId="formPhotos">
                  <Form.Label>Photos</Form.Label>
                  <div className="d-flex flex-wrap">
                    {photos.length > 0 ? (
                      photos.map((photo, index) => (
                        <div key={index} className="m-2">
                          <img
                            src={`/${photo}`}
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

      <Modal
        show={showPhotoModal}
        onHide={() => setShowPhotoModal(false)}
        centered
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedPhoto && (
            <img
              src={`/${selectedPhoto}`}
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
