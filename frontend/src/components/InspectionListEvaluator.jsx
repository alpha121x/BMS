import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import ReportsSummary from "./ReportsSummary";

const InspectionListEvaluator = ({ bridgeId }) => {
  const [pendingData, setPendingData] = useState([]);
  const [summaryData, setsummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeDiv, setActiveDiv] = useState("pending"); // Default to Pending Reports
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [damageLevels, setDamageLevels] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [parts, setParts] = useState([]);
  const [damageKinds, setDamageKinds] = useState([]);
  
  // Fetch dropdown options from API
  useEffect(() => {
    fetch(`${BASE_URL}/api/damage-levels`)
      .then((res) => res.json())
      .then((data) => setDamageLevels(data))
      .catch((err) => console.error("Error fetching damage levels:", err));

    fetch(`${BASE_URL}/api/materials`)
      .then((res) => res.json())
      .then((data) => setMaterials(data))
      .catch((err) => console.error("Error fetching materials:", err));

    fetch(`${BASE_URL}/api/parts`)
      .then((res) => res.json())
      .then((data) => setParts(data))
      .catch((err) => console.error("Error fetching parts:", err));

    fetch(`${BASE_URL}/api/damage-kinds`)
      .then((res) => res.json())
      .then((data) => setDamageKinds(data))
      .catch((err) => console.error("Error fetching damage kinds:", err));
  }, []);


  const userToken = JSON.parse(localStorage.getItem("userEvaluation"));

  // Extract username safely
  const userId = userToken?.userId;

  useEffect(() => {
    if (bridgeId && userId) {
      fetchData();
      fetchsummaryData();
    }
  }, [bridgeId, userId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) throw new Error("bridgeId is required");
      if (!userId) throw new Error("userId is required");

      const response = await fetch(
        `${BASE_URL}/api/get-inspections-evaluator-new?bridgeId=${bridgeId}&userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (result.success) {
        // Generalized function for grouping
        const groupBySpanAndWorkKind = (data) => {
          return data.reduce((acc, item) => {
            const spanKey = item.SpanIndex || "N/A";
            const workKindKey = item.WorkKindName || "N/A";

            if (!acc[spanKey]) acc[spanKey] = {};
            if (!acc[spanKey][workKindKey]) acc[spanKey][workKindKey] = [];

            acc[spanKey][workKindKey].push(item);
            return acc;
          }, {});
        };

        // Grouping the data separately
        setPendingData(groupBySpanAndWorkKind(result.data.pending));
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [bridgeId, userId]);

  console.log(pendingData);

  const fetchsummaryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!bridgeId) throw new Error("bridgeId is required");

      const response = await fetch(
        `${BASE_URL}/api/get-summary-evaluator?bridgeId=${bridgeId}&userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      if (Array.isArray(result.data)) {
        setsummaryData(result.data);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [bridgeId]);

  const handleUpdateInspection = async (row) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0D6EFD",
        cancelButtonColor: "#6C757D",
        confirmButtonText: "Yes, save it!",
      });

      if (!isConfirmed) {
        console.log("Update cancelled by user.");
        return;
      }

      const evaluatorRemarks =
        row.qc_remarks_evaluator?.trim() === ""
          ? null
          : row.qc_remarks_evaluator;

          const updatedData = {
            inspection_id: row.inspection_id,
            district_id: row.district_id,
            inspection_images: row.PhotoPaths,
            qc_remarks_evaluator: evaluatorRemarks ? evaluatorRemarks : null,
            // extra details
            uu_bms_id: row.uu_bms_id,
            bridge_name: row.bridge_name,
            district_id: row.district_id,
            //Span Index
            SpanIndex: row.SpanIndex,
            // WorkKind
            WorkKindID: row.WorkKindID,
            WorkKindName: row.WorkKindName,
            // Parts (Element)
            PartsID: row.PartsID, 
            PartsName: row.PartsName,
            // Material
            MaterialID: row.MaterialID, 
            MaterialName: row.MaterialName,
            // Damage Kind
            DamageKindID: row.DamageKindID, 
            DamageKindName: row.DamageKindName,
            // Damage Level
            DamageLevelID: row.DamageLevelID, 
            DamageLevel: row.DamageLevel,
            // Damage Extent
            damage_extent: row.damage_extent,
            // situation remarks
            situation_remarks: row.Remarks ? row.Remarks : null,
            // 1st committe remarks
            qc_remarks_con: row.qc_remarks_con,
            qc_remarks_rams: row.qc_remarks_rams,
            evaluator_id: userId,
          };
          
          console.log(updatedData);
          
      // return;

      const response = await fetch(`${BASE_URL}/api/insert-inspection-evaluator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update inspection");

      fetchData();

      Swal.fire({
        title: "Updated!",
        text: "Inspection Updated Successfully.",
        icon: "success",
        confirmButtonColor: "#0D6EFD",
      });
    } catch (error) {
      setError(error.message);
      Swal.fire("Error!", error.message, "error");
    }
  };

  const handleEvalRemarksChange = (
    spanIndex,
    workKind,
    inspectionId,
    value
  ) => {
    setPendingData((prevData) => ({
      ...prevData,
      [spanIndex]: {
        ...prevData[spanIndex],
        [workKind]: prevData[spanIndex][workKind].map((item) =>
          item.inspection_id === inspectionId
            ? { ...item, qc_remarks_evaluator: value }
            : item
        ),
      },
    }));
  };

  const handleSaveChanges = (row) => {
    handleUpdateInspection(row);
  };


  const handleDownloadCSV = async (bridgeId) => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(
        `${BASE_URL}/api/inspections-export?bridgeId=${bridgeId}`
      );
      const data = await response.json();

      if (
        !data.success ||
        !Array.isArray(data.bridges) ||
        data.bridges.length === 0
      ) {
        Swal.fire("Error!", "No data available for export", "error");
        return;
      }

      const summaryData = data.bridges;
      const bridgeName = summaryData[0]?.bridge_name || "bridge_inspection";

      const headers = Object.keys(summaryData[0]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...summaryData.map((row) =>
            headers
              .map((key) =>
                String(row[key]).includes(",")
                  ? `"${row[key]}"`
                  : row[key] || "N/A"
              )
              .join(",")
          ),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${bridgeName.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      Swal.fire("Error!", "Failed to fetch or download CSV file", "error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDownloadExcel = async (bridgeId, setLoading) => {
    setLoading(true); // Start loader
    try {
      const response = await fetch(
        `${BASE_URL}/api/inspections-export-evaluator?bridgeId=${bridgeId}`
      );
      const data = await response.json();

      if (
        !data.success ||
        !Array.isArray(data.bridges) ||
        data.bridges.length === 0
      ) {
        console.error("No data to export");
        Swal.fire("Error!", "No data available for export", "error");
        return;
      }

      const summaryData = data.bridges;
      const bridgeName = summaryData[0]?.bridge_name || "bridge_inspection";

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Inspections");

      // Define all columns except images
      const columnKeys = Object.keys(summaryData[0]).filter(
        (key) => key !== "Overview Photos" && key !== "PhotoPaths"
      );

      const columns = columnKeys.map((key) => ({
        header: key.replace(/_/g, " "),
        key: key,
        width: 22,
      }));

      // Add image columns with increased spacing
      for (let i = 1; i <= 5; i++) {
        columns.push({
          header: `Overview Photo ${i}`,
          key: `photo${i}`,
          width: 22,
        });
      }
      for (let i = 1; i <= 5; i++) {
        columns.push({
          header: `Inspection Photo ${i}`,
          key: `inspection${i}`,
          width: 22,
        });
      }

      // Define worksheet columns
      worksheet.columns = columns;

      // Style the header row (first row)
      worksheet.getRow(1).font = { bold: true, size: 14 }; // Bold text and increased font size
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      }; // Center align text
      worksheet.getRow(1).height = 25; // Increase row height for better visibility

      // Add data rows without image URLs
      for (let i = 0; i < summaryData.length; i++) {
        const item = summaryData[i];

        // Extract & fix image URLs (replacing backslashes with forward slashes)
        const overviewPhotos = (item["Overview Photos"] || []).map((url) =>
          url.replace(/\\/g, "/")
        );
        const inspectionPhotos = (item["PhotoPaths"] || []).map((url) =>
          url.replace(/\\/g, "/")
        );

        // Add normal data (excluding image URLs)
        const rowData = {};
        columnKeys.forEach((key) => (rowData[key] = item[key] || ""));

        // Add a row for each entry
        const rowIndex = worksheet.addRow(rowData).number;

        // **Adjust row height for images to fit properly**
        worksheet.getRow(rowIndex).height = 90;

        // Function to insert images in the correct locations
        const insertImage = async (photoUrls, columnOffset, rowHeight) => {
          for (let j = 0; j < photoUrls.length && j < 5; j++) {
            try {
              // Fetch image data from the URL
              const imgResponse = await fetch(photoUrls[j]);
              const imgBlob = await imgResponse.blob();
              const arrayBuffer = await imgBlob.arrayBuffer();

              // Add image to the workbook
              const imageId = workbook.addImage({
                buffer: arrayBuffer,
                extension: "jpeg",
              });

              // **Insert image in the correct column**
              // - `tl.col`: Column position, starting from normal data columns + offset
              // - `tl.row`: Row position (adjusted for zero-based index)
              // - `ext.width`: Width of the inserted image (150px for better visibility)
              // - `ext.height`: Height of the inserted image (90px for consistency)
              worksheet.addImage(imageId, {
                tl: {
                  col: columnKeys.length + columnOffset + j,
                  row: rowIndex - 1,
                },
                ext: { width: 150, height: 90 },
              });
            } catch (error) {
              console.error("Failed to load image:", photoUrls[j], error);
            }
          }
        };

        // Insert Overview Photos (5 max)
        await insertImage(overviewPhotos, 0, 90);

        // Insert Inspection Photos (5 max)
        await insertImage(inspectionPhotos, 5, 90);
      }

      // Save File
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${bridgeName.replace(/\s+/g, "_")}.xlsx`);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      Swal.fire("Error!", "Failed to fetch or download Excel file", "error");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
  };

  const getDamageLevel = (data) => {
    const damageLevels = [...new Set(data.map((item) => item.DamageLevel))];
    return damageLevels.join(", ");
  };

  const getMaterials = (data) => {
    const materials = [...new Set(data.map((item) => item.MaterialName))];
    return materials.join(", ");
  };

  const getWorkKind = (data) => {
    const workKinds = [...new Set(data.map((item) => item.WorkKindName))];
    return workKinds.join(", ");
  };

  const getUniqueSpanIndices = (data) => {
    const spanIndices = data.map((item) => item.SpanIndex);
    const uniqueSpanIndices = [...new Set(spanIndices)];
    return uniqueSpanIndices.length;
  };

  const handleDivChange = (div) => {
    setActiveDiv(div);
  };

  const toggleSection = (spanIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [spanIndex]: !prev[spanIndex],
    }));
  };

  const handleFieldChange = (
    spanIndex,
    workKind,
    inspectionId,
    field,
    value
  ) => {
    setPendingData((prevData) => ({
      ...prevData,
      [spanIndex]: {
        ...prevData[spanIndex],
        [workKind]: prevData[spanIndex][workKind].map((item) =>
          item.inspection_id === inspectionId
            ? { ...item, [field]: value }
            : item
        ),
      },
    }));
  };

  return (
    <div
      className="card p-2 rounded-lg text-black"
      style={{
        background: "#FFFFFF",
        border: "2px solid #60A5FA",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        position: "relative",
      }}
    >
      <div className="card-body pb-0">
        <div className="d-flex mb-2 justify-content-between items-center p-3 bg-[#CFE2FF] rounded-lg shadow-md">
          <h6
            className="card-title text-lg font-semibold pb-2"
            style={{ fontSize: "1.25rem" }}
          >
            Condition Assessment Reports
          </h6>
          <div className="d-flex gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
              onClick={() => handleDownloadCSV(bridgeId)}
            >
              <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              CSV
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 flex items-center justify-center"
              onClick={() => handleDownloadExcel(bridgeId, setLoading)}
              disabled={loading}
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              )}
              {loading ? "Processing..." : "Excel"}
            </button>
          </div>
        </div>

        <ReportsSummary
          summaryData={summaryData}
          getUniqueSpanIndices={getUniqueSpanIndices}
          getDamageLevel={getDamageLevel}
          getMaterials={getMaterials}
          getWorkKind={getWorkKind}
        />

        {loading && (
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
        )}

        <div className="border rounded p-2 d-flex justify-content-start gap-2 align-items-center mt-2">
          <Button
            variant="warning"
            className="fw-bold text-grey"
            onClick={() => handleDivChange("pending")}
          >
            View Pending Reports
          </Button>
        </div>
        <div className="border rounded p-3 shadow-lg mt-2">
          {/* Reports Section */}
          {activeDiv === "pending" && (
            <div className="mb-4">
              <h5>Pending Reports</h5>
              {pendingData && Object.keys(pendingData).length > 0 ? (
                Object.keys(pendingData).map((spanIndex) => (
                  <div key={`span-${spanIndex}`} className="mb-4">
                    <div
                      className="border rounded p-2 bg-primary text-white fw-bold d-flex justify-content-between align-items-center"
                      onClick={() => toggleSection(spanIndex)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong>Reports For Span: {spanIndex}</strong>
                      <span>{expandedSections[spanIndex] ? "▼" : "▶"}</span>
                    </div>
                    {expandedSections[spanIndex] && (
                      <div className="mt-2">
                        {Object.keys(pendingData[spanIndex]).length > 0 ? (
                          Object.keys(pendingData[spanIndex]).map(
                            (workKind) => (
                              <div
                                key={`workKind-${spanIndex}-${workKind}`}
                                className="mb-4"
                              >
                                <div className="border rounded p-2 bg-secondary text-white fw-bold">
                                  {workKind}
                                </div>
                                <div className="mt-2">
                                  {pendingData[spanIndex][workKind].map(
                                    (inspection) => (
                                      <div
                                        key={`inspection-${inspection.inspection_id}`}
                                        className="border rounded p-4 shadow-sm mb-3"
                                        style={{ backgroundColor: "#CFE2FF" }}
                                      >
                                        <div className="row">
                                          <div className="col-md-3">
                                            {inspection.PhotoPaths?.length >
                                              0 && (
                                              <div
                                                className="d-flex gap-2"
                                                style={{
                                                  overflowX: "auto",
                                                  whiteSpace: "nowrap",
                                                  display: "flex",
                                                  paddingBottom: "5px",
                                                }}
                                              >
                                                {inspection.PhotoPaths.map(
                                                  (photoUrl, index) => (
                                                    <img
                                                      key={`photo-${inspection.id}-${index}`}
                                                      src={photoUrl}
                                                      alt={`Photo ${index + 1}`}
                                                      className="img-fluid rounded border"
                                                      style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        cursor: "pointer",
                                                        flexShrink: 0,
                                                      }}
                                                      loading="lazy"
                                                      onClick={() =>
                                                        handlePhotoClick(
                                                          photoUrl
                                                        )
                                                      }
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                          "/placeholder-image.png";
                                                      }}
                                                    />
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="col-md-9">
                                            <input type="hidden" name="district_id" value={inspection.district_id} />
                                            <div className="row">
                                              <div className="col-md-6">
                                                <div className="mb-1">
                                                  <strong>Elements:</strong>
                                                  <Form.Select
                                                    value={
                                                      inspection.PartsID || ""
                                                    }
                                                    onChange={(e) => {
                                                      const selectedPart =
                                                        parts.find(
                                                          (part) =>
                                                            part.PartsID ==
                                                            e.target.value
                                                        );
                                                      if (selectedPart) {
                                                        handleFieldChange(
                                                          spanIndex,
                                                          workKind,
                                                          inspection.inspection_id,
                                                          "PartsID",
                                                          selectedPart.PartsID
                                                        );
                                                        handleFieldChange(
                                                          spanIndex,
                                                          workKind,
                                                          inspection.inspection_id,
                                                          "PartsName",
                                                          selectedPart.PartsName
                                                        );
                                                      }
                                                    }}
                                                    className="form-control-sm ms-1"
                                                  >
                                                    <option value="">
                                                      Select Element
                                                    </option>
                                                    {parts.map((part) => (
                                                      <option
                                                        key={part.PartsID}
                                                        value={part.PartsID}
                                                      >
                                                        {part.PartsName}
                                                      </option>
                                                    ))}
                                                  </Form.Select>
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                <div className="mb-1">
                                                  <strong>Material:</strong>
                                                  <Form.Select
                                                    value={
                                                      inspection.MaterialID ||
                                                      ""
                                                    }
                                                    onChange={(e) => {
                                                      const selectedMaterial =
                                                        materials.find(
                                                          (mat) =>
                                                            mat.MaterialID ==
                                                            e.target.value
                                                        );
                                                      if (selectedMaterial) {
                                                        handleFieldChange(
                                                          spanIndex,
                                                          workKind,
                                                          inspection.inspection_id,
                                                          "MaterialID",
                                                          selectedMaterial.MaterialID
                                                        );
                                                        handleFieldChange(
                                                          spanIndex,
                                                          workKind,
                                                          inspection.inspection_id,
                                                          "MaterialName",
                                                          selectedMaterial.MaterialName
                                                        );
                                                      }
                                                    }}
                                                    className="form-control-sm ms-1"
                                                  >
                                                    <option value="">
                                                      Select Material
                                                    </option>
                                                    {materials.map(
                                                      (material) => (
                                                        <option
                                                          key={
                                                            material.MaterialID
                                                          }
                                                          value={
                                                            material.MaterialID
                                                          }
                                                        >
                                                          {
                                                            material.MaterialName
                                                          }
                                                        </option>
                                                      )
                                                    )}
                                                  </Form.Select>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="row">
                                              <div className="col-md-6">
                                                {" "}
                                                {/* Damage Kind Dropdown */}
                                                <div className="mb-1">
                                                  <strong>Damage:</strong>
                                                  <Form.Select
                                                    value={
                                                      inspection.DamageKindID ||
                                                      ""
                                                    }
                                                    onChange={(e) => {
                                                      const selectedDamage =
                                                        damageKinds.find(
                                                          (dmg) =>
                                                            dmg.DamageKindID ==
                                                            e.target.value
                                                        );
                                                      handleFieldChange(
                                                        spanIndex,
                                                        workKind,
                                                        inspection.inspection_id,
                                                        "DamageKindID",
                                                        selectedDamage?.DamageKindID
                                                      );
                                                      handleFieldChange(
                                                        spanIndex,
                                                        workKind,
                                                        inspection.inspection_id,
                                                        "DamageKindName",
                                                        selectedDamage?.DamageKindName
                                                      );
                                                    }}
                                                    className="form-control-sm ms-1"
                                                  >
                                                    <option value="">
                                                      Select Damage
                                                    </option>
                                                    {damageKinds.map(
                                                      (damage) => (
                                                        <option
                                                          key={
                                                            damage.DamageKindID
                                                          }
                                                          value={
                                                            damage.DamageKindID
                                                          }
                                                        >
                                                          {
                                                            damage.DamageKindName
                                                          }
                                                        </option>
                                                      )
                                                    )}
                                                  </Form.Select>
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                {/* Damage Level Dropdown */}
                                                <div className="mb-1">
                                                  <strong>Damage Level:</strong>
                                                  <Form.Select
                                                    value={
                                                      inspection.DamageLevelID ||
                                                      ""
                                                    }
                                                    onChange={(e) => {
                                                      const selectedLevel =
                                                        damageLevels.find(
                                                          (lvl) =>
                                                            lvl.DamageLevelID ==
                                                            e.target.value
                                                        );
                                                      handleFieldChange(
                                                        spanIndex,
                                                        workKind,
                                                        inspection.inspection_id,
                                                        "DamageLevelID",
                                                        selectedLevel?.DamageLevelID
                                                      );
                                                      handleFieldChange(
                                                        spanIndex,
                                                        workKind,
                                                        inspection.inspection_id,
                                                        "DamageLevel",
                                                        selectedLevel?.DamageLevel
                                                      );
                                                    }}
                                                    className="form-control-sm ms-1"
                                                  >
                                                    <option value="">
                                                      Select Damage Level
                                                    </option>
                                                    {damageLevels.map(
                                                      (level) => (
                                                        <option
                                                          key={
                                                            level.DamageLevelID
                                                          }
                                                          value={
                                                            level.DamageLevelID
                                                          }
                                                        >
                                                          {level.DamageLevel}
                                                        </option>
                                                      )
                                                    )}
                                                  </Form.Select>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="row">
                                              <div className="col-md-12">
                                                <div className="mb-1">
                                                  <strong>
                                                    Damage Extent:
                                                  </strong>
                                                  <Form.Control
                                                    type="text"
                                                    placeholder="%"
                                                    value={
                                                      inspection.damage_extent ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      handleFieldChange(
                                                        spanIndex,
                                                        workKind,
                                                        inspection.inspection_id,
                                                        "damage_extent",
                                                        e.target.value
                                                      )
                                                    }
                                                    className="form-control-sm ms-1"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                            <div className="row">
                                              <div className="col-md-12">
                                                <div className="mb-2">
                                                  <strong>
                                                    Situation Remarks:
                                                  </strong>{" "}
                                                  {inspection.Remarks || "N/A"}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="row">
                                              <div className="col-md-6">
                                                <div className="mb-2">
                                                  <strong>
                                                    Consultant Remarks:
                                                  </strong>{" "}
                                                  {inspection.qc_remarks_con || "N/A"}
                                                </div>
                                              </div>
                                              <div className="col-md-6">
                                                <div className="mb-2">
                                                  <strong>Rams Remarks:</strong>{" "}
                                                  {inspection.qc_remarks_rams ||
                                                    "N/A"}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="row">
                                              <div className="col-md-12 d-flex flex-column justify-content-between">
                                                <div className="mb-1">
                                                  <strong>
                                                    Evaluator Remarks:
                                                  </strong>
                                                  <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Evaluator Remarks"
                                                    value={
                                                      inspection.qc_remarks_evaluator ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      handleEvalRemarksChange(
                                                        spanIndex,
                                                        workKind,
                                                        inspection.inspection_id,
                                                        e.target.value
                                                      )
                                                    }
                                                    className="mb-2"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-end">
                                              <Button
                                                onClick={() =>
                                                  handleSaveChanges(inspection)
                                                }
                                                className="bg-[#CFE2FF]"
                                              >
                                                Save Changes
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p>No pending records found.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No pending records found.</p>
              )}
            </div>
          )}

          <Modal
            show={showPhotoModal}
            onHide={handleClosePhotoModal}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Enlarged Photo</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              {selectedPhoto && (
                <img
                  src={selectedPhoto}
                  alt="Enlarged"
                  className="img-fluid rounded border"
                  style={{ maxWidth: "100%", maxHeight: "80vh" }}
                />
              )}
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default InspectionListEvaluator;
