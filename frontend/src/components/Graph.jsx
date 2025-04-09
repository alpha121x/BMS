import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BASE_URL } from "../components/config";

const Graph = () => {
  // Previous pie chart configurations remain the same
  const constructionTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Construction Types" },
    series: [
      {
        name: "Count",
        data: [
          {
            name: "Bricks Wall With Concrete Slab",
            y: 16247,
            color: "#6D68DE",
          },
          { name: "Stone Wall With Concrete Slab", y: 476, color: "#FFCE83" },
          { name: "Pipe Culvert", y: 565, color: "#84A3D5" },
          { name: "I-Girder", y: 346, color: "#19FB8B" },
          { name: "Box Culvert", y: 155, color: "#45C8FF" },
          { name: "Other", y: 315, color: "#45C8FF" },
        ],
      },
    ],
  };

  const groupConstructionTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Group Construction Types" },
    series: [
      {
        name: "Count",
        data: [
          { name: "Concrete Deck Slab", y: 17086, color: "#47F9E3" },
          { name: "Culverts (box and pipe)", y: 752, color: "#FF645B" },
          { name: "Others", y: 51, color: "#60C3FE" },
          { name: "Concrete Box Girder", y: 2, color: "#FF4500" },
          { name: "Concretel-Girder", y: 458, color: "#EE81FF" },
          { name: "Arch Structure", y: 31, color: "#6B8ABC" },
          { name: "Not Available", y: 315, color: "#FF834E" },
        ],
      },
    ],
  };

  const [structureTypesOptions, setStructureTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Type of Structures" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/structure-counts`) // Replace with your actual API
      .then((res) => res.json())
      .then((data) => {
        const colorMap = {
          CULVERT: "#19FB8B",
          BRIDGE: "#6D68DE",
          UNDERPASS: "#FE8F67",
        };

        const formattedData = data.structureTypeCounts.map((item) => ({
          name: item.structure_type.charAt(0).toUpperCase() + item.structure_type.slice(1).toLowerCase(),
          y: parseInt(item.count),
          color: colorMap[item.structure_type] || "#999999", // fallback color
        }));

        setStructureTypesOptions({
          chart: { type: "pie" },
          title: { text: "Type of Structures" },
          series: [{ name: "Count", data: formattedData }],
        });
      })
      .catch((error) => {
        console.error("Error fetching structure types:", error);
      });
  }, []);

  const crossingTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Crossing Types" },
    series: [
      {
        name: "Factor value",
        data: [
          { name: "Water channel", y: 0.02, color: "#45C8FF" },
          { name: "Irrigation channel", y: 0.02, color: "#6D68DE" },
          { name: "River", y: 0.02, color: "#19FB8B" },
          { name: "Highway", y: 0.03, color: "#FF6347" },
          { name: "General road", y: 0.03, color: "#6B8ABC" },
          { name: "Train track", y: 0.03, color: "#D568FB" },
          { name: "Building", y: 0.25, color: "#47F9E3" },
          { name: "Other (Note)", y: 0.01, color: "#FF645B" },
        ],
      },
    ],
  };

  const planAScoreOptions = {
    chart: { type: "pie" },
    title: { text: "Plan A Score Category wise Summary" },
    series: [
      {
        name: "Count",
        data: [
          { name: "I: 1222", y: 1222, color: "#228B22" },
          { name: "II: 159", y: 159, color: "#FFD700" },
          { name: "III: 42", y: 42, color: "#FF4500" },
          { name: "IV: 11", y: 11, color: "#FF69B4" },
        ],
      },
    ],
  };

  const bridgeDamageLevelsOptions = {
    chart: {
      type: "bar",
      height: 800,
    },
    title: {
      text: "Bridges Damage Levels by Damage Kind",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: [
        "NON",
        "Corrosion",
        "Crack (Concrete)",
        "Looseness • Fall",
        "Fracture",
        "Deterioration of corrosion protection (paint)",
        "Crack (Steel)",
        "Spalling • Exposed re-bar",
        "Water leakage • Free lime",
        "Fall out",
        "Slab crack",
        "Poor concrete adhesion",
        "Gap defect",
        "Uneven road surface",
        "Pavement defect",
        "Bearing malfunction",
        "Other",
        "Fixing section defect",
        "Discoloration • Deterioration",
        "Leakage • Stagnant water",
        "Abnormal sound • Vibration",
        "Abnormal deflection",
        "Deformation • loss",
        "Clogged soil",
        "Settlement • Move • Incline",
        "Scouring",
      ],
      title: {
        text: "Damage Kind",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Damages",
      },
    },
    legend: {
      reversed: true,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Bridges Damage Level IV",
        data: [9, 5, 14, 55, 51, 0, 28, 149, 7, 122, 6, 14, 9, 10, 20, 4, 45, 2, 7, 6, 1, 12, 92, 56, 20, 19],
        color: "#FFFF00",
      },
      {
        name: "Bridges Damage Level III",
        data: [20, 8, 37, 87, 50, 6, 75, 276, 30, 126, 30, 28, 39, 33, 50, 5, 97, 10, 20, 13, 1, 5, 88, 136, 24, 22],
        color: "#808080",
      },
      {
        name: "Bridges Damage Level II",
        data: [90, 63, 189, 217, 121, 17, 215, 556, 255, 295, 45, 125, 155, 164, 192, 11, 298, 21, 152, 65, 5, 9, 208, 352, 45, 45],
        color: "#FFA500",
      },
      {
        name: "Bridges Damage Level I",
        data: [99, 23, 48, 69, 31, 5, 75, 142, 71, 104, 8, 30, 27, 32, 34, 1, 122, 6, 97, 15, 1, 0, 56, 55, 5, 12],
        color: "#0000FF",
      },
    ],
  };

  const materialElementDamagesOptions = {
    chart: {
      type: "bar",
      height: 800,
    },
    title: {
      text: "Material Element Damages",
      style: {
        fontSize: "16px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: [
        "Superstructure",
        "Concrete",
        "Other",
        "Substructure(Pier) - Steel",
        "Concrete",
        "Other",
        "Masonry/brick",
        "Substructure(Abutment) - Steel",
        "Concrete",
        "Other",
        "Masonry/brick",
        "Substructure(Foundation) - Concrete",
        "Other",
        "Bearing - Steel",
        "Concrete",
        "Other",
        "Rubber",
        "Road surface - Steel",
        "Concrete",
        "Rubber",
        "Asphalt",
        "Other",
        "Drainage system - Steel",
        "Vinyl chloride",
        "Other",
        "Attachment - Steel",
        "Vinyl chloride",
        "Other",
        "Wing wall - Concrete",
        "Other",
        "Box Culvert - Other",
      ],
      title: {
        text: "Elements",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Damages",
      },
    },
    legend: {
      reversed: true,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Bridges Damage Level I",
        data: [6, 263, 13, 0, 160, 149, 1, 5, 7, 10, 3, 2, 46, 164, 0],
        color: "#1E40AF", // Blue
      },
      {
        name: "Bridges Damage Level II",
        data: [87, 1087, 73, 5, 442, 601, 2, 16, 29, 13, 3, 0, 312, 817, 1],
        color: "#F59E0B", // Orange
      },
      {
        name: "Bridges Damage Level III",
        data: [5, 464, 21, 1, 153, 101, 0, 6, 11, 13, 0, 0, 106, 204, 0],
        color: "#6B7280", // Gray
      },
      {
        name: "Bridges Damage Level IV",
        data: [35, 236, 15, 0, 65, 53, 0, 20, 5, 7, 0, 0, 72, 166, 0],
        color: "#FFD700", // Yellow
      },
    ],
  };

  const elementCategoryDamagesOptions = {
    chart: {
      type: "bar",
      height: 400,
    },
    title: {
      text: "Element category wise damages",
    },
    xAxis: {
      categories: [
        "Superstructure",
        "Substructure(Pier)",
        "Substructure(Abutment)",
        "Substructure(Foundation)",
        "Bearing",
        "Road surface",
        "Drainage system",
        "Attachment",
        "Wing wall",
        "Box Culvert",
      ],
      title: {
        text: "Work Kind",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Category",
      },
      max: 3750,
    },
    legend: {
      reversed: true,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Number of Damages IV",
        data: [286, 128, 72, 27, 33, 414, 75, 9, 152, 0],
        color: "#FFFF00",
      },
      {
        name: "Number of Damages III",
        data: [490, 282, 189, 17, 24, 578, 248, 15, 196, 0],
        color: "#808080",
      },
      {
        name: "Number of Damages II",
        data: [1247, 1173, 752, 45, 71, 2091, 654, 76, 878, 1],
        color: "#FFA500",
      },
      {
        name: "Number of Damages I",
        data: [282, 331, 235, 12, 18, 389, 84, 27, 198, 0],
        color: "#0000FF",
      }
    ],
};

  const bridgeLengthOptions = {
    chart: {
      type: "bar",
      height: 400,
    },
    title: {
      text: "Bridge Length Of Structure M",
    },
    xAxis: {
      categories: ["L <= 6", "6m < L≤ 30m", "30m < L≤ 60m", "L < 60m"],
      title: {
        text: "Bridge Length",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Construction Types",
      },
      max: 19000,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    series: [
      {
        name: "Others",
        data: [43, 5, 1, 2],
        color: "#008000",
      },
      {
        name: "Steel Girder",
        data: [0, 5, 1, 4],
        color: "#0000FF",
      },
      {
        name: "Culverts (box and pipe)",
        data: [723, 26, 3, 0],
        color: "#FFA500",
      },
      {
        name: "Concrete I-Girder",
        data: [39, 271, 62, 86],
        color: "#FFFF00",
      },
      {
        name: "Concrete Deck Slab",
        data: [16330, 668, 52, 28],
        color: "#FF7F7F",
      },
      {
        name: "Concrete Box Girder",
        data: [0, 1, 0, 1],
        color: "#E6E6FA",
      },
      {
        name: "Arch Structure",
        data: [14, 12, 2, 3],
        color: "#808080",
      },
    ],
  };

  return (
    <div className="bg-white border-1 p-0 rounded-0 shadow-md" style={{border: "1px solid #005D7F"}}>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {/* Pie Charts (3 in First Row, 2 in Second Row) */}
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
      {/* First Row - 3 Charts */}
      <div style={{ width: "30%", height: "400px" }}>
        <HighchartsReact highcharts={Highcharts} options={planAScoreOptions} />
      </div>
      <div style={{ width: "30%", height: "400px" }}>
        <HighchartsReact highcharts={Highcharts} options={crossingTypesOptions} />
      </div>
      <div style={{ width: "30%", height: "400px" }}>
        <HighchartsReact highcharts={Highcharts} options={structureTypesOptions} />
      </div>

      {/* Second Row - 2 Charts */}
      <div style={{ width: "40%", height: "400px" }}>
        <HighchartsReact highcharts={Highcharts} options={groupConstructionTypesOptions} />
      </div>
      <div style={{ width: "40%", height: "400px" }}>
        <HighchartsReact highcharts={Highcharts} options={constructionTypesOptions} />
      </div>
    </div>

    {/* Bar Charts */}
    <div style={{ width: "90%", marginBottom: "40px" }}>
      <HighchartsReact highcharts={Highcharts} options={bridgeDamageLevelsOptions} />
    </div>

    <div style={{ width: "90%", marginBottom: "40px" }}>
      <HighchartsReact highcharts={Highcharts} options={materialElementDamagesOptions} />
    </div>
    <div style={{ width: "90%", marginBottom: "40px" }}>
      <HighchartsReact highcharts={Highcharts} options={elementCategoryDamagesOptions} />
    </div>
    <div style={{ width: "90%", marginBottom: "40px" }}>
      <HighchartsReact highcharts={Highcharts} options={bridgeLengthOptions} />
    </div>
  </div>
</div>

  );
};

export default Graph;
