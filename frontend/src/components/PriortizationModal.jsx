import React from 'react';
import { Modal, Table } from 'react-bootstrap';

const BridgeDetailsModal = ({ showModal, setShowModal, selectedTitle, modalData }) => {
  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Bridges Category - {selectedTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {modalData.length > 0 ? (
          <Table bordered hover>
            <thead>
              <tr>
                <th>District</th>
                <th>Road Name</th>
                <th>Structure Type</th>
                <th>Bridge Name</th>
                <th>Damage Score</th>
                <th>Date Time</th>
              </tr>
            </thead>
            <tbody>
              {modalData.map((bridge, idx) => (
                <tr key={idx}>
                  <td>{bridge.district}</td>
                  <td>{bridge.roadName}</td>
                  <td>{bridge.structureType}</td>
                  <td>{bridge.name}</td>
                  <td>{bridge.score}</td>
                  <td>{bridge.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No bridges found for this group.</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default BridgeDetailsModal;