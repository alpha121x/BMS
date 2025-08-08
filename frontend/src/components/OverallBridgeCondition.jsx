import React, { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { BASE_URL } from './config';

const OverallBridgeCondition = ({ inventoryData }) => {
  const [overallCondition, setOverallCondition] = useState('');
  const [visualConditions, setVisualConditions] = useState([]);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

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

  // Set initial overall condition from inventoryData
  useEffect(() => {
    if (inventoryData?.overall_bridge_condition) {
      setOverallCondition(inventoryData.overall_bridge_condition);
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
    </div>
  );
};

export default OverallBridgeCondition;