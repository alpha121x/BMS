import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "./config";

const EditInspectionForm = () => {
  const [bridgeData, setBridgeData] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({
    workKindOptions: [],
    partsOptions: [],
    materialOptions: [],
    damageLevelOptions: [],
    damageKindOptions: [],
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  // Retrieve user information from local storage
  const userToken = JSON.parse(localStorage.getItem("user")); // Adjust the key as per your implementation
  const userRole = userToken ? userToken.role : null; // Extract roleId

  // Ensure that 'bridgeData' contains a 'photos' field that holds an array of photo URLs
  const photos = bridgeData?.PhotoPaths || []; // Use 'photos' from the data or an empty array if not available

  // Get the query parameter 'data' from the URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const serializedData = queryParams.get("data");

  useEffect(() => {
    if (serializedData) {
      // Decode and parse the serialized data
      const parsedData = JSON.parse(decodeURIComponent(serializedData));
      setBridgeData(parsedData);
    }
  }, [serializedData]);

  // Fetch dropdown options from APIs using fetch
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const responseWorkKinds = await fetch(`${BASE_URL}/api/work-kinds`);
        const responseParts = await fetch(`${BASE_URL}/api/parts`);
        const responseMaterials = await fetch(`${BASE_URL}/api/materials`);
        const responseDamageLevels = await fetch(
          `${BASE_URL}/api/damage-levels`
        );
        const responseDamageKinds = await fetch(`${BASE_URL}/api/damage-kinds`);

        const [workKinds, parts, materials, damageLevels, damageKinds] =
          await Promise.all([
            responseWorkKinds.json(),
            responseParts.json(),
            responseMaterials.json(),
            responseDamageLevels.json(),
            responseDamageKinds.json(),
          ]);

        setDropdownOptions({
          workKindOptions: workKinds.map((item) => item.WorkKindName),
          partsOptions: parts.map((item) => item.PartsName),
          materialOptions: materials.map((item) => item.MaterialName),
          damageLevelOptions: damageLevels.map((item) => item.DamageLevel),
          damageKindOptions: damageKinds.map((item) => item.DamageKindName),
        });
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };

    fetchDropdownOptions();
  }, []);

  const renderDropdown = (field, optionsKey) => {
    const currentValue = bridgeData?.[field] || "";
    const options = [
      ...new Set(
        [...dropdownOptions[optionsKey], currentValue].filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));

    return (
      <Form.Control
        as="select"
        value={currentValue}
        onChange={(e) => handleInputChange(field, e.target.value)}
      >
        <option value="">Select {field.replace(/([A-Z])/g, " $1")}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Form.Control>
    );
  };

  const handleInputChange = (field, value) => {
    setBridgeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleNewPhotoAdd = (file) => {
    // Create a URL for the newly added photo (assuming the file is an image)
    const photoUrl = URL.createObjectURL(file);

    // Update the photos array to include the new photo
    setBridgeData((prevData) => ({
      ...prevData,
      PhotoPaths: [...(prevData.PhotoPaths || []), photoUrl],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Bridge Data:", bridgeData);
    alert("Changes saved!");
    // window.location.href = "/Evaluation";
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handlePhotoRemove = (photoToRemove) => {
    setBridgeData((prevData) => ({
      ...prevData,
      PhotoPaths: prevData.PhotoPaths.filter(
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
          <h6 className="card-title text-lg font-semibold pb-2">
            Edit Inspection {userRole}
          </h6>
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Individual Form Groups */}
              <Col md={6}>
                <Form.Group controlId="formObjectID">
                  <Form.Label>Bridge ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.ObjectID || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
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
              </Col>

              <Col md={6}>
                <Form.Group controlId="formSpanIndex">
                  <Form.Label>Span Index</Form.Label>
                  <Form.Control
                    type="text"
                    readOnly
                    value={bridgeData.SpanIndex || ""}
                    onChange={(e) =>
                      handleInputChange("SpanIndex", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              {/* Work Kind Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formWorkKind">
                  <Form.Label>Work Kind</Form.Label>
                  {renderDropdown("WorkKindName", "workKindOptions")}
                </Form.Group>
              </Col>

              {/* Damage Kind Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formDamageKind">
                  <Form.Label>Damage Kind</Form.Label>
                  {renderDropdown("DamageKindName", "damageKindOptions")}
                </Form.Group>
              </Col>

              {/* Damage Level Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formDamageLevel">
                  <Form.Label>Damage Level</Form.Label>
                  {renderDropdown("DamageLevel", "damageLevelOptions")}
                </Form.Group>
              </Col>

              {/* Material Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formMaterial">
                  <Form.Label>Material</Form.Label>
                  {renderDropdown("MaterialName", "materialOptions")}
                </Form.Group>
              </Col>

              {/* Parts Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formParts">
                  <Form.Label>Parts</Form.Label>
                  {renderDropdown("PartsName", "partsOptions")}
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="formRemarks">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={bridgeData.Remarks || ""}
                    onChange={(e) =>
                      handleInputChange("Remarks", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

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
                    {photos.map((photo, index) => (
                      <div key={index} className="m-2">
                        <img
                          src={`${photo}`}
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
              src={`${selectedPhoto}`}
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

export default EditInspectionForm;
