import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BASE_URL } from "./config";

// Modal Component
const DetailsModal = ({ isOpen, onClose, structureName }) => {
  if (!isOpen) return null;

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
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h2>Structure Details</h2>
        <p><strong>Name:</strong> {structureName}</p>
        {/* Add more details here if fetched from API */}
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
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
  );
};

const Graph = () => {
  // State for modal and selected structure
  const [showModal, setShowModal] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null);

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
              setSelectedStructure(this.name);
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
                    setSelectedStructure(this.name);
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
                    setSelectedStructure(this.name);
                    setShowModal(true);
                  },
                },
              },
            },
          },
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
                    setSelectedStructure(this.name);
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
        console.error("Error fetching road classifications:", error)
      );
  }, []);

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
                    setSelectedStructure(this.name);
                    setShowModal(true);
                  },
                },
              },
            },
          },
          series: [{ name: "Count", data }],
        }));
      })
      .catch(console.error);
  }, []);

  // ------------------- Bridge Ages (Vertical Column Chart) -------------------
  const [bridgeAgesOptions, setBridgeAgesOptions] = useState({
    chart: { type: "column" },
    title: { text: "Bridge Ages" },
    xAxis: {
      categories: [],
      title: { text: "Age Groups" },
    },
    yAxis: {
      min: 0,
      title: { text: "Number of Bridges" },
    },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/bridge-ages`)
      .then((res) => res.json())
      .then((data) => {
        setBridgeAgesOptions((prev) => ({
          ...prev,
          tooltip: {
            pointFormat: "{series.name}: <b>{point.y}</b>",
          },
          xAxis: {
            ...prev.xAxis,
            categories: data.map((item) => item.name),
          },
          series: [
            {
              name: "Count",
              data: data.map((item) => item.y),
            },
          ],
          plotOptions: {
            column: {
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                format: "{point.y}",
              },
              point: {
                events: {
                  click: function () {
                    setSelectedStructure(this.category);
                    setShowModal(true);
                  },
                },
              },
            },
          },
        }));
      })
      .catch(console.error);
  }, []);

  // ------------------- Bridge Inspection & Evaluation Status (API) -------------------
  const [bridgeStatusOptions, setBridgeStatusOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Structures Status" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/bridge-status`)
      .then((res) => res.json())
      .then((data) => {
        setBridgeStatusOptions((prev) => ({
          ...prev,
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
                    setSelectedStructure(this.name);
                    setShowModal(true);
                  },
                },
              },
            },
          },
          series: [{ name: "Count", data }],
        }));
      })
      .catch(console.error);
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
    fetch(`${BASE_URL}/api/bridge-length-construction-types`)
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
          point: {
            events: {
              click: function () {
                const category = categories[this.index];
                setSelectedStructure(`${this.series.name} (${category})`);
                setShowModal(true);
              },
            },
          },
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
        <div style={{ width: "90%", marginBottom: "40px" }}>
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

      {/* Modal */}
      <DetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        structureName={selectedStructure}
      />
    </div>
  );
};

export default Graph;