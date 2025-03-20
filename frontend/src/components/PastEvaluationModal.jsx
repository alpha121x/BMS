import { Modal, Button, Table } from "react-bootstrap";

const PastEvaluationsModal = ({ show, onHide, evaluations }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Past Evaluations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {evaluations.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Evaluated By</th>
                <th>Bridge Name</th>
                <th>Span Index</th>
                <th>Work Kind</th>
                <th>Parts Name</th>
                <th>Material Name</th>
                <th>Damage Kind</th>
                <th>Damage Level</th>
                <th>Damage Extent</th>
                <th>QC Remarks (RAMS)</th>
                <th>QC Remarks (CON)</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evalData, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{"Evaluator"}{evalData.evaluator_id}</td>
                  <td>{evalData.bridge_name}</td>
                  <td>{evalData.SpanIndex}</td>
                  <td>{evalData.WorkKindName}</td>
                  <td>{evalData.PartsName}</td>
                  <td>{evalData.MaterialName}</td>
                  <td>{evalData.DamageKindName}</td>
                  <td>{evalData.DamageLevel}</td>
                  <td>{evalData.damage_extent || "N/A"}</td>
                  <td>{evalData.qc_remarks_rams || "N/A"}</td>
                  <td>{evalData.qc_remarks_con || "N/A"}</td>
                  <td>{evalData.Remarks || "No remarks"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">No past evaluations found.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PastEvaluationsModal;
