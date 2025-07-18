import React, { useState, useEffect } from "react";
import { Row, Col, Form, Modal, Spinner, ProgressBar } from "react-bootstrap";
import "../index.css";

const InventoryInfoDashboard = ({ inventoryData }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
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
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };
  const closeModal = () => setShowPhotoModal(false);

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
  { label: "Date", field: "data_date_time", type: "date" }, // <- Add type
].map(({ label, field, type }, index) => {
  let value = inventoryData?.[field] || "";
  if (type === "date" && value) {
    const dateObj = new Date(value);
    value = isNaN(dateObj) ? value : dateObj.toLocaleString(); // Fallback to raw if invalid
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
                      onClick={() => handlePhotoClick(photo)}
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
                        onClick={() => handlePhotoClick(photo)}
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
                    onClick={() => handlePhotoClick(photo)}
                  />
                ))
              ) : (
                <span>No photos available</span>
              )}
            </div>
          </Form.Group>
        </Form>
      </div>

      <Modal show={showPhotoModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Photo Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedPhoto && (
            <img
              src={selectedPhoto}
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

export default InventoryInfoDashboard;