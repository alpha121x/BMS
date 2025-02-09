import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Graph = () => {
  // Previous pie chart configurations remain the same
  const constructionTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Construction Types" },
    series: [
      {
        name: "Share",
        data: [
          { name: "Bricks Wall With Concrete Slab", y: 30, color: "#4B0082" },
          { name: "Stone Wall With Concrete Slab", y: 25, color: "#FF4500" },
          { name: "Pipe Culvert", y: 20, color: "#FFD700" },
          { name: "I-Girder", y: 15, color: "#008000" },
          { name: "Box Culvert", y: 10, color: "#0000FF" },
          { name: "Other", y: 5, color: "#A9A9A9" },
        ],
      },
    ],
  };

  const groupConstructionTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Group Construction Types" },
    series: [
      {
        name: "Share",
        data: [
          { name: "Concrete Deck Slab", y: 40, color: "#00CED1" },
          { name: "Culverts (box and pipe)", y: 30, color: "#FF69B4" },
          { name: "Others", y: 20, color: "#8A2BE2" },
          { name: "Not Available", y: 10, color: "#FF4500" },
        ],
      },
    ],
  };

  const structureTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Type of Structures" },
    series: [
      {
        name: "Share",
        data: [
          { name: "Underpass", y: 50, color: "#32CD32" },
          { name: "Bridge", y: 30, color: "#8A2BE2" },
          { name: "Other", y: 20, color: "#FF4500" },
        ],
      },
    ],
  };

  const crossingTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Crossing Types" },
    series: [
      {
        name: "Share",
        data: [
          { name: "River", y: 25, color: "#00BFFF" },
          { name: "Highway", y: 20, color: "#FF6347" },
          { name: "General road", y: 15, color: "#FFD700" },
          { name: "Train track", y: 10, color: "#8A2BE2" },
          { name: "Building", y: 30, color: "#32CD32" },
        ],
      },
    ],
  };

  const planAScoreOptions = {
    chart: { type: "pie" },
    title: { text: "Plan A Score Category wise Summary" },
    series: [
      {
        name: "Score",
        data: [
          { name: "I: 1222", y: 60, color: "#228B22" },
          { name: "II: 159", y: 20, color: "#FFD700" },
          { name: "III: 42", y: 10, color: "#FF4500" },
          { name: "IV: 11", y: 10, color: "#FF69B4" },
        ],
      },
    ],
  };

  // New bar chart configurations
  const materialElementDamagesOptions = {
    chart: {
      type: "bar",
      height: 800
    },
    title: {
      text: "Material Element Damages",
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: [
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
        "Box Culvert - Other"
      ],
      title: {
        text: "Elements"
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Damages"
      }
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: "normal"
      }
    },
    series: [
      {
        name: "Number of Damages I",
        data: [100, 1800, 200, 300, 400, 150, 400, 200, 100, 100, 400, 50, 50, 20, 30, 20, 10, 200, 800, 100, 400, 200, 10, 10, 400, 50, 10, 20],
        color: "#0000FF"
      },
      {
        name: "Number of Damages II",
        data: [50, 1200, 100, 200, 600, 100, 600, 150, 50, 50, 500, 30, 30, 10, 20, 10, 5, 150, 1000, 50, 500, 300, 5, 5, 600, 30, 5, 10],
        color: "#FFA500"
      },
      {
        name: "Number of Damages III",
        data: [30, 200, 50, 100, 100, 50, 100, 50, 30, 30, 100, 20, 20, 5, 10, 5, 3, 100, 200, 30, 100, 100, 3, 3, 200, 20, 3, 5],
        color: "#808080"
      },
      {
        name: "Number of Damages IV",
        data: [20, 100, 30, 50, 50, 30, 50, 30, 20, 20, 50, 10, 10, 3, 5, 3, 2, 50, 100, 20, 50, 50, 2, 2, 100, 10, 2, 3],
        color: "#FFFF00"
      }
    ]
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
        name: "Number of Damages I",
        data: [500, 400, 300, 50, 50, 800, 100, 50, 200, 0],
        color: "#0000FF",
      },
      {
        name: "Number of Damages II",
        data: [1200, 800, 600, 30, 30, 1500, 150, 30, 500, 0],
        color: "#FFA500",
      },
      {
        name: "Number of Damages III",
        data: [400, 300, 200, 20, 20, 500, 50, 20, 150, 0],
        color: "#808080",
      },
      {
        name: "Number of Damages IV",
        data: [200, 150, 100, 10, 10, 250, 25, 10, 75, 0],
        color: "#FFFF00",
      },
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
        data: [100, 50, 10, 5],
        color: "#008000",
      },
      {
        name: "Steel Girder",
        data: [50, 30, 5, 3],
        color: "#0000FF",
      },
      {
        name: "Culverts (box and pipe)",
        data: [200, 100, 20, 10],
        color: "#FFA500",
      },
      {
        name: "Concrete I-Girder",
        data: [100, 50, 10, 5],
        color: "#FFFF00",
      },
      {
        name: "Concrete Deck Slab",
        data: [18000, 1500, 100, 50],
        color: "#FF69B4",
      },
      {
        name: "Concrete Box Girder",
        data: [50, 30, 5, 3],
        color: "#E6E6FA",
      },
      {
        name: "Arch Structure",
        data: [30, 20, 3, 2],
        color: "#808080",
      },
    ],
  };

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Pie Charts */}
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={planAScoreOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={crossingTypesOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={structureTypesOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={groupConstructionTypesOptions}
          />
        </div>
        <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={constructionTypesOptions}
          />
        </div>

        {/* Bar Charts */}
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={materialElementDamagesOptions}
          />
        </div>
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={elementCategoryDamagesOptions}
          />
        </div>
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={bridgeLengthOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default Graph;
