import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BASE_URL } from "./config";

// Modal Component
const DetailsModal = ({ isOpen, onClose, chartData, chartTitle }) => {
  if (!isOpen) return null;

  // Function to export data as CSV
  const exportToCSV = () => {
    const headers = ["Name", "Count"];
    const rows = chartData.map(item => [item.name, item.y]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${chartTitle.replace(/\s+/g, "_")}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "600px",
          maxWidth: "90%",
          maxHeight: "80%",
          overflowY: "auto",
        }}
      >
        <h2>{chartTitle}</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Count</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Color</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{item.y}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: item.color || "#999999",
                      display: "inline-block",
                      border: "1px solid #000",
                    }}
                  ></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            onClick={exportToCSV}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Export to CSV
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#005D7F",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Graph = () => {
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedChartData, setSelectedChartData] = useState([]);
  const [selectedChartTitle, setSelectedChartTitle] = useState("");

  // ------------------- Construction Types (Static) -------------------
  const constructionTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Construction Types" },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y}</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}",
        },
        point: {
          events: {
            click: function () {
              setSelectedChartData(this.series.data);
              setSelectedChartTitle(this.series.chart.title.textStr);
              setShowModal(true);
            },
          },
        },
      },
    },
    series: [
      {
        name: "Count",
        data: [
          { name: "Bricks Wall With Concrete Slab", y: 16247, color: "#6D68DE" },
          { name: "Stone Wall With Concrete Slab", y: 476, color: "#FFCE83" },
          { name: "Pipe Culvert", y: 565, color: "#84A3D5" },
          { name: "I-Girder", y: 346, color: "#19FB8B" },
          { name: "Box Culvert", y: 155, color: "#45C8FF" },
          { name: "Other", y: 315, color: "#45C8FF" },
        ],
      },
    ],
  };

  // ------------------- Group Construction Types (Static) -------------------
  const groupConstructionTypesOptions = {
    chart: { type: "pie" },
    title: { text: "Group Construction Types" },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y}</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}",
        },
        point: {
          events: {
            click: function () {
              setSelectedChartData(this.series.data);
              setSelectedChartTitle(this.series.chart.title.textStr);
              setShowModal(true);
            },
          },
        },
      },
    },
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
          name: item.structure_type,
          y: parseInt(item.count),
          color: colorMap[item.structure_type] || "#999999",
        }));

        setStructureTypesOptions({
          chart: { type: "pie" },
          title: { text: "Type of Structures" },
          tooltip: {
            pointFormat: "{series.name}: <b>{point.y}</b>",
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.name}: {point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedChartData(this.series.data);
                    setSelectedChartTitle(this.series.chart.title.textStr);
                    setShowModal(true);
                  },
                },
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

  // ------------------- Crossing Types (API) -------------------
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
          tooltip: {
            pointFormat: "{series.name}: <b>{point.y}</b>",
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.name}: {point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedChartData(this.series.data);
                    setSelectedChartTitle(this.series.chart.title.textStr);
                    setShowModal(true);
                  },
                },
              },
            },
          },
          series: [{ name: "Factor Value", data: formattedData }],
        });
      })
      .catch((error) => {
        console.error("Error fetching crossing types chart:", error);
      });
  }, []);

  // ------------------- Plan A Score Category (Static) -------------------
  const planAScoreOptions = {
    chart: { type: "pie" },
    title: { text: "Plan A Score Category wise Summary" },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y}</b>",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}",
        },
        point: {
          events: {
            click: function () {
              setSelectedChartData(this.series.data);
              setSelectedChartTitle(this.series.chart.title.textStr);
              setShowModal(true);
            },
          },
        },
      },
    },
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

  // ------------------- Bridge Damage Levels (API) -------------------
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
    fetch(`${BASE_URL}/api/damage-chart`)
      .then((res) => res.json())
      .then((data) => {
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
          plotOptions: {
            series: {
              stacking: "normal",
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedChartData(this.series.data);
                    setSelectedChartTitle(this.series.chart.title.textStr);
                    setShowModal(true);
                  },
                },
              },
            },
          },
          series: series,
        });
      })
      .catch((error) => {
        console.error("Error fetching bridge damage levels:", error);
      });
  }, []);

  // ------------------- Material Element-wise Damages (API) -------------------
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
    fetch(`${BASE_URL}/api/material-damage-chart`)
      .then((res) => res.json())
      .then((data) => {
        const { categories, series } = data;

        const formattedSeries = series.map((serie, serieIndex) => ({
          ...serie,
          data: serie.data.map((value, index) => ({
            y: value,
            name: `${serie.name} (${categories[index]})`,
          })),
        }));

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
          plotOptions: {
            series: {
              stacking: "normal",
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedChartData(this.series.data);
                    setSelectedChartTitle(this.series.chart.title.textStr);
                    setShowModal(true);
                  },
                },
              },
            },
          },
          series: formattedSeries,
        });
      })
      .catch((error) => {
        console.error("Error fetching material element damages:", error);
      });
  }, []);

  // ------------------- Element Category-wise Damages (API) -------------------
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
    fetch(`${BASE_URL}/api/workkind-damage-chart`)
      .then((res) => res.json())
      .then((data) => {
        const { categories, series } = data;

        const formattedSeries = series.map((serie, serieIndex) => ({
          ...serie,
          data: serie.data.map((value, index) => ({
            y: value,
            name: `${serie.name} (${categories[index]})`,
          })),
        }));

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
          plotOptions: {
            series: {
              stacking: "normal",
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedChartData(this.series.data);
                    setSelectedChartTitle(this.series.chart.title.textStr);
                    setShowModal(true);
                  },
                },
              },
            },
          },
          series: formattedSeries,
        });
      })
      .catch((error) => {
        console.error("Error fetching element category damages:", error);
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
    fetch(`${BASE_URL}/api/bridge-length-construction-types-inspected`)
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
          data: categories.map((range, index) => {
            const match = data.find(
              (d) => d.major_type === type && d.length_range === range
            );
            return {
              name: `${type} (${range})`,
              y: match ? match.count : 0,
              color: colorMap[type] || "#999999",
            };
          }),
        }));

        setBridgeLengthOptions({
          chart: { type: "bar", height: 400 },
          title: { text: "Bridge Length Of Structure M" },
          xAxis: { categories, title: { text: "Bridge Length" } },
          yAxis: { min: 0, title: { text: "Construction Types" } },
          legend: { reversed: false },
          plotOptions: {
            series: {
              stacking: "normal",
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedChartData(this.series.data);
                    setSelectedChartTitle(this.series.chart.title.textStr);
                    setShowModal(true);
                  },
                },
              },
            },
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

        {/* Modal */}
        <DetailsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          chartData={selectedChartData}
          chartTitle={selectedChartTitle}
        />
      </div>
    </div>
  );
};

export default Graph;