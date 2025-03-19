import React from "react";

const TopCardDashboard = ({ totalLabel, totalValue, color, items }) => {
    const addCommas = (x) => {
        if (!x) return "N/A";
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };

    return (
        <div
            className="rounded-1 shadow-lg text-white transition-all duration-300 hover:shadow-xl p-3"
            style={{
                background: color,
                border: "1px solid #ddd",
                borderRadius: "8px",
            }}
        >
            {/* Top Section - Total Count */}
            <div className="flex justify-between items-center border-b border-white pb-2 mb-2">
                <h6 className="mb-0 font-bold text-white text-lg">{totalLabel}</h6>
                <div className="text-3xl font-bold text-white">{addCommas(totalValue)}</div>
            </div>

            {/* Bottom Section - Three Counts */}
            <div className="grid grid-cols-3 gap-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center text-center p-2 rounded-md"
                        style={{
                            background: "rgba(255, 255, 255, 0.2)", // Semi-transparent background
                            borderRadius: "4px",
                        }}
                    >
                        {/*<div className="text-xl">{item.icon}</div>*/}
                        <h6 className="text-sm font-semibold">{item.label}</h6>
                        <div className="text-lg font-bold">{addCommas(item.value)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopCardDashboard;
