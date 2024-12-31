import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const EditForm = () => {
  const [bridgeData, setBridgeData] = useState(null);

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

        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default EditForm;
