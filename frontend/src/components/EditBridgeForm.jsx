import React, { useState, useEffect } from "react";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "./config";

const EditBridgeForm = () => {
  const [bridgeData, setBridgeData] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedSpan, setSelectedSpan] = useState("");
  const [spanPhotos, setSpanPhotos] = useState({}); // Store photos for each span
  const [showUploadOptions, setShowUploadOptions] = useState(false); // Show upload options

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

  // This will hold the number of spans for the bridge
  const spanCount = bridgeData?.no_of_span || 0;

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

  const handleSpanPhotoRemove = (span, photoToRemove, photoIndex) => {
    // Create a copy of the current spanPhotos state
    setSpanPhotos((prevData) => {
      // Copy the existing spanPhotos
      const newSpanPhotos = { ...prevData };

      // Check if there are photos for this span
      if (newSpanPhotos[span]) {
        // Filter out the photo to remove based on the `fileName` property
        newSpanPhotos[span] = newSpanPhotos[span].filter(
          (photo) => photo.fileName !== photoToRemove
        );
      }

      // Return the updated state
      return newSpanPhotos;
    });

    // Reset the corresponding file input field if needed
    const inputElement = document.getElementById(
      `photoInput-${span}-${photoIndex}`
    );
    if (inputElement) {
      inputElement.value = ""; // Reset the file input
    }
  };

  // Function to handle the removal of a photo
  const handlePhotoRemove = (photoToRemove) => {
    setBridgeData((prevData) => ({
      ...prevData,
      photos: prevData.photos.filter((photo) => photo !== photoToRemove),
    }));
  };

  // Function to handle the addition of a new photo
  const handleNewPhotoAdd = (file) => {
    // Get the existing photos array from bridgeData or initialize it as an empty array
    const existingPhotos = bridgeData.photos || [];

    // Initialize the directory path to be used for the new photo
    let directoryPath = "";

    // If there are existing photos, extract the directory path from the first one
    if (existingPhotos.length > 0) {
      const existingImageUrl = existingPhotos[0];
      // Extract the directory path up to the last '/' or '\' (to handle both slashes)
      const lastSlashIndex = Math.max(
        existingImageUrl.lastIndexOf("/"),
        existingImageUrl.lastIndexOf("\\")
      );
      directoryPath = existingImageUrl.substring(0, lastSlashIndex + 1);
    } else {
      // If no existing photos, set a default directory path
      directoryPath = "/uploads/";
    }

    // Now, upload the file
    const uploadUrl = `${BASE_URL}/api/upload`; // Use the backend upload URL
    const formData = new FormData();

    // Append the file and directory path to the form data
    formData.append("file", file);
    formData.append("directoryPath", directoryPath); // Send the directory path to the backend

    fetch(uploadUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to upload the photo");
        }
        return response.json();
      })
      .then((data) => {
        // Get the file name from the API response (assumed 'filename' is returned from the backend)
        const newImageName = data.filename;

        // Construct the full URL for the new photo by appending the file name to the directory path
        const photoUrl = `${directoryPath}${newImageName}`;

        // Update the bridgeData with the new photo URL
        setBridgeData((prevData) => ({
          ...prevData,
          photos: [...(prevData.photos || []), photoUrl], // Add the new photo URL to the array
        }));
      })
      .catch((error) => {
        console.error("Error uploading photo:", error);
        alert(`Error uploading photo: ${error.message}`); // Show an alert with the error message
      });
  };

  // Handle the photo upload for the selected span
  const handleSpanPhotoAdd = (e, span) => {
    const newSpanPhotos = { ...spanPhotos };

    // If no photos exist for this span, initialize it
    if (!newSpanPhotos[span]) newSpanPhotos[span] = [];

    // Get the files selected by the user
    const selectedFiles = Array.from(e.target.files);

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
                        accept="image/*"
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
                    accept="image/*"
                    onChange={(e) => handleNewPhotoAdd(e.target.files[0])}
                  />
                </Form.Group>
              </Col>

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
