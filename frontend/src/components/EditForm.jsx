import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const EditForm = () => {
  const [bridgeData, setBridgeData] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Get the query parameter 'data' from the URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const serializedData = queryParams.get("data");

  React.useEffect(() => {
    if (serializedData) {
      // Decode and parse the serialized data
      const parsedData = JSON.parse(decodeURIComponent(serializedData));
      setBridgeData(parsedData);
    }
  }, [serializedData]);

  const handleInputChange = (field, value) => {
    setBridgeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Bridge Data:", bridgeData);
    alert("Changes saved!");
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handlePhotoRemove = (photo) => {
    setBridgeData((prevData) => ({
      ...prevData,
      photos: prevData.photos.filter((p) => p !== photo),
    }));
  };

  if (!bridgeData) {
    return (
      <div className="container my-5">
        <p>Loading bridge data...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Edit Bridge</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBridgeName">
          <Form.Label>Bridge Name</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.BridgeName || ""}
            onChange={(e) => handleInputChange("BridgeName", e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formWorkKind">
          <Form.Label>Work Kind</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.WorkKindName || ""}
            onChange={(e) => handleInputChange("WorkKindName", e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formMaterial">
          <Form.Label>Material</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.MaterialName || ""}
            onChange={(e) => handleInputChange("MaterialName", e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formParts">
          <Form.Label>Parts</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.PartsName || ""}
            onChange={(e) => handleInputChange("PartsName", e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formPhotos">
          <Form.Label>Photos</Form.Label>
          <div className="d-flex flex-wrap">
            {bridgeData.photos?.map((photo, index) => (
              <div key={index} className="m-2">
                <img
                  src={`/${photo}`}
                  alt={`Photo ${index + 1}`}
                  className="img-thumbnail"
                  style={{ width: "100px", height: "100px", cursor: "pointer" }}
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

        <Button type="submit" variant="primary" className="mt-3">
          Save Changes
        </Button>
      </Form>

      {/* Photo Modal */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedPhoto && (
            <img
              src={`/${selectedPhoto}`}
              alt="Selected Photo"
              className="img-fluid"
              style={{ maxHeight: "400px" }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EditForm;
