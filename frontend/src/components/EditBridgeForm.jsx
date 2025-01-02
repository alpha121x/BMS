import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const EditBridgeForm = () => {
  const [bridgeData, setBridgeData] = useState(null);
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

  // Get the query parameter 'data' from the URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const serializedData = queryParams.get("data");

  useEffect(() => {
    if (serializedData) {
      // Decode and parse the serialized data
      const parsedData = JSON.parse(decodeURIComponent(serializedData));
      // console.log("Parsed Data:", parsedData);
      setBridgeData({ ...parsedData, photos: dummyPhotos }); // Add dummy photos for testing
    }
  }, [serializedData]);

  const handleInputChange = (field, value) => {
    setBridgeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleNewPhotoAdd = (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    // Replace with your API call
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setBridgeData((prevData) => ({
          ...prevData,
          photos: [...(prevData.photos || []), data.filePath],
        }));
        console.log("Photo uploaded successfully:", data);
      })
      .catch((error) => {
        console.error("Error uploading photo:", error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Bridge Data:", bridgeData);
    alert("Changes saved!");
    window.location.href = "/Evaluation";
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handlePhotoRemove = (photoToRemove) => {
    setBridgeData((prevData) => ({
      ...prevData,
      photos: (prevData.photos || []).filter(
        (photo) => photo !== photoToRemove
      ),
    }));
  };

  if (!bridgeData) {
    return (
      <div
        className="loader"
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
          zIndex: "999",
        }}
      />
    );
  }

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
          <h6 className="card-title text-lg font-semibold pb-2">Edit Bridge Info</h6>
          <Form onSubmit={handleSubmit}>
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
                { label: "Longitude", field: "Longitude" }]
                .map(({ label, field }, index) => (
                  <Col key={index} md={6}>
                    <Form.Group controlId={`form${field}`}>
                      <Form.Label>{label}</Form.Label>
                      <Form.Control
                        type="text"
                        value={bridgeData[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                ))}

              <Col md={12}>
                <Form.Group controlId="formNewPhoto">
                  <Form.Label>Add New Photo</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => handleNewPhotoAdd(e.target.files[0])}
                  />
                </Form.Group>
              </Col>

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
                          onClick={() => handlePhotoClick(photo)}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="mt-1 w-100"
                          onClick={() => handlePhotoRemove(photo)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Save Button */}
            <div className="d-flex justify-content-center mt-4">
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
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

export default EditBridgeForm;
