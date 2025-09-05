import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BASE_URL } from "./config";

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

  // ------------------- Structure Types (API) -------------------
  const [structureTypesOptions, setStructureTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Type of Structures" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/structure-counts-inspected`)
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
          tooltip: {
            pointFormat: "{series.name}: <b>{point.y}</b>", // still shows on hover
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.name}: {point.y}", // 👈 show name + count on chart
              },
            },
          },
          series: [{ name: "Count", data: formattedData }],
        });
      })
      .catch((error) =>
        console.error("Error fetching structure types:", error)
      );
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
    title: {
      text: "Bridges Damage Levels by Damage Kind",
      style: { fontSize: "16px", fontWeight: "bold" },
    },
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
          title: {
            text: "Bridges Damage Levels by Damage Kind",
            style: { fontSize: "16px", fontWeight: "bold" },
          },
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

  const [materialElementDamagesOptions, setMaterialElementDamagesOptions] =
    useState({
      chart: { type: "bar", height: 800 },
      title: {
        text: "Material Element-wise Damages",
        style: { fontSize: "16px", fontWeight: "bold" },
      },
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
          title: {
            text: "Material Element-wise Damages",
            style: { fontSize: "16px", fontWeight: "bold" },
          },
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

  const [elementCategoryDamagesOptions, setElementCategoryDamagesOptions] =
    useState({
      chart: { type: "bar", height: 800 },
      title: {
        text: "Element Category-wise Damages",
        style: { fontSize: "16px", fontWeight: "bold" },
      },
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
          title: {
            text: "Element Category-wise Damages",
            style: { fontSize: "16px", fontWeight: "bold" },
          },
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

  // -------------------- Bridge Length / CONSTRUCTION TYPES (Bar Chart) -------------------- //
  const [bridgeLengthOptions, setBridgeLengthOptions] = useState({
    chart: { type: "bar", height: 400 },
    title: { text: "Bridge Length Of Structure M" },
    xAxis: { categories: [], title: { text: "Bridge Length" } },
    yAxis: { min: 0, title: { text: "Construction Types" } },
    legend: { reversed: false },
    plotOptions: { series: { stacking: "normal" } },
    series: [],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/bridge-length-construction-types-inspected`) // Replace with your actual API
      .then((res) => res.json())
      .then((data) => {
        const categories = [
          "Less than 6 m",
          "6 to 10 m",
          "10 to 15 m",
          "15 to 20 m",
          "20 to 35 m",
          "Greater than 35 m",
        ];

        const constructionTypes = [
          ...new Set(data.map((item) => item.major_type)),
        ];

        const colorMap = {
          Others: "#008000",
          "Steel Girder": "#0000FF",
          "Culverts (box and pipe)": "#FFA500",
          "Concrete I-Girder": "#FFFF00",
          "Concrete Deck Slab": "#FF7F7F",
          "Concrete Box Girder": "#E6E6FA",
          "Arch Structure": "#808080",
        };

        const series = constructionTypes.map((type) => ({
          name: type,
          data: categories.map((range) => {
            const match = data.find(
              (d) => d.major_type === type && d.length_range === range
            );
            return match ? match.count : 0;
          }),
          color: colorMap[type] || "#999999",
        }));

        setBridgeLengthOptions({
          chart: { type: "bar", height: 400 },
          title: { text: "Bridge Length Of Structure M" },
          xAxis: { categories, title: { text: "Bridge Length" } },
          yAxis: { min: 0, title: { text: "Construction Types" } },
          legend: { reversed: false },
          plotOptions: {
            series: { stacking: "normal" },
          },
          series,
        });
      });
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
        {/* Pie Charts (3 in First Row, 2 in Second Row) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {/* First Row - 3 Charts */}
          <div style={{ width: "30%", height: "400px" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={planAScoreOptions}
            />
          </div>
          <div style={{ width: "30%", height: "400px" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={crossingTypesOptions}
            />
          </div>
          <div style={{ width: "30%", height: "400px" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={structureTypesOptions}
            />
          </div>

          {/* Second Row - 2 Charts */}
          <div style={{ width: "40%", height: "400px" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={groupConstructionTypesOptions}
            />
          </div>
          <div style={{ width: "40%", height: "400px" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={constructionTypesOptions}
            />
          </div>
        </div>

        {/* Bar Charts */}
        <div style={{ width: "90%", marginBottom: "40px" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={bridgeDamageLevelsOptions}
          />
        </div>

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
