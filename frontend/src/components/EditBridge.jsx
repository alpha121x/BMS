import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const EditBridge = () => {
  const [bridgeData, setBridgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the query parameter 'id' from the URL
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const bridgeId = queryParams.get("id");

  useEffect(() => {
    // Fetch the data for the specific bridge based on the ID
    fetch(`${BASE_URL}/api/checkings/${bridgeId}`)
      .then((response) => response.json())
      .then((data) => {
        setBridgeData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bridge data:", error);
        setLoading(false);
      });
  }, [bridgeId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit the edited data (you can send this data to the backend)
    console.log(bridgeData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bridgeData) {
    return <div>Bridge not found</div>;
  }

  return (
    <div className="container">
      <h2>Edit Bridge</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBridgeName">
          <Form.Label>Bridge Name</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.BridgeName}
            onChange={(e) =>
              setBridgeData({ ...bridgeData, BridgeName: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group controlId="formWorkKind">
          <Form.Label>Work Kind</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.WorkKindName}
            onChange={(e) =>
              setBridgeData({ ...bridgeData, WorkKindName: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group controlId="formMaterial">
          <Form.Label>Material</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.MaterialName}
            onChange={(e) =>
              setBridgeData({ ...bridgeData, MaterialName: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group controlId="formParts">
          <Form.Label>Parts</Form.Label>
          <Form.Control
            type="text"
            value={bridgeData.PartsName}
            onChange={(e) =>
              setBridgeData({ ...bridgeData, PartsName: e.target.value })
            }
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </Form>
    </div>
  );
};

export default EditBridge;
