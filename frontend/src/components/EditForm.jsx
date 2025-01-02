import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const EditForm = () => {
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
  const [newPhoto, setNewPhoto] = useState("");

  useEffect(() => {
    if (serializedData) {
      // Decode and parse the serialized data
      const parsedData = JSON.parse(decodeURIComponent(serializedData));
      setBridgeData(parsedData);
      console.log("Parsed Bridge Data:", parsedData);
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
      photos: prevData.photos.filter((photo) => photo !== photoToRemove),
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
          <h6 className="card-title text-lg font-semibold pb-2">Edit Bridge</h6>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBridgeId">
              <Form.Label>Bridge ID</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.ObjectID || ""}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId="formBridgeName">
              <Form.Label>Bridge Name</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.BridgeName || ""}
                onChange={(e) =>
                  handleInputChange("BridgeName", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group controlId="formWorkKind">
              <Form.Label>Work Kind</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.WorkKindName || ""}
                onChange={(e) =>
                  handleInputChange("WorkKindName", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group controlId="formDamageKind">
              <Form.Label>Damage Kind</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.DamageKindName || ""}
                onChange={(e) =>
                  handleInputChange("DamageKindName", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group controlId="formDamageLevel">
              <Form.Label>Damage Level</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.DamageLevel || ""}
                onChange={(e) =>
                  handleInputChange("DamageLevel", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group controlId="formSpanIndex">
              <Form.Label>Span Index</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.SpanIndex || ""}
                onChange={(e) => handleInputChange("SpanIndex", e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formMaterial">
              <Form.Label>Material</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.MaterialName || ""}
                onChange={(e) =>
                  handleInputChange("MaterialName", e.target.value)
                }
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

            <Form.Group controlId="formRemarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                type="text"
                value={bridgeData.Remarks || ""}
                onChange={(e) => handleInputChange("Remarks", e.target.value)}
              />
            </Form.Group>

            {/* Add New Photo */}
            <Form.Group controlId="formNewPhoto">
              <Form.Label>Add New Photo</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleNewPhotoAdd(e.target.files[0])}
              />
            </Form.Group>

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

export default EditForm;
