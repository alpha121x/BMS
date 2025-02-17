import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { BASE_URL } from "./config";

const BridgeInspectionsCard = () => {
  const [bridgeData, setBridgeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBridgeData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/inspections`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Convert data to array if it's not already
        const dataArray = Array.isArray(data) ? data : Object.values(data);

        console.log(dataArray);

        // Group inspections by bridge
        const groupedData = dataArray.reduce((acc, item) => {
          const bridgeName = item.bridge_name || "Unnamed Bridge";
          if (!acc[bridgeName]) {
            acc[bridgeName] = {
              bridgeName: bridgeName,
              inspections: []
            };
          }

          // Clean up inspection images if present
          const cleanedImages = item.inspection_images
            ? item.inspection_images
                .replace(/[\[\]"]/g, '')  // Remove unwanted characters
                .split(',')  // Split the string into an array
                .map(url => url.trim())  // Trim any extra spaces
            : [];

          acc[bridgeName].inspections.push({
            inspection_id: item.inspection_id,
            spanIndex: item.SpanIndex,
            workKind: item.WorkKindName,
            parts: item.PartsName,
            material: item.MaterialName,
            damage: item.DamageKindName,
            level: item.DamageLevel,
            remarks: item.Remarks,
            photos: cleanedImages,
          });

          return acc;
        }, {});

        setBridgeData(groupedData);
      } catch (err) {
        setError(err.message || "Failed to fetch bridge data");
      } finally {
        setLoading(false);
      }
    };

    fetchBridgeData();
  }, []);

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleViewClick = (inspection) => {
    // Implement view details functionality
    console.log("Viewing details for:", inspection);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        Error: {error}
      </Alert>
    );
  }

  if (!bridgeData || Object.keys(bridgeData).length === 0) {
    return (
      <Alert variant="warning" className="my-4">
        No inspection data available
      </Alert>
    );
  }

  return (
    <div>
      {Object.keys(bridgeData).map((bridgeName) => (
        <Card key={bridgeName} className="mb-3">
          <Card.Header 
            onClick={toggleExpand}
            style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{bridgeName}</strong>
              </div>
              <span>{expanded ? "▼" : "▶"}</span>
            </div>
          </Card.Header>

          {expanded && (
            <Card.Body>
              {bridgeData[bridgeName].inspections.map((inspection, index) => (
                <Card key={`inspection-${index}`} className="mb-3">
                  <Card.Header style={{ backgroundColor: "#f8f8f8" }}>
                    <strong>Inspection: {inspection.inspection_id}</strong>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-3">
                        {inspection.photos?.length > 0 && (
                          <div className="d-flex flex-wrap gap-2">
                            {inspection.photos.map((photo, i) => (
                              <img
                                key={`photo-${i}`}
                                src={photo}
                                alt={`Photo ${i + 1}`}
                                className="img-fluid rounded border"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <p><strong>Parts:</strong> {inspection.parts || "N/A"}</p>
                        <p><strong>Material:</strong> {inspection.material || "N/A"}</p>
                        <p><strong>Damage:</strong> {inspection.damage || "N/A"}</p>
                        <p><strong>Level:</strong> {inspection.level || "N/A"}</p>
                        <p><strong>Remarks:</strong> {inspection.remarks || "N/A"}</p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          )}
        </Card>
      ))}
    </div>
  );
};

export default BridgeInspectionsCard;
