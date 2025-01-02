import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";

const InventoryInfo = ({ bridgeData, onClose }) => {
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
      <Card
        className="p-2 rounded-lg text-black"
        style={{
          background: "#FFFFFF",
          border: "2px solid #60A5FA",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <Card.Body>
          <Card.Title className="text-lg font-semibold pb-2">Bridge Inventory Info</Card.Title>
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
              { label: "Last Maintenance Date", field: "LastMaintenanceDate" },
              { label: "Width Structure", field: "WidthStructure" },
              { label: "Span Length", field: "SpanLength" },
              { label: "Spans", field: "Spans" },
              { label: "Latitude", field: "Latitude" },
              { label: "Longitude", field: "Longitude" }]
              .map(({ label, field }, index) => (
                <Col key={index} md={6} className="mb-3">
                  <strong>{label}: </strong> {bridgeData[field] || "N/A"}
                </Col>
              ))}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default InventoryInfo;
