import { useState } from "react";
import { Form, Button } from "react-bootstrap";

const InspectionCards = ({ groupedData }) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle function to expand/collapse a section
  const toggleSection = (spanIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [spanIndex]: !prev[spanIndex], // Toggle the section
    }));
  };

  return (
    <div className="inspection-cards-container">
      {Object.keys(groupedData).map((spanIndex) => (
        <div key={`span-${spanIndex}`} className="card mb-4">
          {/* Span Index Header with Toggle Button */}
          <div
            className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
            onClick={() => toggleSection(spanIndex)}
            style={{ cursor: "pointer" }}
          >
            <strong>Span No: {spanIndex}</strong>
            <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
          </div>

          {/* Work Kinds for Each Span - Toggle Visibility */}
          {expandedSections[spanIndex] && (
            <div className="card-body">
              {Object.keys(groupedData[spanIndex]).map((workKind) => (
                <div
                  key={`workKind-${spanIndex}-${workKind}`}
                  className="card mb-4 border shadow-sm"
                >
                  <div className="card-header bg-secondary text-white fw-bold">
                    {workKind}
                  </div>

                  {/* Mapping Inspections */}
                  <div className="card-body p-3">
                    {groupedData[spanIndex][workKind].map(
                      (inspection, index) => (
                        <div
                          key={`inspection-${inspection.id || index}`}
                          className="mb-4 p-4 border rounded shadow-sm"
                          style={{ backgroundColor: "#CFE2FF" }}
                        >
                          <div className="row">
                            {/* Left: Photos */}
                            <div className="col-md-3">
                              {inspection.PhotoPaths?.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                  {inspection.PhotoPaths.map((photo, i) => (
                                    <a
                                      key={`photo-${inspection.id}-${i}`}
                                      href={photo}
                                      data-fancybox="gallery"
                                      data-caption={`Photo ${i + 1}`}
                                    >
                                      <img
                                        src={photo}
                                        alt={`Photo ${i + 1}`}
                                        className="img-fluid rounded border"
                                        style={{
                                          width: "80px",
                                          height: "80px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right: Details */}
                            <div className="col-md-6">
                              <strong>Parts:</strong>{" "}
                              {inspection.PartsName || "N/A"} <br />
                              <strong>Material:</strong>{" "}
                              {inspection.MaterialName || "N/A"} <br />
                              <strong>Damage:</strong>{" "}
                              {inspection.DamageKindName || "N/A"} <br />
                              <strong>Level:</strong>{" "}
                              {inspection.DamageLevel || "N/A"} <br />
                              <strong>Situation Remarks:</strong>{" "}
                              {inspection.Remarks || "N/A"}
                            </div>

                            {/* Footer: Consultant Remarks, Approval & Save Button */}
                            <div className="col-md-3 d-flex flex-column justify-content-between">
                              <Form.Control
                                as="input"
                                type="text"
                                placeholder="Consultant Remarks"
                                value={inspection.consultant_remarks || ""}
                                onChange={(e) =>
                                  handleConsultantRemarksChange(
                                    inspection.inspection_id,
                                    e.target.value
                                  )
                                }
                                className="mb-2"
                              />

                              <Form.Select
                                value={inspection.approved_by_consultant || 0}
                                onChange={(e) =>
                                  handleApprovedFlagChange(
                                    inspection.inspection_id,
                                    parseInt(e.target.value)
                                  )
                                }
                                className="mb-2"
                              >
                                <option value={0}>Unapproved</option>
                                <option value={1}>Approved</option>
                              </Form.Select>

                              <Button
                                onClick={() => handleSaveChanges(inspection)}
                                className="bg-[#CFE2FF]"
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InspectionCards;
