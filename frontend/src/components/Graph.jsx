import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Graph = () => {
  // Chart 1: Construction Types
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

  // Chart 2: Group Construction Types
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

  // Chart 3: Type of Structures
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

  // Chart 4: Crossing Types
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

  // Chart 5: Plan A Score Category wise Summary
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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
        <HighchartsReact highcharts={Highcharts} options={planAScoreOptions} />
      </div>
      <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
        <HighchartsReact highcharts={Highcharts} options={constructionTypesOptions} />
      </div>
      <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
        <HighchartsReact highcharts={Highcharts} options={groupConstructionTypesOptions} />
      </div>
      <div style={{ width: "80%", height: "500px", marginBottom: "20px" }}>
        <HighchartsReact highcharts={Highcharts} options={structureTypesOptions} />
      </div>
      <div style={{ width: "80%", height: "500px" }}>
        <HighchartsReact highcharts={Highcharts} options={crossingTypesOptions} />
      </div>
    </div>
  );
};

export default Graph;
