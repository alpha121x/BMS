import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BASE_URL } from "./config";

const Graph = () => {
  // ------------------- Construction Types (Static) -------------------
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

  // ------------------- Structure Types (API) -------------------
  const [structureTypesOptions, setStructureTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Type of Structures" },
    series: [{ name: "Count", data: [] }],
  });

useEffect(() => {
  fetch(`${BASE_URL}/api/structure-counts`)
    .then((res) => res.json())
    .then((data) => {
      const colorMap = {
        CULVERT: "#19FB8B",
        BRIDGE: "#6D68DE",
        UNDERPASS: "#FE8F67",
      };

      const formattedData = data.structureTypeCounts.map((item) => ({
        name: item.structure_type, // ✅ show as it is
        y: parseInt(item.count),
        color: colorMap[item.structure_type] || "#999999",
      }));

      setStructureTypesOptions({
        chart: { type: "pie" },
        title: { text: "Type of Structures" },
        series: [{ name: "Count", data: formattedData }],
      });
    })
    .catch((error) =>
      console.error("Error fetching structure types:", error)
    );
}, []);


  // ------------------- Crossing Types (API) -------------------
  const [crossingTypesOptions, setCrossingTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Under Bridge Situation" },
    series: [{ name: "Factor Value", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/crossing-types-chart`)
      .then((res) => res.json())
      .then((data) => {
        const colorPalette = [
          "#45C8FF",
          "#6D68DE",
          "#19FB8B",
          "#FF6347",
          "#6B8ABC",
          "#D568FB",
          "#47F9E3",
          "#FF645B",
          "#FFD700",
          "#ADFF2F",
        ];

        const formattedData = data.map((item, index) => ({
          name: item.name,
          y: parseFloat(item.y),
          color: colorPalette[index % colorPalette.length],
        }));

        setCrossingTypesOptions({
          chart: { type: "pie" },
          title: { text: "Under Bridge Situation" },
          series: [{ name: "Factor Value", data: formattedData }],
        });
      })
      .catch((error) =>
        console.error("Error fetching crossing types chart:", error)
      );
  }, []);

  // ------------------- Road Classifications (API) -------------------
  const [roadClassificationOptions, setRoadClassificationOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Road Type Structures" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/road-types-structures`)
      .then((res) => res.json())
      .then((data) => {
        const colorPalette = [
          "#FF5733",
          "#33FF57",
          "#3357FF",
          "#FF33A8",
          "#FFD733",
          "#33FFF0",
          "#8E44AD",
          "#F39C12",
        ];

        const formattedData = data.map((item, index) => ({
          name: item.name,
          y: parseInt(item.y),
          color: colorPalette[index % colorPalette.length],
        }));

        setRoadClassificationOptions({
          chart: { type: "pie" },
          title: { text: "Road Type Structures" },
          series: [{ name: "Count", data: formattedData }],
        });
      })
      .catch((error) =>
        console.error("Error fetching road classifications:", error)
      );
  }, []);

  // ------------------- Bridge Length (Static) -------------------
  const bridgeLengthOptions = {
    chart: { type: "bar", height: 400 },
    title: { text: "Bridge Length Of Structure M" },
    xAxis: {
      categories: ["L <= 6", "6m < L≤ 30m", "30m < L≤ 60m", "L < 60m"],
      title: { text: "Bridge Length" },
    },
    yAxis: {
      min: 0,
      max: 19000,
      title: { text: "Construction Types" },
    },
    plotOptions: { series: { stacking: "normal" } },
    series: [
      { name: "Others", data: [43, 5, 1, 2], color: "#008000" },
      { name: "Steel Girder", data: [0, 5, 1, 4], color: "#0000FF" },
      {
        name: "Culverts (box and pipe)",
        data: [723, 26, 3, 0],
        color: "#FFA500",
      },
      { name: "Concrete I-Girder", data: [39, 271, 62, 86], color: "#FFFF00" },
      {
        name: "Concrete Deck Slab",
        data: [16330, 668, 52, 28],
        color: "#FF7F7F",
      },
      { name: "Concrete Box Girder", data: [0, 1, 0, 1], color: "#E6E6FA" },
      { name: "Arch Structure", data: [14, 12, 2, 3], color: "#808080" },
    ],
  };

  // ------------------- Span Length Distribution (API) -------------------
  const [spanLengthOptions, setSpanLengthOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Span Length Distribution" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/span-length-structures`)
      .then((res) => res.json())
      .then((data) => {
        setSpanLengthOptions((prev) => ({
          ...prev,
          series: [{ name: "Count", data }],
        }));
      })
      .catch(console.error);
  }, []);

