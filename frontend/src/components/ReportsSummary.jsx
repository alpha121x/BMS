import React from "react";

const ReportsSummary = ({ summaryData, getUniqueSpanIndices, getDamageLevel, getMaterials, getWorkKind }) => {
  return (
    <div className="summary-section mt-1 mb-1">
      <h4 className="text-sm font-semibold text-gray-700 mb-1">Reports Summary</h4>
      <div className="bg-gray-200 mb-2 mt-1 py-2 px-3 rounded-md shadow border">
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <div>
            <strong>Total Spans:</strong>
            <p className="text-gray-700">{getUniqueSpanIndices(summaryData)}</p>
          </div>
          <div>
            <strong>Damage Levels:</strong>
            <p className="text-gray-700">{getDamageLevel(summaryData)}</p>
          </div>
          <div>
            <strong>Materials Used:</strong>
            <p className="text-gray-700">{getMaterials(summaryData)}</p>
          </div>
          <div>
            <strong>Work Kind:</strong>
            <p className="text-gray-700">{getWorkKind(summaryData)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSummary;