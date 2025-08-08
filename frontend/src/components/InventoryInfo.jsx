import { useState, useEffect } from "react";
import { Row, Col, Form, Modal, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "../index.css";
import { BASE_URL } from "./config";

const InventoryInfo = ({ inventoryData }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedSpan, setSelectedSpan] = useState("");
  const [parsedSpanPhotos, setParsedSpanPhotos] = useState({});
  const [currentSpanPhotos, setCurrentSpanPhotos] = useState([]);
  const [overviewPhotos, setOverviewPhotos] = useState([]);
  const [loadingSpanPhotos, setLoadingSpanPhotos] = useState(false);
  const [overallCondition, setOverallCondition] = useState("");
  const [visualConditions, setVisualConditions] = useState([]);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  const photos = inventoryData?.photos || [];

  // Fetch Visual Conditions from API
  useEffect(() => {
    const fetchVisualConditions = async () => {
      setLoadingConditions(true);
      try {
        const response = await fetch(`${BASE_URL}/api/visual-conditions`);
        if (!response.ok) {
          throw new Error("Failed to fetch visual conditions");
        }
        const data = await response.json();
        setVisualConditions(data);
      } catch (error) {
        console.error("Error fetching visual conditions:", error);
        setVisualConditions([
          { id: 1, visual_condition: "FAIR" },
          { id: 2, visual_condition: "GOOD" },
          { id: 3, visual_condition: "POOR" },
          { id: 4, visual_condition: "UNDER CONSTRUCTION" },
        ]);
      } finally {
        setLoadingConditions(false);
      }
    };

    fetchVisualConditions();
  }, []);

  // Set initial overall condition from inventoryData
  useEffect(() => {
    if (inventoryData?.overall_bridge_condition) {
      setOverallCondition(inventoryData.overall_bridge_condition);
    }
  }, [inventoryData]);

  useEffect(() => {
    if (inventoryData?.images_spans) {
      try {
        const parsed = JSON.parse(inventoryData.images_spans);
        setParsedSpanPhotos(parsed);

        if (parsed["Overview"]) {
          const overviewPhotos = Object.values(parsed["Overview"]).flat();
          setOverviewPhotos(overviewPhotos);
        } else {
          setOverviewPhotos([]);
        }
      } catch (error) {
        console.error("Error parsing span photos:", error);
      }
    }
  }, [inventoryData]);

  useEffect(() => {
    if (selectedSpan && parsedSpanPhotos) {
      const spanKey = `Span_${selectedSpan}`;
      const spanData = parsedSpanPhotos[spanKey];

      if (spanData) {
        setLoadingSpanPhotos(true);
        const photos = Object.values(spanData).flat();

        const loadImages = async () => {
          const imagePromises = photos.map((photo) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = photo;
              img.onload = resolve;
              img.onerror = resolve;
            });
          });

          await Promise.all(imagePromises);
          setCurrentSpanPhotos(photos);
          setLoadingSpanPhotos(false);
        };

        loadImages();
      } else {
        setCurrentSpanPhotos([]);
        setLoadingSpanPhotos(false);
      }
    } else {
      setCurrentSpanPhotos([]);
      setLoadingSpanPhotos(false);
    }
  }, [selectedSpan, parsedSpanPhotos]);

  const spanIndexes = Array.from(
    { length: inventoryData?.no_of_span || 0 },
    (_, i) => i + 1
  );

  const handleSpanSelect = (e) => {
    setSelectedSpan(e.target.value);
  };

  const handlePhotoClick = (photosArray, clickedIndex) => {
    if (Array.isArray(photosArray) && photosArray.length > 0) {
      setSelectedPhotos(photosArray);
      setCurrentPhotoIndex(clickedIndex);
      setShowPhotoModal(true);
    }
  };

  const handlePreviousPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? selectedPhotos.length - 1 : prevIndex - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === selectedPhotos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotos([]);
    setCurrentPhotoIndex(0);
  };

  const handleConditionSelect = async (e) => {
    const selectedCondition = e.target.value;
    setOverallCondition(selectedCondition);

    if (selectedCondition) {
      try {
        const requestData = {
          overall_bridge_condition: selectedCondition,
        };

        const response = await fetch(
          `${BASE_URL}/api/update-overall-condition/${inventoryData.uu_bms_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update overall bridge condition");
        }

        const result = await response.json();
        setUpdateSuccess(result.message);
        setUpdateError(null);
      } catch (error) {
        console.error("Error updating overall bridge condition:", error);
        setUpdateError("Failed to update overall bridge condition");
        setUpdateSuccess(null);
      }
    }
  };

  // Map visual conditions to colors
  const getConditionStyle = (condition) => {
    switch (condition.toLowerCase()) {
      case "good":
        return {
          backgroundColor: "#9FD585",
          color: "black",
          fontWeight: "bold",
        };
      case "fair":
        return {
          backgroundColor: "#FFD685",
          color: "black",
          fontWeight: "bold",
        };
      case "poor":
        return {
          backgroundColor: "#FF8585",
          color: "black",
          fontWeight: "bold",
        };
      case "under construction":
        return {
          backgroundColor: "#DBDBDB",
          color: "black",
          fontWeight: "bold",
        };
      default:
        return {};
    }
  };

  return (
    <div className="container">
      <div
        className="card p-3"
        style={{
          background: "#FFFFFF",
          border: "2px solid #60A5FA",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <h5 className="card-title font-semibold pb-2">Inventory Info</h5>
        <Form>
          <Row>
            {[
              { label: "Bridge ID", field: "uu_bms_id" },
              { label: "Bridge Name", field: "bridge_name" },
              { label: "Structure Type", field: "structure_type" },
              { label: "Construction Year", field: "construction_year" },
              { label: "District", field: "district" },
              { label: "Road Name", field: "road_name" },
              { label: "Road Name CWD", field: "road_name_cwd" },
              { label: "Construction Type", field: "construction_type" },
              { label: "Survey ID", field: "survey_id" },
              { label: "Surveyor Name", field: "surveyor_name" },
              { label: "Road Classification", field: "road_classification" },
              { label: "Carriageway Type", field: "carriageway_type" },
              { label: "Road Surface Type", field: "road_surface_type" },
              { label: "Visual Condition", field: "visual_condition" },
              { label: "Direction", field: "direction" },
              {
                label: "Last Maintenance Date",
                field: "last_maintenance_date",
                type: "date",
              },
              { label: "Width Structure", field: "structure_width_m" },
              { label: "Span Length", field: "span_length_m" },
              { label: "No of Spans", field: "no_of_span" },
              { label: "Latitude", field: "y_centroid" },
              { label: "Longitude", field: "x_centroid" },
              { label: "Remarks", field: "remarks" },
              { label: "Data Source", field: "data_source" },
              { label: "Date", field: "data_date_time", type: "date" },
            ].map(({ label, field, type }, index) => {
              let value = inventoryData?.[field] || "";
              if (type === "date" && value) {
                const dateObj = new Date(value);
                value = isNaN(dateObj) ? value : dateObj.toLocaleString();
              }

              return (
                <Col key={index} md={3}>
                  <Form.Group>
                    <Form.Label className="custom-label">{label}</Form.Label>
                    <Form.Control
                      type="text"
                      value={value}
                      readOnly
                      style={{ padding: "8px", fontSize: "14px" }}
                    />
                  </Form.Group>
                </Col>
              );
            })}
          </Row>

          <Form.Group>
            <Form.Label className="custom-label">Overview Photos</Form.Label>
            <div className="d-flex flex-wrap">
              {overviewPhotos.length > 0 ? (
                overviewPhotos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Overview Photo ${index + 1}`}
                    className="img-thumbnail m-1"
                    style={{ width: "80px", height: "80px", cursor: "pointer" }}
                    onClick={() => handlePhotoClick(overviewPhotos, index)}
                  />
                ))
              ) : (
                <span>No overview photos available</span>
              )}
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label className="custom-label">Select Span</Form.Label>
            <Form.Select
              value={selectedSpan}
              onChange={handleSpanSelect}
              style={{ padding: "8px", fontSize: "14px" }}
            >
              <option value="">-- Select Span --</option>
              {spanIndexes.map((span, index) => (
                <option key={index} value={span}>
                  Span {span}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedSpan && (
            <Form.Group>
              <Form.Label className="custom-label">
                Photos for Span {selectedSpan}
              </Form.Label>
              {loadingSpanPhotos ? (
                <div className="text-center py-3">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <div className="d-flex flex-wrap">
                  {currentSpanPhotos.length > 0 ? (
                    currentSpanPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1} for Span ${selectedSpan}`}
                        className="img-thumbnail m-1"
                        style={{
                          width: "80px",
                          height: "80px",
                          cursor: "pointer",
                        }}
                        onClick={() => handlePhotoClick(currentSpanPhotos, index)}
                      />
                    ))
                  ) : (
                    <p>No photos available for this span.</p>
                  )}
                </div>
              )}
            </Form.Group>
          )}

          <Form.Group>
            <Form.Label className="custom-label">Initial Photos</Form.Label>
            <div className="d-flex flex-wrap">
              {photos.length > 0 ? (
                photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="img-thumbnail m-1"
                    style={{ width: "80px", height: "80px", cursor: "pointer" }}
                    onClick={() => handlePhotoClick(photos, index)}
                  />
                ))
              ) : (
                <span>No photos available</span>
              )}
            </div>
          </Form.Group>

          {/* <Col md={6}>
            <div
              className="card p-3 mt-3"
              style={{
                background: "#CFE2FF",
                border: "2px solid #60A5FA",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Form.Group>
                <Form.Label
                  className="custom-label"
                  style={{ fontWeight: "bold", color: "#1E3A8A" }}
                >
                  Overall Bridge Condition
                </Form.Label>
                {loadingConditions ? (
                  <div className="text-center py-2">
                    <Spinner animation="border" size="sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <Form.Select
                    value={overallCondition}
                    onChange={handleConditionSelect}
                    style={{
                      padding: "8px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    <option value="">-- Select Condition --</option>
                    {visualConditions.map((condition) => (
                      <option
                        key={condition.id}
                        value={condition.visual_condition}
                        style={getConditionStyle(condition.visual_condition)}
                      >
                        {condition.visual_condition}
                      </option>
                    ))}
                  </Form.Select>
                )}
                {updateSuccess && (
                  <div className="text-success mt-2">{updateSuccess}</div>
                )}
                {updateError && (
                  <div className="text-danger mt-2">{updateError}</div>
                )}
              </Form.Group>
            </div>
          </Col> */}
        </Form>
      </div>

      <Modal
        show={showPhotoModal}
        onHide={handleClosePhotoModal}
        centered
        size="lg"
        className="custom-modal"
      >
        <style>
          {`
            .custom-modal .modal-dialog {
              max-width: 90vw;
              width: 100%;
            }
            .custom-modal .modal-content {
              max-height: 90vh;
              overflow: hidden;
            }
            .custom-modal .modal-body {
              max-height: 70vh;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 15px;
            }
            .custom-modal .image-container {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              max-height: 60vh;
            }
            .custom-modal .modal-image {
              max-width: 100%;
              max-height: 60vh;
              object-fit: contain;
              border-radius: 4px;
              border: 1px solid #dee2e6;
            }
            .custom-modal .nav-button {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              z-index: 10;
              padding: 8px 12px;
              font-size: 1.2rem;
            }
            .custom-modal .prev-button {
              left: 10px;
            }
            .custom-modal .next-button {
              right: 10px;
            }
          `}
        </style>
        <Modal.Header closeButton>
          <Modal.Title>
            Photo {currentPhotoIndex + 1} of {selectedPhotos.length}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPhotos.length > 0 && (
            <div className="image-container">
              <Button
                variant="outline-secondary"
                onClick={handlePreviousPhoto}
                disabled={selectedPhotos.length <= 1}
                className="nav-button prev-button"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
              <img
                src={selectedPhotos[currentPhotoIndex]}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className="modal-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-image.png";
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={handleNextPhoto}
                disabled={selectedPhotos.length <= 1}
                className="nav-button next-button"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </Button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePhotoModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InventoryInfo;