// ------------------- Bridge Ages (Vertical Column Chart) -------------------
const [bridgeAgesOptions, setBridgeAgesOptions] = useState({
  chart: { type: "column" }, // vertical bars
  title: { text: "Bridge Ages" },
  xAxis: {
    categories: [],
    title: { text: "Age Groups" }
  },
  yAxis: {
    min: 0,
    title: { text: "Number of Bridges" }
  },
  series: [{ name: "Count", data: [] }],
});

useEffect(() => {
  fetch(`${BASE_URL}/api/bridge-ages`)
    .then((res) => res.json())
    .then((data) => {
      setBridgeAgesOptions((prev) => ({
        ...prev,
        xAxis: {
          ...prev.xAxis,
          categories: data.map(item => item.name), // Age group names
        },
        series: [{
          name: "Count",
          data: data.map(item => item.y), // Counts only
        }],
      }));
    })
    .catch(console.error);
}, []);

// ------------------- Bridge Inspection & Evaluation Status (API) -------------------
const [bridgeStatusOptions, setBridgeStatusOptions] = useState({
  chart: { type: "pie" },
  title: { text: "Stuructures Status" },
  series: [{ name: "Count", data: [] }],
});

useEffect(() => {
  fetch(`${BASE_URL}/api/bridge-status`)
    .then((res) => res.json())
    .then((data) => {
      setBridgeStatusOptions((prev) => ({
        ...prev,
        series: [{ name: "Count", data }]
      }));
    })
    .catch(console.error);
}, []);



  return (
    <div
      className="bg-white border-1 p-0 rounded-0 shadow-md"
      style={{ border: "1px solid #005D7F" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Pie Charts */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              flex: "1 1 calc(33.33% - 20px)",
              minWidth: "280px",
              height: "400px",
            }}
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={structureTypesOptions}
            />
          </div>

          <div
            style={{
              flex: "1 1 calc(33.33% - 20px)",
              minWidth: "280px",
              height: "400px",
            }}
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={constructionTypesOptions}
            />
          </div>

          <div
            style={{
              flex: "1 1 calc(33.33% - 20px)",
              minWidth: "280px",
              height: "400px",
            }}
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={crossingTypesOptions}
            />
          </div>

          <div
            style={{
              flex: "1 1 calc(33.33% - 20px)",
              minWidth: "280px",
              height: "400px",
            }}
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={roadClassificationOptions}
            />
          </div>

          <div
            style={{
              flex: "1 1 calc(33.33% - 20px)",
              minWidth: "280px",
              height: "400px",
            }}
          >
            <HighchartsReact
              highcharts={Highcharts}
              options={spanLengthOptions}
            />
          </div>
        </div>

        {/* Bridge Inspection & Evaluation Status Pie Chart */}
        <div
        style={{
          flex: "1 1 calc(33.33% - 20px)",
          minWidth: "280px",
          height: "400px",
          }}
        >
          <HighchartsReact
          highcharts={Highcharts}
          options={bridgeStatusOptions}
          />
        </div>

        {/* Bar Chart */}
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={bridgeLengthOptions}
          />
        </div>

        {/* Bridge Ages Bar Chart */}
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
          highcharts={Highcharts}
          options={bridgeAgesOptions}
          />
          </div>
      </div>
    </div>
  );
};

export default Graph;
