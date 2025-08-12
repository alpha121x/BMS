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

  const [crossingTypesOptions, setCrossingTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Crossing Types" },
    series: [{ name: "Factor Value", data: [] }],
  });
  
  useEffect(() => {
    fetch(`${BASE_URL}/api/crossing-types-chart`)
      .then((res) => res.json())
      .then((data) => {
        const colorPalette = [
          "#45C8FF", "#6D68DE", "#19FB8B", "#FF6347",
          "#6B8ABC", "#D568FB", "#47F9E3", "#FF645B",
          "#FFD700", "#ADFF2F",
        ];
  
        const formattedData = data.map((item, index) => ({
          name: item.name,
          y: parseFloat(item.y),
          color: colorPalette[index % colorPalette.length],
        }));
  
        setCrossingTypesOptions({
          chart: { type: "pie" },
          title: { text: "Crossing Types" },
          series: [{ name: "Factor Value", data: formattedData }],
        });
      })
      .catch((error) => {
        console.error("Error fetching crossing types chart:", error);
      });
  }, []);
  

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

  const [bridgeDamageLevelsOptions, setBridgeDamageLevelsOptions] = useState({
    chart: { type: "bar", height: 800 },
    title: { text: "Bridges Damage Levels by Damage Kind", style: { fontSize: "16px", fontWeight: "bold" } },
    xAxis: { categories: [], title: { text: "Damage Kind" } },
    yAxis: { min: 0, title: { text: "Number of Damages" } },
    legend: { reversed: true },
    plotOptions: { series: { stacking: "normal" } },
    series: [],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/damage-chart`) // Replace with your actual API
      .then((res) => res.json())
      .then((data) => {
        // destructure API response
        const { categories, series } = data;

        setBridgeDamageLevelsOptions({
          chart: { type: "bar", height: 800 },
          title: { text: "Bridges Damage Levels by Damage Kind", style: { fontSize: "16px", fontWeight: "bold" } },
          xAxis: {
            categories: categories,
            title: { text: "Damage Kind" },
          },
          yAxis: {
            min: 0,
            title: { text: "Number of Damages" },
          },
          legend: { reversed: true },
          plotOptions: { series: { stacking: "normal" } },
          series: series,
        });
      })
      .catch((error) => {
        console.error("Error fetching bridge damage levels:", error);
      });
  }, []);

  const [materialElementDamagesOptions, setMaterialElementDamagesOptions] = useState({
    chart: { type: "bar", height: 800 },
    title: { text: "Material Element-wise Damages", style: { fontSize: "16px", fontWeight: "bold" } },
    xAxis: { categories: [], title: { text: "Elements" } },
    yAxis: { min: 0, title: { text: "Number of Damages" } },
    legend: { reversed: true },
    plotOptions: { series: { stacking: "normal" } },
    series: [],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/material-damage-chart`) // Replace with your actual API
      .then((res) => res.json())
      .then((data) => {
        // destructure API response
        const { categories, series } = data;

        setMaterialElementDamagesOptions({
          chart: { type: "bar", height: 800 },
          title: { text: "Material Element-wise Damages", style: { fontSize: "16px", fontWeight: "bold" } },
          xAxis: {
            categories: categories,
            title: { text: "Elements" },
          },
          yAxis: {
            min: 0,
            title: { text: "Number of Damages" },
          },
          legend: { reversed: true },
          plotOptions: { series: { stacking: "normal" } },
          series: series,
        });
      })
      .catch((error) => {
        console.error("Error fetching bridge damage levels:", error);
      });
  }, []);

  const [elementCategoryDamagesOptions, setElementCategoryDamagesOptions] = useState({
    chart: { type: "bar", height: 800 },
    title: { text: "Element Category-wise Damages", style: { fontSize: "16px", fontWeight: "bold" } },
    xAxis: { categories: [], title: { text: "Work Kind" } },
    yAxis: { min: 0, title: { text: "Number of Damages" } },
    legend: { reversed: true },
    plotOptions: { series: { stacking: "normal" } },
    series: [],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/workkind-damage-chart`) // Replace with your actual API
      .then((res) => res.json())
      .then((data) => {
        // destructure API response
        const { categories, series } = data;

        setElementCategoryDamagesOptions({
          chart: { type: "bar", height: 800 },
          title: { text: "Element Category-wise Damages", style: { fontSize: "16px", fontWeight: "bold" } },
          xAxis: {
            categories: categories,
            title: { text: "Work Kind" },
          },
          yAxis: {
            min: 0,
            title: { text: "Number of Damages" },
          },
          legend: { reversed: true },
          plotOptions: { series: { stacking: "normal" } },
          series: series,
        });
      })
      .catch((error) => {
        console.error("Error fetching bridge damage levels:", error);
      });
  }, []);

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
      {/* <div style={{ width: "30%", height: "400px" }}>
        <HighchartsReact highcharts={Highcharts} options={planAScoreOptions} />
      </div> */}
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
