import React from 'react'

const TopCardDashboard = ({ label, value, icon, iconSize = 32 }) => {
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
      <div className="flex items-center flex-grow text-white">
        <div
          className="p-2 rounded-full mr-3 flex items-center justify-center"
          style={{
            backgroundColor: "rgb(123, 179, 247)", // Slightly lighter background for the icon
            width: `${iconSize + 16}px`,
            height: `${iconSize + 16}px`,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for depth
          }}
        >
          {React.cloneElement(icon, { size: iconSize, color: "#fff" })}{" "}
          {/* White icon color */}
        </div>
        <h3 className="text-xl font-semibold flex-grow text-white">{label}</h3>
      </div>

      <div className="text-3xl font-bold ml-2 text-white">{value}</div>
    </div>
  )
}

export default TopCardDashboard