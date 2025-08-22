import React, { useState, useEffect } from "react";
import { Form, Spinner, Button, FormCheck } from "react-bootstrap";
import { BASE_URL } from "./config";
import DamageSummary from "./DamageSummary";

const OverallBridgeCondition = ({ inventoryData }) => {
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
  const userId = userToken?.userId;
  const user_type = userToken?.usertype;


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

  // Fetch Work Kinds from API
  useEffect(() => {
    const fetchWorkKinds = async () => {
      setLoadingWorkKinds(true);
      try {
        const response = await fetch(`${BASE_URL}/api/work-kinds`);
        if (!response.ok) {
          throw new Error("Failed to fetch work kinds");
        }
        const data = await response.json();
        setWorkKinds(data);
      } catch (error) {
        console.error("Error fetching work kinds:", error);
        setError("Failed to load work kinds");
      } finally {
        setLoadingWorkKinds(false);
      }
    };

    fetchWorkKinds();
  }, []);

  // Fetch Damage Counts for the specific bridge
  useEffect(() => {
    const fetchDamageCounts = async () => {
      if (!inventoryData?.uu_bms_id) return;
      setLoadingDamageCounts(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/damage-counts?uu_bms_id=${inventoryData.uu_bms_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch damage counts");
        }
        const data = await response.json();
        const countsMap = {};
        data.forEach((item) => {
          countsMap[item.WorkKindID] = item;
        });
        setDamageCounts(countsMap);
      } catch (error) {
        console.error("Error fetching damage counts:", error);
        setError("Failed to load damage counts");
      } finally {
        setLoadingDamageCounts(false);
      }
    };

    fetchDamageCounts();
  }, [inventoryData?.uu_bms_id]);

  // Set initial values from inventoryData
  useEffect(() => {
    setOverallCondition(inventoryData?.overall_bridge_condition ?? "");
    setOverallRemarks(inventoryData?.overall_bridge_remarks ?? "");
    setIsBridgeCompleted(Boolean(inventoryData?.is_bridge_completed));
  }, [inventoryData]);

  // Handle condition selection
  const handleConditionSelect = (e) => {
    const selectedCondition = e.target.value;
    setOverallCondition(selectedCondition);
  };

  // Handle save for all fields
  const handleSaveAll = async () => {
    try {
      const requestData = {
        overall_bridge_condition: overallCondition,
        overall_remarks: overallRemarks,
        is_bridge_completed: isBridgeCompleted,
        user_id: userId,
        uu_bms_id: inventoryData.uu_bms_id,
        raw_id: inventoryData.raw_id,
        user_type: user_type,
      };

      console.log("Saving data:", requestData);
      // return;

      const response = await fetch(`${BASE_URL}/api/update-bridge-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to update bridge data");
      }

      const result = await response.json();
      setUpdateSuccess(result.message);
      setUpdateError(null);
    } catch (error) {
      console.error("Error updating bridge data:", error);
      setUpdateError("Failed to update bridge data");
      setUpdateSuccess(null);
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
    <div className="p-3 mt-3 rounded bg-blue-100 border-2 border-blue-400 shadow-md">
      <DamageSummary
        workKinds={workKinds}
        damageCounts={damageCounts}
        loadingWorkKinds={loadingWorkKinds}
        loadingDamageCounts={loadingDamageCounts}
        error={error}
      />
      <div className="mb-4">
        <label className="font-bold text-blue-900">
          Overall Bridge Condition
        </label>
        {loadingConditions ? (
          <div className="text-center py-2">
            <Spinner animation="border" size="sm" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <Form.Select
            value={overallCondition}
            onChange={handleConditionSelect}
            className="p-2 text-sm font-bold"
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
          <div className="text-green-500 mt-2">{updateSuccess}</div>
        )}
        {updateError && <div className="text-red-500 mt-2">{updateError}</div>}
      </div>
      <div className="mb-3">
        <label className="font-bold text-blue-900">Overall Remarks</label>
        <Form.Control
          as="textarea"
          rows={3}
          value={overallRemarks}
          onChange={(e) => setOverallRemarks(e.target.value)}
          placeholder="Enter overall remarks..."
          className="resize-y"
        />
      </div>
      <div className="flex items-center">
        <FormCheck
          type="switch"
          id="isBridgeCompleted"
          label="Is Bridge Completed"
          checked={isBridgeCompleted}
          onChange={(e) => setIsBridgeCompleted(e.target.checked)}
          className="mr-4"
        />
        <Button variant="primary" onClick={handleSaveAll}>
          Save All
        </Button>
      </div>
    </div>
  );
};

export default OverallBridgeCondition;
