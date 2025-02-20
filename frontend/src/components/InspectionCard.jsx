const InspectionCard = ({ inspection }) => {
    return (
      <div className="mb-4 p-4 border rounded shadow-sm" style={{ backgroundColor: "#CFE2FF" }}>
        <div className="row">
          {/* Left: Photos */}
          <div className="col-md-3">
            {inspection.PhotoPaths?.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {inspection.PhotoPaths.map((photo, i) => (
                  <a key={`photo-${inspection.inspection_id}-${i}`} href={photo} data-fancybox="gallery" data-caption={`Photo ${i + 1}`}>
                    <img src={photo} alt={`Photo ${i + 1}`} className="img-fluid rounded border" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                  </a>
                ))}
              </div>
            )}
          </div>
  
          {/* Right: Details */}
          <div className="col-md-6">
            <strong>Parts:</strong> {inspection.PartsName || "N/A"} <br />
            <strong>Material:</strong> {inspection.MaterialName || "N/A"} <br />
            <strong>Damage:</strong> {inspection.DamageKindName || "N/A"} <br />
            <strong>Level:</strong> {inspection.DamageLevel || "N/A"} <br />
            <strong>Situation Remarks:</strong> {inspection.Remarks || "N/A"}
          </div>
  
          {/* Footer: Consultant Remarks, Approval & Save Button */}
          <div className="col-md-3 d-flex flex-column justify-content-between">
            <Form.Control
              as="input"
              type="text"
              placeholder="Consultant Remarks"
              value={inspection.qc_remarks_con || ""}
              onChange={(e) => handleConsultantRemarksChange(inspection.inspection_id, e.target.value)}
              className="mb-2"
            />
  
            <Form.Select
              value={inspection.qc_con}
              onChange={(e) => handleApprovedFlagChange(inspection.inspection_id, parseInt(e.target.value))}
              className="mb-2"
            >
              <option value={1}>Select Status</option>
              <option value={3}>Unapproved</option>
              <option value={2}>Approved</option>
            </Form.Select>
  
            <Button
              onClick={() => handleSaveChanges(inspection)}
              value={inspection.reviewed_by}
              className="bg-[#CFE2FF]"
              disabled={inspection.reviewed_by === 1}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  };
  