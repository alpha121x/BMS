import React from "react";

const TopCardCon = ({ inspectedCards }) => {
    const addCommas = (x) => {
        if (!x || x === "N/A") return "N/A";
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };

    return (
        <div className="mb-2">
            <div className="grid grid-cols-2 gap-4">
                {inspectedCards.map((card, index) => (
                    <div
                        key={index}
                        className="rounded-lg shadow-lg text-white transition-all duration-300 hover:shadow-xl p-5" // Increased padding
                        style={{
                            background: card.color,
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                        }}
                    >
                        <div className="flex flex-col items-start">
                            <h6 className="mb-2 font-bold text-white text-lg">{card.label}</h6>
                            <div className="text-3xl font-bold text-white">{addCommas(card.value)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopCardCon;