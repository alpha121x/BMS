import React, { useState, useEffect } from "react";
import { Row, Col, Form, Modal, Button, Spinner, ProgressBar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "../index.css";

const InventoryInfoDashboard = ({ inventoryData }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedSpan, setSelectedSpan] = useState("");
  const [parsedSpanPhotos, setParsedSpanPhotos] = useState({});
  const [currentSpanPhotos, setCurrentSpanPhotos] = useState([]);
  const [overviewPhotos, setOverviewPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  const photos = inventoryData?.photos || [];

  useEffect(() => {
    if (inventoryData?.images_spans) {
      try {
        const parsed = JSON.parse(inventoryData.images_spans);
        setParsedSpanPhotos(parsed);

        // Extract Overview photos if available
        if (parsed["Overview"]) {
          const overviewPhotos = Object.values(parsed["Overview"]).flat();
          setTotalImages(overviewPhotos.length);
          setLoadedImages(0);
          setLoadingPhotos(true);

          // Preload overview images
          const loadImages = async () => {
            const imagePromises = overviewPhotos.map((photo) => {
              return new Promise((resolve) => {
                const img = new Image();
                img.src = photo;
                img.onload = () => {
                  setLoadedImages((prev) => prev + 1);
                  resolve();
                };
                img.onerror = () => {
                  setLoadedImages((prev) => prev + 1);
                  resolve();
                };
              });
            });

            await Promise.all(imagePromises);
            setOverviewPhotos(overviewPhotos);
            setLoadingPhotos(false);
          };

          loadImages();
        } else {
          setOverviewPhotos([]);
          setLoadingPhotos(false);
        }
      } catch (error) {
        console.error("Error parsing span photos:", error);
        setOverviewPhotos([]);
        setLoadingPhotos(false);
      }
    }
  }, [inventoryData]);

  useEffect(() => {
    if (selectedSpan && parsedSpanPhotos) {
      const spanKey = `Span_${selectedSpan}`;
      const spanData = parsedSpanPhotos[spanKey];

      if (spanData) {
        // Convert the object of photo arrays to a flat array
        const photos = Object.values(spanData).flat();
        setTotalImages(photos.length);
        setLoadedImages(0);
        setLoadingPhotos(true);

        // Preload span images
        const loadImages = async () => {
          const imagePromises = photos.map((photo) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = photo;
              img.onload = () => {
                setLoadedImages((prev) => prev + 1);
                resolve();
              };
              img.onerror = () => {
                setLoadedImages((prev) => prev + 1);
                resolve();
              };
            });
          });

          await Promise.all(imagePromises);
          setCurrentSpanPhotos(photos);
          setLoadingPhotos(false);
        };

        loadImages();
      } else {
        setCurrentSpanPhotos([]);
        setLoadingPhotos(false);
      }
    } else {
      setCurrentSpanPhotos([]);
      setLoadingPhotos(false);
    }
  }, [selectedSpan, parsedSpanPhotos]);

  const spanIndexes = Array.from(
    { length: inventoryData?.no_of_span || 0 },
    (_, i) => i + 1
  );

  const handleSpanSelect = (e) => setSelectedSpan(e.target.value);

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

  return (
    <div className="container">
      <div
        className="card p-2 border-0"
        style={
          {
            // background: "#fff",
            // border: "1px solid #60A5FA",
            // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            // position: "relative",
            // borderRadius:"3px"
          }
        }
      >
        <h5 className="card-title font-semibold pb-2 bg-[#3B9996] text-white p-2 rounded-1">
          Inventory Info
        </h5>
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
            <Form.Label className="custom-label bg-[#3B9996] text-white p-1 rounded-1 w-full">
              Overview Photos
            </Form.Label>
            {loadingPhotos && overviewPhotos.length > 0 ? (
              <div className="text-center py-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <div className="mt-2">
                  Loading images... ({loadedImages}/{totalImages})
                </div>
                <ProgressBar
                  now={(loadedImages / totalImages) * 100}
                  label={`${Math.round((loadedImages / totalImages) * 100)}%`}
                  className="mt-2"
                />
              </div>
            ) : (
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
            )}
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
              {loadingPhotos ? (
                <div className="text-center py-3">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <div className="mt-2">
                    Loading images... ({loadedImages}/{totalImages})
                  </div>
                  <ProgressBar
                    now={(loadedImages / totalImages) * 100}
                    label={`${Math.round((loadedImages / totalImages) * 100)}%`}
                    className="mt-2"
                  />
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
            <Form.Label className="custom-label bg-[#3B9996] text-white p-1 rounded-1 w-full">
              Initial Photos
            </Form.Label>
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

export default InventoryInfoDashboard;