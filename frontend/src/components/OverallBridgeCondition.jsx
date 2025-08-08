import React, { useState, useEffect } from 'react';
import { Form, Spinner, Button, FormCheck } from 'react-bootstrap';
import { BASE_URL } from './config';

const DamageStatusBox = ({ title, counts }) => {
  const damageLevels = ['No Damage', 'Invisible', 'Good', 'Fair', 'Poor', 'Severe'];
  const levelColors = {
    'No Damage': '#9FD585',
    'Invisible': '#DBDBDB',
    'Good': '#00C4FF',
    'Fair': '#FFD685',
    'Poor': '#FFAA00',
    'Severe': '#FF0000',
  };

  // Normalize API response keys to match expected levels
  const normalizedCounts = {
    'No Damage': counts['No damage'] || counts['No Damage'] || 0,
    'Invisible': counts['Invisible'] || 0,
    'Good': counts['I. Good'] || counts['Good'] || 0,
    'Fair': counts['II. Fair'] || counts['Fair'] || 0,
    'Poor': counts['III. Poor'] || counts['Poor'] || 0,
    'Severe': counts['Severe'] || 0,
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '10px', margin: '5px' }}>
      <h6>{title}</h6>
      <div className="d-flex flex-wrap">
        {damageLevels.map((level) => (
          <span
            key={level}
            style={{
              backgroundColor: levelColors[level],
              width: '40px',
              height: '40px',
              display: 'inline-block',
              margin: '5px',
              textAlign: 'center',
              lineHeight: '40px',
              color: 'black',
              fontWeight: 'bold',
              borderRadius: '5px',
            }}
          >
            {normalizedCounts[level]}
          </span>
        ))}
      </div>
    </div>
  );
};

