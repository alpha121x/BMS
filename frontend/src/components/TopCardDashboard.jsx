import React from 'react'

const TopCardDashboard = ({ label, value }) => {
  return (
    <div
      className="rounded-1 shadow-lg text-white transition-all duration-300 hover:shadow-xl p-2 flex justify-between items-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(59, 100, 246, 0.8), rgba(96, 165, 250, 1))", // Light blue gradient
        border: `2px solid #3B82F6`, // Blue border for contrast
        borderRadius: "9px", // Rounded corners
      }}
    >
      <h3 className="text-lg font-semibold text-white flex-grow">{label}</h3>
      <div className="text-2xl font-bold ml-2 text-white">{value}</div>
    </div>
  )
}

export default TopCardDashboard
