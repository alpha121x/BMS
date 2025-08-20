import React from 'react';
import { Spinner } from 'react-bootstrap';

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
    <div className="border border-gray-300 rounded-lg p-2 m-1">
      <h6 className="text-sm font-semibold">{title}</h6>
      <div className="flex flex-wrap">
        {damageLevels.map((level) => (
          <span
            key={level}
            className="w-10 h-10 flex items-center justify-center m-1 text-black font-bold rounded"
            style={{ backgroundColor: levelColors[level] }}
          >
            {normalizedCounts[level]}
          </span>
        ))}
      </div>
    </div>
  );
};

const DamageSummary = ({ workKinds, damageCounts, loadingWorkKinds, loadingDamageCounts, error }) => {
  return (
    <div className="mb-4 bg-[#DBEAFE] p-4">
      {/* Title */}
      <h4 className="text-center mb-3 text-lg font-bold">Damage Status</h4>

      {/* Legend */}
      <div className="flex justify-around mb-3 flex-wrap gap-2">
        <button className="px-4 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#9FD585' }}>No Damage</button>
        <button className="px-4 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#DBDBDB' }}>Invisible</button>
        <button className="px-4 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#00C4FF' }}>Good</button>
        <button className="px-4 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#FFD685' }}>Fair</button>
        <button className="px-4 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#FFAA00' }}>Poor</button>
        <button className="px-4 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#FF0000' }}>Severe</button>
      </div>

      {/* Content */}
      <div className="flex flex-wrap justify-around">
        {loadingWorkKinds || loadingDamageCounts ? (
          <div className="text-center py-2 w-full">
            <Spinner animation="border" size="sm" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center w-full">{error}</div>
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
  );
};

export default DamageSummary;