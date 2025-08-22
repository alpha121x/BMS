import React, { useState, useEffect } from 'react';
import { Spinner, Button, Modal, Table } from 'react-bootstrap';
import { BASE_URL } from './config';

// ========================
// Past Conditions Modal
// ========================
const PastConditionsModal = ({ show, handleClose, uu_bms_id }) => {
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show || !uu_bms_id) return;
    const fetchConditions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/past-overall-conditions?uu_bms_id=${uu_bms_id}`
        );
        if (!response.ok) throw new Error('Failed to fetch past conditions');
        const data = await response.json();
        setConditions(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConditions();
  }, [show, uu_bms_id]);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Past Overall Conditions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : conditions.length === 0 ? (
          <div className="text-center">No past records found.</div>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Condition</th>
                <th>Remarks</th>
                <th>Evaluator</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((cond, idx) => (
                <tr key={idx}>
                  <td>{cond.date_time ? new Date(cond.date_time).toLocaleString() : "N/A"}</td>
                  <td>{cond.overall_condition || "N/A"}</td>
                  <td>{cond.remarks || "N/A"}</td>
                  <td>Evaluator {cond.user_id || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PastConditionsModal;
