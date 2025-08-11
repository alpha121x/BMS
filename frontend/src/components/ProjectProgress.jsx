import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BASE_URL } from './config'; // Adjust the import based on your project structure

const ProjectProgress = ({ districtId, bridgeName, structureType }) => {
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showInspectionDetail, setShowInspectionDetail] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [districtId, bridgeName, structureType]);

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (districtId) params.append('districtId', districtId);
      if (bridgeName) params.append('bridgeName', bridgeName);
      if (structureType) params.append('structureType', structureType);

      // Fetch bridge status summary
      const bridgeResponse = await fetch(`${BASE_URL}/api/bridge-status-summary?${params.toString()}`);
      if (!bridgeResponse.ok) throw new Error('Failed to fetch bridge data');
      const bridgeData = await bridgeResponse.json();

      // Fetch unapproved inspections (consultant)
      const consultantParams = new URLSearchParams();
      if (districtId) consultantParams.append('district', districtId);
      if (bridgeName) consultantParams.append('bridge', bridgeName);
      if (structureType) consultantParams.append('structureType', structureType);

      const consultantResponse = await fetch(`${BASE_URL}/api/inspections-unapproved?${consultantParams.toString()}`);
      const consultantData = consultantResponse.ok ? await consultantResponse.json() : { data: [] };

      // Fetch unapproved inspections (RAMS)
      const ramsResponse = await fetch(`${BASE_URL}/api/inspections-unapproved-rams?${consultantParams.toString()}`);
      const ramsData = ramsResponse.ok ? await ramsResponse.json() : { data: [] };

      // Combine and process data
    const combinedData = bridgeData.map(bridge => {
  const consultantUnapproved = consultantData.data?.filter(item => 
    item.uu_bms_id === bridge.uu_bms_id
  ) || [];
  const ramsUnapproved = ramsData.data?.filter(item => 
    item.uu_bms_id === bridge.uu_bms_id
  ) || [];

  return {
    ...bridge,
    bridgeName: bridge.bridge_name,
    district: districtId || 'N/A',
    structureLength: 'N/A',
    totalInspections: bridge.total_inspections || 0,
    unapprovedByConsultant: consultantUnapproved.length,
    unapprovedByRAMS: ramsUnapproved.length,
    approvedByConsultant: bridge.approved_insp || 0,
    approvedByRAMS: 0,
    consultantComments: 'N/A',
    ramsComments: 'N/A',
    consultantUnapprovedData: consultantUnapproved,
    ramsUnapprovedData: ramsUnapproved
  };
});

      setProjectData(combinedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (type, bridge) => {
    setModalLoading(true);
    setShowModal(true);
    
    let data = [];
    let title = '';

    switch (type) {
      case 'totalInspections':
        title = `Total Inspections - ${bridge.bridgeName}`;
        data = [
          ...bridge.consultantUnapprovedData.map(item => ({ ...item, source: 'Consultant', unapprovedBy: 'Consultant' })),
          ...bridge.ramsUnapprovedData.map(item => ({ ...item, source: 'RAMS', unapprovedBy: 'RAMS' }))
        ];
        break;
      case 'unapprovedByConsultant':
        title = `Unapproved by Consultant - ${bridge.bridgeName}`;
        data = bridge.consultantUnapprovedData.map(item => ({ ...item, unapprovedBy: 'Consultant' }));
        break;
      case 'unapprovedByRAMS':
        title = `Unapproved by RAMS - ${bridge.bridgeName}`;
        data = bridge.ramsUnapprovedData.map(item => ({ ...item, unapprovedBy: 'RAMS' }));
        break;
      case 'approvedByConsultant':
        title = `Approved by Consultant - ${bridge.bridgeName}`;
        data = [];
        break;
      case 'approvedByRAMS':
        title = `Approved by RAMS - ${bridge.bridgeName}`;
        data = [];
        break;
      default:
        data = [];
    }

    setModalTitle(title);
    setModalData(data);
    setModalLoading(false);
  };

  const handleInspectionDetail = (inspection) => {
    setSelectedInspection(inspection);
    setShowInspectionDetail(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Bridge Name', 'District', 'Structure Length', 'Total Inspections', 'Unapproved by Consultant', 'Unapproved by RAMS', 'Approved by Consultant', 'Approved by RAMS'],
      ...projectData.map(row => [
        row.bridgeName,
        row.district,
        row.structureLength,
        row.totalInspections,
        row.unapprovedByConsultant,
        row.unapprovedByRAMS,
        row.approvedByConsultant,
        row.approvedByRAMS
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'project-progress.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Custom styles for DataTable
  const customStyles = {
    table: {
      style: {
        width: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#343a40',
        color: '#fff',
        borderBottom: '1px solid #dee2e6',
      },
    },
    headCells: {
      style: {
        padding: '12px 8px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fff',
        borderRight: '1px solid #495057',
      },
    },
    rows: {
      style: {
        fontSize: '13px',
        borderBottom: '1px solid #dee2e6',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
      stripedStyle: {
        backgroundColor: '#f8f9fa',
      },
    },
    cells: {
      style: {
        padding: '8px',
        borderRight: '1px solid #dee2e6',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        padding: '8px',
        fontSize: '14px',
      },
    },
  };

  // Define columns for the main table
  const columns = [
    {
      name: 'Bridge Name',
      selector: row => row.bridgeName,
      sortable: true,
      width: '200px',
    },
    {
      name: 'District',
      selector: row => row.district,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Structure Length',
      selector: row => row.structureLength,
      sortable: true,
      width: '130px',
    },
    {
      name: 'Total Inspections',
      selector: row => row.totalInspections,
      sortable: true,
      width: '130px',
      cell: row => (
        <Button
          variant="link"
          className="p-0 text-primary fw-bold"
          onClick={() => handleCellClick('totalInspections', row)}
          style={{ textDecoration: 'none' }}
        >
          {row.totalInspections}
        </Button>
      ),
    },
    {
      name: 'Unapproved by Consultant',
      selector: row => row.unapprovedByConsultant,
      sortable: true,
      width: '160px',
      cell: row => (
        <Button
          variant="link"
          className="p-0 text-warning fw-bold"
          onClick={() => handleCellClick('unapprovedByConsultant', row)}
          disabled={row.unapprovedByConsultant === 0}
          style={{ textDecoration: 'none' }}
        >
          {row.unapprovedByConsultant}
        </Button>
      ),
    },
    {
      name: 'Unapproved by RAMS',
      selector: row => row.unapprovedByRAMS,
      sortable: true,
      width: '140px',
      cell: row => (
        <Button
          variant="link"
          className="p-0 text-warning fw-bold"
          onClick={() => handleCellClick('unapprovedByRAMS', row)}
          disabled={row.unapprovedByRAMS === 0}
          style={{ textDecoration: 'none' }}
        >
          {row.unapprovedByRAMS}
        </Button>
      ),
    },
    {
      name: 'Approved by Consultant',
      selector: row => row.approvedByConsultant,
      sortable: true,
      width: '150px',
      cell: row => (
        <Button
          variant="link"
          className="p-0 text-success fw-bold"
          onClick={() => handleCellClick('approvedByConsultant', row)}
          disabled={row.approvedByConsultant === 0}
          style={{ textDecoration: 'none' }}
        >
          {row.approvedByConsultant}
        </Button>
      ),
    },
    {
      name: 'Approved by RAMS',
      selector: row => row.approvedByRAMS,
      sortable: true,
      width: '130px',
      cell: row => (
        <Button
          variant="link"
          className="p-0 text-success fw-bold"
          onClick={() => handleCellClick('approvedByRAMS', row)}
          disabled={row.approvedByRAMS === 0}
          style={{ textDecoration: 'none' }}
        >
          {row.approvedByRAMS}
        </Button>
      ),
    },
    {
      name: 'Consultant Comments',
      selector: row => row.consultantComments,
      sortable: true,
      width: '150px',
    },
    {
      name: 'RAMS Comments',
      selector: row => row.ramsComments,
      sortable: true,
      width: '130px',
    },
  ];

  // Define columns for the modal inspection table
  const modalColumns = [
    {
      name: 'Bridge Name',
      selector: row => row.bridge_name || 'N/A',
      sortable: true,
      width: '150px',
    },
    {
      name: 'Structure Length',
      selector: row => 'N/A',
      width: '120px',
    },
    {
      name: 'Span Number',
      selector: row => row.SpanIndex || 'N/A',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Work Kind',
      selector: row => row.WorkKindName || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Element Name',
      selector: row => row.PartsName || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Material',
      selector: row => row.MaterialName || 'N/A',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Damage Kind',
      selector: row => row.DamageKindName || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Damage Level',
      selector: row => row.DamageLevel || 'N/A',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Extent',
      selector: row => row.damage_extent || 'N/A',
      sortable: true,
      width: '80px',
    },
    {
      name: 'Unapproved By',
      selector: row => row.unapprovedBy || 'N/A',
      sortable: true,
      width: '120px',
      cell: row => (
        <span className={`badge ${row.unapprovedBy === 'Consultant' ? 'bg-warning' : 'bg-info'}`}>
          {row.unapprovedBy || 'N/A'}
        </span>
      ),
    },
    {
      name: 'Details',
      width: '80px',
      cell: row => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleInspectionDetail(row)}
        >
          👁️
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading Project Progress...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      {/* Header */}
      <div className="card-header" style={{ background: '#005D7F', color: '#fff' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-3">Project Progress</h5>
            <span className="badge bg-light text-dark">
              Total: {projectData.length} bridges
            </span>
          </div>
          <Button
            variant="light"
            size="sm"
            onClick={exportToCSV}
            className="d-flex align-items-center"
          >
            📥
            <span className="ms-1">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Main DataTable */}
      <div className="card-body p-0">
        <DataTable
          columns={columns}
          data={projectData}
          customStyles={customStyles}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          responsive
          fixedHeader
          fixedHeaderScrollHeight="600px"
          subHeader
          subHeaderComponent={
            <div className="d-flex align-items-center mb-3 w-100">
              <div className="input-group" style={{ maxWidth: '400px' }}>
                <span className="input-group-text">🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search bridges..."
                  onChange={(e) => {
                    // DataTable has built-in search functionality
                  }}
                />
              </div>
            </div>
          }
          noDataComponent={
            <div className="text-center p-4">
              <p className="mb-0">No bridge data available</p>
            </div>
          }
        />
      </div>

      {/* Inspections List Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading inspections...</p>
            </div>
          ) : (
            <DataTable
              columns={modalColumns}
              data={modalData}
              customStyles={customStyles}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50]}
              highlightOnHover
              striped
              responsive
              noDataComponent={
                <div className="text-center p-4">
                  <p className="mb-0">No inspections found</p>
                </div>
              }
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Inspection Detail Modal */}
      <Modal show={showInspectionDetail} onHide={() => setShowInspectionDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Inspection Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInspection && (
            <div>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <tbody>
                    <tr>
                      <th className="bg-light" style={{ width: '30%' }}>Bridge Name</th>
                      <td>{selectedInspection.bridge_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Span Index</th>
                      <td>{selectedInspection.SpanIndex || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Element</th>
                      <td>{selectedInspection.PartsName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Material</th>
                      <td>{selectedInspection.MaterialName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Damage Kind</th>
                      <td>{selectedInspection.DamageKindName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Damage Level</th>
                      <td>{selectedInspection.DamageLevel || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Damage Extent</th>
                      <td>{selectedInspection.damage_extent || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Inspection Date</th>
                      <td>
                        {selectedInspection.current_date_time ? 
                          new Date(selectedInspection.current_date_time).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-light">Remarks</th>
                      <td>{selectedInspection.Remarks || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Consultant Remarks</th>
                      <td>{selectedInspection.qc_remarks_con || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">RAMS Remarks</th>
                      <td>{selectedInspection.qc_remarks_rams || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Photos */}
              {selectedInspection.PhotoPaths && selectedInspection.PhotoPaths.length > 0 && (
                <div className="mt-3">
                  <h6>Inspection Photos</h6>
                  <div className="row">
                    {selectedInspection.PhotoPaths.map((photo, index) => (
                      <div key={index} className="col-md-4 mb-2">
                        <img
                          src={photo}
                          alt={`Inspection ${index + 1}`}
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProjectProgress;