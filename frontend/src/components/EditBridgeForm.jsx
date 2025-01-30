import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "./config";

const EditBridgeForm = () => {
  const [bridgeData, setBridgeData] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedSpan, setSelectedSpan] = useState("");
  const [spanPhotos, setSpanPhotos] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({
    districtOptions: [],
    structureTypeOptions: [],
    constructionTypeOptions: [],
    roadClassificationOptions: [],
    carriagewayTypeOptions: [],
    roadSurfaceTypeOptions: [],
    visualConditionOptions: [],
    directionOptions: [],
  });

  const photos = bridgeData?.photos || [];

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

  // console.log(bridgeData);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const responseDistrict = await fetch(`${BASE_URL}/api/districts`);
        const responseStructureType = await fetch(
          `${BASE_URL}/api/structure-types`
        );
        const responseConstructionType = await fetch(
          `${BASE_URL}/api/construction-types`
        );
        const responseRoadClassification = await fetch(
          `${BASE_URL}/api/road-classifications`
        );
        const responseCarriagewayType = await fetch(
          `${BASE_URL}/api/carriageway-types`
        );
        const responseRoadSurfaceType = await fetch(
          `${BASE_URL}/api/road-surface-types`
        );
        const responseVisualCondition = await fetch(
          `${BASE_URL}/api/visual-conditions`
        );
        const responseDirection = await fetch(`${BASE_URL}/api/directions`);

        const [
          districts,
          structureTypes,
          constructionTypes,
          roadClassifications,
          carriagewayTypes,
          roadSurfaceTypes,
          visualConditions,
          directions,
        ] = await Promise.all([
          responseDistrict.json(),
          responseStructureType.json(),
          responseConstructionType.json(),
          responseRoadClassification.json(),
          responseCarriagewayType.json(),
          responseRoadSurfaceType.json(),
          responseVisualCondition.json(),
          responseDirection.json(),
        ]);

        setDropdownOptions({
          districtOptions: districts.map((item) => item.district), // Adjust based on API response structure
          structureTypeOptions: structureTypes.map(
            (item) => item.structure_type
          ), // Adjust based on API response structure
          constructionTypeOptions: constructionTypes.map(
            (item) => item.construction_type
          ), // Adjust based on API response structure
          roadClassificationOptions: roadClassifications.map(
            (item) => item.road_classification
          ), // Adjust based on API response structure
          carriagewayTypeOptions: carriagewayTypes.map(
            (item) => item.carriageway_type
          ), // Adjust based on API response structure
          roadSurfaceTypeOptions: roadSurfaceTypes.map(
            (item) => item.road_surface_type
          ), // Adjust based on API response structure
          visualConditionOptions: visualConditions.map(
            (item) => item.visual_condition
          ), // Adjust based on API response structure
          directionOptions: directions.map((item) => item.direction), // Adjust based on API response structure
        });
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };

    fetchDropdownOptions();
  }, []);

  const spanphotos = bridgeData?.images_spans || [];
  const spanIndexes = Array.from(
    { length: bridgeData?.no_of_span || 0 },
    (_, i) => i + 1
  );

  const handleSpanSelect = (e) => setSelectedSpan(e.target.value);

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

  // Include spanPhotos for each span inside the bridgeData object
  const updatedBridgeData = {
    ...bridgeData,
    spanPhotos: spanPhotos, // Store the spanPhotos for each span here
  };

  // Handle form submit and upload all photos
  const handleSubmit = (e) => {
    e.preventDefault();

    // Wait for all photos to be uploaded
    Promise.all(uploadPromises)
      .then((uploadedPhotos) => {
        // Update bridgeData with the uploaded photo URLs
        const updatedBridgeData = {
          ...bridgeData,
          photos: uploadedPhotos, // Replace old photos with the new uploaded URLs
        };

        // Now submit the updated bridgeData
        const updateUrl = `${BASE_URL}/api/updateBridgeData`;

        return fetch(updateUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedBridgeData), // Send the updated data including photo URLs
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to submit the data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data submitted successfully:", data);
        alert("Changes saved successfully!");
      })
      .catch((error) => {
        console.error("Error submitting data:", error);
        alert(`Error submitting data: ${error.message}`);
      });
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
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
            Edit Bridge Info
          </h6>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formBridgeID">
                  <Form.Label>Bridge ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.uu_bms_id || ""}
                    onChange={(e) =>
                      handleInputChange("uu_bms_id", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formBridgeName">
                  <Form.Label>Bridge Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.bridge_name || ""}
                    onChange={(e) =>
                      handleInputChange("bridge_name", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formRoadName">
                  <Form.Label>Road Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.road_name || ""}
                    onChange={(e) =>
                      handleInputChange("road_name", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formRoadNameCWD">
                  <Form.Label>Road Name CWD</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.road_name_cwd || ""}
                    onChange={(e) =>
                      handleInputChange("road_name_cwd", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formConstructionYear">
                  <Form.Label>Construction Year</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.construction_year || ""}
                    onChange={(e) =>
                      handleInputChange("construction_year", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              {/* District Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formDistrict">
                  <Form.Label>District</Form.Label>
                  {renderDropdown("district", "districtOptions")}
                </Form.Group>
              </Col>

              {/* Structure Type Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formStructureType">
                  <Form.Label>Structure Type</Form.Label>
                  {renderDropdown("structure_type", "structureTypeOptions")}
                </Form.Group>
              </Col>

              {/* Construction Type Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formConstructionType">
                  <Form.Label>Construction Type</Form.Label>
                  {renderDropdown(
                    "construction_type",
                    "constructionTypeOptions"
                  )}
                </Form.Group>
              </Col>

              {/* Road Classification Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formRoadClassification">
                  <Form.Label>Road Classification</Form.Label>
                  {renderDropdown(
                    "road_classification",
                    "roadClassificationOptions"
                  )}
                </Form.Group>
              </Col>

              {/* Carriageway Type Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formCarriagewayType">
                  <Form.Label>Carriageway Type</Form.Label>
                  {renderDropdown("carriageway_type", "carriagewayTypeOptions")}
                </Form.Group>
              </Col>

              {/* Road Surface Type Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formRoadSurfaceType">
                  <Form.Label>Road Surface Type</Form.Label>
                  {renderDropdown(
                    "road_surface_type",
                    "roadSurfaceTypeOptions"
                  )}
                </Form.Group>
              </Col>

              {/* Visual Condition Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formVisualCondition">
                  <Form.Label>Visual Condition</Form.Label>
                  {renderDropdown("visual_condition", "visualConditionOptions")}
                </Form.Group>
              </Col>

              {/* Direction Dropdown */}
              <Col md={6}>
                <Form.Group controlId="formDirection">
                  <Form.Label>Direction</Form.Label>
                  {renderDropdown("direction", "directionOptions")}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="formSurveyID">
                  <Form.Label>Survey ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.survey_id || ""}
                    onChange={(e) =>
                      handleInputChange("survey_id", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formSurveyorName">
                  <Form.Label>Surveyor Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.surveyor_name || ""}
                    onChange={(e) =>
                      handleInputChange("surveyor_name", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLastMaintenanceDate">
                  <Form.Label>Last Maintenance Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={bridgeData.last_maintenance_date || ""}
                    onChange={(e) =>
                      handleInputChange("last_maintenance_date", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formWidthStructure">
                  <Form.Label>Width Structure</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.structure_width_m || ""}
                    onChange={(e) =>
                      handleInputChange("structure_width_m", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formSpanLength">
                  <Form.Label>Span Length</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.span_length_m || ""}
                    onChange={(e) =>
                      handleInputChange("span_length_m", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formNoOfSpans">
                  <Form.Label>No of Spans</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.no_of_span || ""}
                    onChange={(e) =>
                      handleInputChange("no_of_span", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLatitude">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.y_centroid || ""}
                    onChange={(e) =>
                      handleInputChange("y_centroid", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLongitude">
                  <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    type="text"
                    value={bridgeData.x_centroid || ""}
                    onChange={(e) =>
                      handleInputChange("x_centroid", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formRemarks">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={bridgeData.remarks || ""}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Form.Group>
                <Form.Label>Select Span</Form.Label>
                <Form.Select
                  value={selectedSpan}
                  onChange={handleSpanSelect}
                  style={{ padding: "8px", fontSize: "14px" }}
                >
                  <option value="">-- Select Span --</option>
                  {spanIndexes.map((span) => (
                    <option key={span} value={span}>
                      Span {span}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedSpan && (
                <Form.Group>
                  <Form.Label>Photos for Span {selectedSpan}</Form.Label>
                  <div className="d-flex flex-wrap">
                    {spanphotos[selectedSpan]?.length > 0 ? (
                      spanphotos[selectedSpan].map((photo, index) => (
                        <img
                          key={index}
                          src={photo.fileName}
                          alt={`Span Photo ${index + 1}`}
                          className="img-thumbnail m-1"
                          style={{
                            width: "80px",
                            height: "80px",
                            cursor: "pointer",
                          }}
                          onClick={() => handlePhotoClick(photo.fileName)}
                        />
                      ))
                    ) : (
                      <p>No photos available for this span.</p>
                    )}
                  </div>
                </Form.Group>
              )}

              <Col md={12}>
                <Form.Group controlId="formPhotos">
                  <Form.Label>Overview Photos</Form.Label>
                  <div className="d-flex flex-wrap">
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

export default EditBridgeForm;
