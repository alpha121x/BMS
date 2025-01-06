import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const EditBridgeForm = () => {
  const [bridgeData, setBridgeData] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedSpan, setSelectedSpan] = useState("");
  const [spanPhotos, setSpanPhotos] = useState({}); // Store photos for each span
  const [showUploadOptions, setShowUploadOptions] = useState(false); // Show upload options

  const photosToDisplay = bridgeData?.Photos || [];

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

  // This will hold the number of spans for the bridge
  const spanCount = bridgeData?.Spans || 0;

  // Generate an array of span values based on `spanCount`
  const spanIndexes = Array.from(
    { length: spanCount },
    (_, index) => index + 1
  );

  // Handling the selection change
  const handleSpanSelect = (e) => {
    setSelectedSpan(e.target.value);
    setShowUploadOptions(true); // Show upload options when a span is selected
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setBridgeData(updatedBridgeData); // Save updated data back to state
    console.log("Updated Bridge Data:", updatedBridgeData);
    alert("Changes saved!");
    // window.location.href = "/Evaluation";
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleSpanPhotoRemove = (span, fileName, index) => {
    // Update state to remove the photo based on fileName
    setSpanPhotos((prevData) => {
      const updatedSpanPhotos = { ...prevData };
  
      // Ensure the span exists and has photos
      if (updatedSpanPhotos[span]) {
        // Filter out the photo by its fileName
        const updatedPhotos = updatedSpanPhotos[span].filter(
          (photo) => photo.fileName !== fileName
        );
  
        // If the photos array is updated, return the new state object
        updatedSpanPhotos[span] = updatedPhotos;
      }
  
      return updatedSpanPhotos; // Return the updated state
    });
  };
  
  

  const handlePhotoRemove = (photoToRemove) => {
    setBridgeData((prevData) => ({
      ...prevData,
      Photos: prevData.Photos.filter((photo) => photo !== photoToRemove),
    }));
  };

  const handleNewPhotoAdd = (file) => {
    // Create a URL for the newly added photo (assuming the file is an image)
    const photoUrl = URL.createObjectURL(file);

    // Update the photos array to include the new photo
    setBridgeData((prevData) => ({
      ...prevData,
      Photos: [...(prevData.Photos || []), photoUrl],
    }));
  };

  // Handle the photo upload for the selected span
  const handleSpanPhotoAdd = (e, span) => {
    const newSpanPhotos = { ...spanPhotos };

    // If no photos exist for this span, initialize it
    if (!newSpanPhotos[span]) newSpanPhotos[span] = [];

    // Get the files selected by the user
    const selectedFiles = Array.from(e.target.files);

    // Ensure we don't exceed 5 photos per span
    if (newSpanPhotos[span].length + selectedFiles.length <= 5) {
      selectedFiles.forEach((file, index) => {
        // Generate a unique file name
        const timestamp = new Date().toISOString().replace(/[^\w]/g, "_");
        const newFileName = `Span${span}_photo_${
          newSpanPhotos[span].length + index + 1
        }_${timestamp}.jpg`;

        // Add file to the newSpanPhotos object
        newSpanPhotos[span].push({
          file: file,
          fileName: newFileName,
        });
      });

      // Update the state with the new photos
      setSpanPhotos(newSpanPhotos);
    } else {
      alert("You can only upload up to 5 photos per span.");
    }
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
              {[
                { label: "Bridge ID", field: "ObjectID" },
                { label: "Bridge Name", field: "BridgeName" },
                { label: "Structure Type", field: "StructureType" },
                { label: "Construction Year", field: "ConstructionYear" },
                { label: "Zone", field: "Zone" },
                { label: "District", field: "District" },
                { label: "Road", field: "Road" },
                { label: "Construction Type", field: "ConstructionType" },
                { label: "Survey ID", field: "SurveyID" },
                {
                  label: "Road Classification ID",
                  field: "RoadClassificationID",
                },
                { label: "Carriageway Type", field: "CarriagewayType" },
                { label: "Road Surface Type", field: "RoadSurfaceType" },
                { label: "Road Classification", field: "RoadClassification" },
                { label: "Visual Condition", field: "VisualCondition" },
                { label: "Direction", field: "Direction" },
                {
                  label: "Last Maintenance Date",
                  field: "LastMaintenanceDate",
                  type: "date",
                },
                { label: "Width Structure", field: "WidthStructure" },
                { label: "Span Length", field: "SpanLength" },
                { label: "Spans", field: "Spans" },
                { label: "Latitude", field: "Latitude" },
                { label: "Longitude", field: "Longitude" },
              ].map(({ label, field }, index) => (
                <Col key={index} md={6}>
                  <Form.Group controlId={`form${field}`}>
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      type="text"
                      value={bridgeData[field] || ""}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                    />
                  </Form.Group>
                </Col>
              ))}

              {/* Span Select Dropdown */}
              <div className="form-group">
                <label>Select Span</label>
                <select
                  className="form-control"
                  value={selectedSpan}
                  onChange={handleSpanSelect}
                >
                  <option value="">-- Select Span --</option>
                  {spanIndexes.map((span, index) => (
                    <option key={index} value={span}>
                      Span{span}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show photo upload options if a span is selected */}
              {showUploadOptions && selectedSpan && (
                <>
                  {/* Display selected span */}
                  <Col md={12}>
                    <Form.Label>
                      Upload Photos for Span {selectedSpan}
                    </Form.Label>
                  </Col>

                  {/* Single Photo Upload Input */}
                  <Col md={12}>
                    <Form.Group controlId="formPhotos">
                      <Form.Label>Upload Photos</Form.Label>
                      <Form.Control
                        type="file"
                        multiple // Allow multiple files
                        onChange={(e) => handleSpanPhotoAdd(e, selectedSpan)}
                      />
                    </Form.Group>
                  </Col>

                  {/* Display Uploaded Photos */}
                  <Col md={8}>
                    <Form.Group controlId="formPhotos">
                      <Form.Label>Span Photos</Form.Label>
                      <div className="d-flex flex-wrap">
                        {/* Display uploaded photos for the selected span */}
                        {spanPhotos[selectedSpan] &&
                          spanPhotos[selectedSpan].map((photo, index) => (
                            <div key={photo.fileName} className="m-2">
                              {" "}
                              {/* Use photo.fileName as key */}
                              <img
                                src={`/${photo.fileName}`} // Adjust the path if needed
                                alt={`Photo ${index + 1}`}
                                className="img-thumbnail"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handlePhotoClick(photo.fileName)} // Add any click functionality if needed
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="mt-1 w-100"
                                onClick={
                                  () =>
                                    handleSpanPhotoRemove(
                                      selectedSpan,
                                      photo.fileName,
                                      index
                                    ) // Use photo.fileName to remove photo
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                      </div>
                    </Form.Group>
                  </Col>
                </>
              )}

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
                    {photosToDisplay.map((photo, index) => (
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

export default EditBridgeForm;