const OverallBridgeCondition = ({ inventoryData }) => {
  const [overallCondition, setOverallCondition] = useState('');
  const [visualConditions, setVisualConditions] = useState([]);
  const [workKinds, setWorkKinds] = useState([]);
  const [damageCounts, setDamageCounts] = useState({});
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [loadingWorkKinds, setLoadingWorkKinds] = useState(false);
  const [loadingDamageCounts, setLoadingDamageCounts] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [overallRemarks, setOverallRemarks] = useState(''); // New state for Overall Remarks
  const [isBridgeCompleted, setIsBridgeCompleted] = useState(false); // New state for Is Bridge Completed

  // Fetch Visual Conditions from API
  useEffect(() => {
    const fetchVisualConditions = async () => {
      setLoadingConditions(true);
      try {
        const response = await fetch(`${BASE_URL}/api/visual-conditions`);
        if (!response.ok) {
          throw new Error('Failed to fetch visual conditions');
        }
        const data = await response.json();
        setVisualConditions(data);
      } catch (error) {
        console.error('Error fetching visual conditions:', error);
        setVisualConditions([
          { id: 1, visual_condition: 'FAIR' },
          { id: 2, visual_condition: 'GOOD' },
          { id: 3, visual_condition: 'POOR' },
          { id: 4, visual_condition: 'UNDER CONSTRUCTION' },
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
          throw new Error('Failed to fetch work kinds');
        }
        const data = await response.json();
        setWorkKinds(data);
      } catch (error) {
        console.error('Error fetching work kinds:', error);
        setError('Failed to load work kinds');
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
          throw new Error('Failed to fetch damage counts');
        }
        const data = await response.json();
        // Transform data into a map of WorkKindID to damage level counts
        const countsMap = {};
        data.forEach((item) => {
          countsMap[item.WorkKindID] = item;
        });
        setDamageCounts(countsMap);
      } catch (error) {
        console.error('Error fetching damage counts:', error);
        setError('Failed to load damage counts');
      } finally {
        setLoadingDamageCounts(false);
      }
    };

    fetchDamageCounts();
  }, [inventoryData?.uu_bms_id]);

  // Set initial overall condition from inventoryData
  useEffect(() => {
    if (inventoryData?.overall_bridge_condition) {
      setOverallCondition(inventoryData.overall_bridge_condition);
    }
    if (inventoryData?.overall_remarks) {
      setOverallRemarks(inventoryData.overall_remarks); // Initialize Remarks if available
    }
    if (inventoryData?.is_bridge_completed !== undefined) {
      setIsBridgeCompleted(inventoryData.is_bridge_completed); // Initialize toggle if available
    }
  }, [inventoryData]);

  // Handle condition selection and API update
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
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update overall bridge condition');
        }

        const result = await response.json();
        setUpdateSuccess(result.message);
        setUpdateError(null);
      } catch (error) {
        console.error('Error updating overall bridge condition:', error);
        setUpdateError('Failed to update overall bridge condition');
        setUpdateSuccess(null);
      }
    }
  };

  // Handle save for Remarks and Is Bridge Completed
  const handleSaveRemarksAndToggle = async () => {
    try {
      const requestData = {
        overall_remarks: overallRemarks,
        is_bridge_completed: isBridgeCompleted,
      };

    //   console.log('Request Data:', requestData);
    //   return;

      const response = await fetch(
        `${BASE_URL}/api/update-remarks-toggle/${inventoryData.uu_bms_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update remarks and toggle');
      }

      const result = await response.json();
      setUpdateSuccess(result.message);
      setUpdateError(null);
    } catch (error) {
      console.error('Error updating remarks and toggle:', error);
      setUpdateError('Failed to update remarks and toggle');
      setUpdateSuccess(null);
    }
  };

  // Map visual conditions to colors
  const getConditionStyle = (condition) => {
    switch (condition.toLowerCase()) {
      case 'good':
        return {
          backgroundColor: '#9FD585',
          color: 'black',
          fontWeight: 'bold',
        };
      case 'fair':
        return {
          backgroundColor: '#FFD685',
          color: 'black',
          fontWeight: 'bold',
        };
      case 'poor':
        return {
          backgroundColor: '#FF8585',
          color: 'black',
          fontWeight: 'bold',
        };
      case 'under construction':
        return {
          backgroundColor: '#DBDBDB',
          color: 'black',
          fontWeight: 'bold',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className="card p-3 mt-3"
      style={{
        background: '#CFE2FF',
        border: '2px solid #60A5FA',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="mb-4">
        <h4 className="text-center mb-3">Damage Status</h4>
        <div className="d-flex justify-content-around mb-3">
          <button style={{ backgroundColor: '#9FD585', padding: '5px 15px', border: 'none', borderRadius: '10px' }}>No Damage</button>
          <button style={{ backgroundColor: '#DBDBDB', padding: '5px 15px', border: 'none', borderRadius: '10px' }}>Invisible</button>
          <button style={{ backgroundColor: '#00C4FF', padding: '5px 15px', border: 'none', borderRadius: '10px' }}>Good</button>
          <button style={{ backgroundColor: '#FFD685', padding: '5px 15px', border: 'none', borderRadius: '10px' }}>Fair</button>
          <button style={{ backgroundColor: '#FFAA00', padding: '5px 15px', border: 'none', borderRadius: '10px' }}>Poor</button>
          <button style={{ backgroundColor: '#FF0000', padding: '5px 15px', border: 'none', borderRadius: '10px' }}>Severe</button>
        </div>
        <div className="d-flex flex-wrap justify-content-around">
          {loadingWorkKinds || loadingDamageCounts ? (
            <div className="text-center py-2 w-100">
              <Spinner animation="border" size="sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="text-danger text-center w-100">{error}</div>
          ) : (
            workKinds.map((workKind) => (
              <DamageStatusBox
                key={workKind.WorkKindID}
                title={workKind.WorkKindName}
                counts={damageCounts[workKind.WorkKindID] || {}}
              />
            ))
          )}
        </div>
      </div>
      <Form.Group>
        <Form.Label
          className="custom-label"
          style={{ fontWeight: 'bold', color: '#1E3A8A' }}
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
              padding: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
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
      <Form.Group className="mt-3">
        <Form.Label style={{ fontWeight: 'bold', color: '#1E3A8A' }}>Overall Remarks</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={overallRemarks}
          onChange={(e) => setOverallRemarks(e.target.value)}
          placeholder="Enter overall remarks..."
          style={{ resize: 'vertical' }}
        />
      </Form.Group>
      <Form.Group className="mt-3 d-flex align-items-center">
        <FormCheck
          type="switch"
          id="isBridgeCompleted"
          label="Is Bridge Completed"
          checked={isBridgeCompleted}
          onChange={(e) => setIsBridgeCompleted(e.target.checked)}
          style={{ marginRight: '15px' }}
        />
        <Button variant="primary" onClick={handleSaveRemarksAndToggle}>
          Save
        </Button>
      </Form.Group>
    </div>
  );
};

export default OverallBridgeCondition;