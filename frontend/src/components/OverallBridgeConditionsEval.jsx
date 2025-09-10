import React, { useState, useEffect } from "react";
import { Form, Spinner, Button, FormCheck } from "react-bootstrap";
import { BASE_URL } from "./config";
import PastConditionsModal from "./PastOverallConditions";
import DamageSummary from "./DamageSummary"; // Import DamageSummary

const OverallBridgeConditionEval = ({ inventoryData }) => {
  const [overallCondition, setOverallCondition] = useState("");
  const [visualConditions, setVisualConditions] = useState([]);
  const [workKinds, setWorkKinds] = useState([]);
  const [damageCounts, setDamageCounts] = useState({});
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [loadingWorkKinds, setLoadingWorkKinds] = useState(false);
  const [loadingDamageCounts, setLoadingDamageCounts] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [overallRemarks, setOverallRemarks] = useState("");
  const [isBridgeCompleted, setIsBridgeCompleted] = useState(false);
  const userToken = JSON.parse(sessionStorage.getItem("userEvaluation"));
  const [showPastModal, setShowPastModal] = useState(false);
  const userId = userToken?.userId;
  const user_type = userToken?.usertype;

  // States for evaluation table
  const [evaluationState, setEvaluationState] = useState({});

  const evaluationOptions = ["Good", "Fair", "Poor", "Severe"];
  const components = [
    "Superstructure",
    "Substructure",
    "Connections b/w the Superstructure and Substructure",
    "Protection Work (wing wall, approach slab, guide banks etc.)",
    "Expansion Joint, Pavement, and Railing, drainage etc.",
    "Bridge (As a Whole)",
  ];
  const factors = ["Live Load", "Earthquake", "Heavy Rain/Flooding"];

  // Handle table value changes
  const handleEvaluationChange = (component, factor, value) => {
    setEvaluationState((prev) => ({
      ...prev,
      [component]: {
        ...prev[component],
        [factor]: value,
      },
    }));
  };

  // Unified save function
  const handleSaveAll = async () => {
    try {
      const requestData = {
        evaluation_rating: evaluationState,
        overall_bridge_condition: overallCondition,
        overall_remarks: overallRemarks,
        is_bridge_completed: isBridgeCompleted,
        user_id: userId,
        uu_bms_id: inventoryData.uu_bms_id,
        raw_id: inventoryData.raw_id,
        user_type: user_type,
      };

      const response = await fetch(`${BASE_URL}/api/update-bridge-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok)
        throw new Error(
          "Failed to update bridge evaluation, remarks, and condition"
        );

      const result = await response.json();
      setUpdateSuccess(result.message);
      setUpdateError(null);
    } catch (error) {
      console.error("Error saving data:", error);
      setUpdateError("Failed to save bridge evaluation, remarks, or condition");
      setUpdateSuccess(null);
    }
  };

  // Fetch Visual Conditions from API
  useEffect(() => {
    const fetchVisualConditions = async () => {
      setLoadingConditions(true);
      try {
        const response = await fetch(`${BASE_URL}/api/visual-conditions`);
        if (!response.ok) throw new Error("Failed to fetch visual conditions");
        const data = await response.json();
        setVisualConditions(data);
      } catch {
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

  // Fetch Work Kinds
  useEffect(() => {
    const fetchWorkKinds = async () => {
      setLoadingWorkKinds(true);
      try {
        const response = await fetch(`${BASE_URL}/api/work-kinds`);
        if (!response.ok) throw new Error("Failed to fetch work kinds");
        const data = await response.json();
        setWorkKinds(data);
      } catch {
        setError("Failed to load work kinds");
      } finally {
        setLoadingWorkKinds(false);
      }
    };
    fetchWorkKinds();
  }, []);

  // Fetch Damage Counts
  useEffect(() => {
    const fetchDamageCounts = async () => {
      if (!inventoryData?.uu_bms_id) return;
      setLoadingDamageCounts(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/damage-counts?uu_bms_id=${inventoryData.uu_bms_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch damage counts");
        const data = await response.json();
        const countsMap = {};
        data.forEach((item) => {
          countsMap[item.WorkKindID] = item;
        });
        setDamageCounts(countsMap);
      } catch {
        setError("Failed to load damage counts");
      } finally {
        setLoadingDamageCounts(false);
      }
    };
    fetchDamageCounts();
  }, [inventoryData?.uu_bms_id]);

  // Set initial overall condition and remarks
  useEffect(() => {
    if (inventoryData?.overall_bridge_condition) {
      setOverallCondition(inventoryData.overall_bridge_condition);
    }
    if (inventoryData?.overall_bridge_remarks) {
      setOverallRemarks(inventoryData.overall_bridge_remarks);
    }
    if (inventoryData?.is_bridge_completed !== undefined) {
      setIsBridgeCompleted(inventoryData.is_bridge_completed);
    }
  }, [inventoryData]);

  // Local select only
  const handleConditionSelect = (e) => {
    setOverallCondition(e.target.value);
  };

  // Style helper
  const getConditionStyle = (condition) => {
    switch (condition.toLowerCase()) {
      case "good":
        return { backgroundColor: "#9FD585", fontWeight: "bold" };
      case "fair":
        return { backgroundColor: "#FFD685", fontWeight: "bold" };
      case "poor":
        return { backgroundColor: "#FF8585", fontWeight: "bold" };
      case "under construction":
        return { backgroundColor: "#DBDBDB", fontWeight: "bold" };
      default:
        return {};
    }
  };

  return (
    <div
      className="card p-3 mt-3"
      style={{ background: "#CFE2FF", border: "2px solid #60A5FA" }}
    >
      <DamageSummary
        workKinds={workKinds}
        damageCounts={damageCounts}
        loadingWorkKinds={loadingWorkKinds}
        loadingDamageCounts={loadingDamageCounts}
        bridgeId={inventoryData?.uu_bms_id}
        error={error}
      />
      {userId !== 1 && (
        <div className="mb-3 d-flex justify-content-start">
          <Button variant="info" onClick={() => setShowPastModal(true)}>
            Past Overall Conditions
          </Button>
        </div>
      )}
      <Form.Group>
        <Form.Label style={{ fontWeight: "bold", color: "#1E3A8A" }}>
          Overall Bridge Condition
        </Form.Label>
        {loadingConditions ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <Form.Select
            value={overallCondition}
            onChange={handleConditionSelect}
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
      </Form.Group>
      <div className="mt-4">
        <h5 className="text-center mb-3">Bridge Component Evaluation</h5>
        <Form>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>Bridge Components</th>
                {factors.map((factor) => (
                  <th key={factor}>{factor}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {components.map((component) => (
                <tr key={component}>
                  <td>{component}</td>
                  {factors.map((factor) => (
                    <td key={factor}>
                      <Form.Select
                        value={evaluationState[component]?.[factor] || ""}
                        onChange={(e) =>
                          handleEvaluationChange(
                            component,
                            factor,
                            e.target.value
                          )
                        }
                      >
                        <option value="">-- Select --</option>
                        {evaluationOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Form>
      </div>
      {userId !== 1 && (
        <PastConditionsModal
          show={showPastModal}
          handleClose={() => setShowPastModal(false)}
          uu_bms_id={inventoryData?.uu_bms_id}
        />
      )}
      <Form.Group className="mt-3">
        <Form.Label style={{ fontWeight: "bold", color: "#1E3A8A" }}>
          Overall Remarks (Evaluator)
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={overallRemarks}
          onChange={(e) => setOverallRemarks(e.target.value)}
          placeholder="Enter overall remarks..."
        />
      </Form.Group>
      <Form.Group className="mt-3 d-flex align-items-center">
        <FormCheck
          type="switch"
          id="isBridgeCompleted"
          label="Is Bridge Completed"
          checked={isBridgeCompleted}
          onChange={(e) => setIsBridgeCompleted(e.target.checked)}
          style={{ marginRight: "15px" }}
        />
      </Form.Group>
      <div className="mt-3">
        <Button variant="success" onClick={handleSaveAll}>
          Save All
        </Button>
      </div>
      {updateSuccess && (
        <div className="text-success mt-2">{updateSuccess}</div>
      )}
      {updateError && <div className="text-danger mt-2">{updateError}</div>}
    </div>
  );
};

export default OverallBridgeConditionEval;