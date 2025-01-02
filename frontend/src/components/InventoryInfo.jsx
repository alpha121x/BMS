import React, { useState } from "react";
import { Row, Col, Form, Modal, Button } from "react-bootstrap";

const InventoryInfo = ({ inventoryData }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Dummy photos for testing
  const dummyPhotos = [
    "uploads/bus_2024_01_14_12_39_49.jpg",
    "uploads/bus_2024_01_14_12_40_06.jpg",
    "uploads/bus_2024_01_14_12_40_38.jpg",
    "uploads/bus_2024_01_14_12_43_56.jpg",
    "uploads/bus_2024_01_14_12_45_26.jpg",
    "uploads/bus_2024_01_16_11_56_43.jpg",
  ];

  const handleEditClick = (row) => {
    // Serialize the row object into a URL-safe string
    const serializedRow = encodeURIComponent(JSON.stringify(row));

    // Construct the edit URL with serialized data
    const editUrl = `/EditBridge?data=${serializedRow}`;

    // Navigate to the edit URL in the same tab
    window.location.href = editUrl;
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
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title text-lg font-semibold pb-2">Inventory Info</h5>
            <Button
              variant="primary"
              onClick={() => handleEditClick(inventoryData)}
            >
              Edit Bridge
            </Button>
          </div>
          <Form>
            <Row>
              {[{ label: "Bridge ID", field: "ObjectID" },
                { label: "Bridge Name", field: "BridgeName" },
                { label: "Structure Type", field: "StructureType" },
                { label: "Construction Year", field: "ConstructionYear" },
                { label: "Zone", field: "Zone" },
                { label: "District", field: "District" },
                { label: "Road", field: "Road" },
                { label: "Construction Type", field: "ConstructionType" },
                { label: "Survey ID", field: "SurveyID" },
                { label: "Road Classification ID", field: "RoadClassificationID" },
                { label: "Carriageway Type", field: "CarriagewayType" },
                { label: "Road Surface Type", field: "RoadSurfaceType" },
                { label: "Road Classification", field: "RoadClassification" },
                { label: "Visual Condition", field: "VisualCondition" },
                { label: "Direction", field: "Direction" },
                { label: "Last Maintenance Date", field: "LastMaintenanceDate", type: "date" },
                { label: "Width Structure", field: "WidthStructure" },
                { label: "Span Length", field: "SpanLength" },
                { label: "Spans", field: "Spans" },
                { label: "Latitude", field: "Latitude" },
                { label: "Longitude", field: "Longitude" }].map(({ label, field }, index) => (
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
                    {/* Displaying dummy photos */}
                    {dummyPhotos.map((photo, index) => (
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
                    ))}
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
