import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import {BASE_URL} from './config';

// Custom styles for the DataTable appearance
const customStyles = {
  table: {
    style: {
      width: '100%',
    },
  },
  headRow: {
    style: {
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
    },
  },
  headCells: {
    style: {
      padding: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
      borderBottom: '1px solid #ddd',
    },
  },
  cells: {
    style: {
      padding: '8px',
      '&:nth-child(1), &:nth-child(2)': { textAlign: 'left' },
      '&:nth-child(3), &:nth-child(4)': { textAlign: 'center' },
    },
  },
  pagination: {
    style: {
      borderTop: '1px solid #ddd',
      padding: '8px',
      fontSize: '14px',
    },
  },
};

const BridgesStatusSummary = () => {
  const [status, setStatus] = useState('pending'); // Default to pending
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when status changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/api/bridge-status-summary?status=${status}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Extract data based on status
        const inspections = result[status] || [];
        // Map API data to DataTable format
        const formattedData = inspections.map(item => ({
          referenceNo: item.uu_bms_id,
          bridgeName: item.bridge_name, // Placeholder; replace with actual bridge name if available
          totalInspections: parseInt(item.total_inspections, 10),
          reviewedInspections: parseInt(item.reviewed_inspections, 10),
        }));
        setData(formattedData);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  // Define columns for the DataTable
  const columns = [
    {
      name: 'Reference No',
      selector: row => row.referenceNo,
      sortable: true,
      center: false,
    },
    {
      name: 'Bridge Name',
      selector: row => row.bridgeName,
      sortable: true,
      center: false,
    },
    {
      name: 'Total Inspections',
      selector: row => row.totalInspections,
      sortable: true,
      center: true,
    },
    {
      name: 'Reviewed Inspections',
      selector: row => row.reviewedInspections,
      sortable: true,
      center: true,
    },
  ];

  // Handle toggle button click
  const handleToggle = (newStatus) => {
    setStatus(newStatus);
  };

  return (
    <div
      className="card p-0 rounded-lg text-black"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
      }}
    >
      <div className="card-header p-2" style={{ background: '#005D7F' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="mb uygun değil-0 text-white">Bridges Status Summary</h5>
            <span
              className="inline-flex items-center ms-5 px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}: {data.length} Bridges
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded text-sm font-medium text-white ${
                status === 'pending' ? 'bg-blue-700' : 'bg-blue-400 hover:bg-blue-600'
              }`}
              onClick={() => handleToggle('pending')}
            >
              Pending
            </button>
            <button
              className={`px-3 py-1 rounded text-sm font-medium text-white ${
                status === 'approved' ? 'bg-blue-700' : 'bg-blue-400 hover:bg-blue-600'
              }`}
              onClick={() => handleToggle('approved')}
            >
              Approved
            </button>
          </div>
        </div>
      </div>
      <div className="card-body p-0 pb-2">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">Error: {error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            striped
            responsive
            noDataComponent="No bridges found"
          />
        )}
      </div>
    </div>
  );
};

export default BridgesStatusSummary;