import { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { BASE_URL } from "./config";
import { saveAs } from "file-saver"; // npm install file-saver

// helper to export data
const exportCSV = (rows, filename = "chart-data.csv") => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]).join(",");
  const csvRows = rows.map((row) =>
    Object.values(row)
      .map((v) => `"${v}"`)
      .join(",")
  );
  const csv = [headers, ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

// Modal Component
const DataModal = ({ isOpen, onClose, data, title }) => {
  if (!isOpen || !data || data.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>{title} Data</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "10px",
          }}
        >
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  style={{
                    border: "1px solid #ccc",
                    padding: "6px",
                    background: "#f0f0f0",
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td
                    key={i}
                    style={{ border: "1px solid #ccc", padding: "6px" }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={() => exportCSV(data, `${title.replace(/\s+/g, "_")}.csv`)}
            style={{
              background: "#005D7F",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#999",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "5px",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  // ------------------- helper: open modal on chart click -------------------
  const withClickHandler = (options, data, title) => ({
    ...options,
    plotOptions: {
      ...options.plotOptions,
      series: {
        ...options.plotOptions?.series,
        cursor: "pointer",
        point: {
          events: {
            click: () => {
              setModalData(data);
              setModalTitle(title);
              setModalOpen(true);
            },
          },
        },
      },
    },
  });

  // ------------------- Construction Types (Static) -------------------
  const staticConstructionData = [
    { name: "Bricks Wall With Concrete Slab", y: 16247 },
    { name: "Stone Wall With Concrete Slab", y: 476 },
    { name: "Pipe Culvert", y: 565 },
    { name: "I-Girder", y: 346 },
    { name: "Box Culvert", y: 155 },
    { name: "Other", y: 315 },
  ];
  const constructionTypesOptions = withClickHandler(
    {
      chart: { type: "pie" },
      title: { text: "Construction Types" },
      series: [{ name: "Count", data: staticConstructionData }],
    },
    staticConstructionData,
    "Construction Types"
  );

  // ------------------- Structure Types (API) -------------------
  const [structureTypesData, setStructureTypesData] = useState([]);
  const [structureTypesOptions, setStructureTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Type of Structures" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/structure-counts`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.structureTypeCounts.map((item) => ({
          name: item.structure_type,
          y: parseInt(item.count),
        }));
        setStructureTypesData(formattedData);
        setStructureTypesOptions(
          withClickHandler(
            {
              chart: { type: "pie" },
              title: { text: "Type of Structures" },
              series: [{ name: "Count", data: formattedData }],
            },
            formattedData,
            "Type of Structures"
          )
        );
      });
  }, []);

  // ------------------- Crossing Types (API) -------------------
  const [crossingTypesData, setCrossingTypesData] = useState([]);
  const [crossingTypesOptions, setCrossingTypesOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Under Bridge Situation" },
    series: [{ name: "Factor Value", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/crossing-types-chart`)
      .then((res) => res.json())
      .then((data) => {
        setCrossingTypesData(data);
        setCrossingTypesOptions(
          withClickHandler(
            {
              chart: { type: "pie" },
              title: { text: "Under Bridge Situation" },
              series: [{ name: "Factor Value", data }],
            },
            data,
            "Under Bridge Situation"
          )
        );
      });
  }, []);

  // ------------------- Road Classifications (API) -------------------
  const [roadClassificationData, setRoadClassificationData] = useState([]);
  const [roadClassificationOptions, setRoadClassificationOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Road Type Structures" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/road-types-structures`)
      .then((res) => res.json())
      .then((data) => {
        setRoadClassificationData(data);
        setRoadClassificationOptions(
          withClickHandler(
            {
              chart: { type: "pie" },
              title: { text: "Road Type Structures" },
              series: [{ name: "Count", data }],
            },
            data,
            "Road Type Structures"
          )
        );
      });
  }, []);

  // ------------------- Span Length Distribution (API) -------------------
  const [spanLengthData, setSpanLengthData] = useState([]);
  const [spanLengthOptions, setSpanLengthOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Span Length Distribution" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/span-length-structures`)
      .then((res) => res.json())
      .then((data) => {
        setSpanLengthData(data);
        setSpanLengthOptions(
          withClickHandler(
            {
              chart: { type: "pie" },
              title: { text: "Span Length Distribution" },
              series: [{ name: "Count", data }],
            },
            data,
            "Span Length Distribution"
          )
        );
      });
  }, []);

  // ------------------- Bridge Ages (Column) -------------------
  const [bridgeAgesData, setBridgeAgesData] = useState([]);
  const [bridgeAgesOptions, setBridgeAgesOptions] = useState({
    chart: { type: "column" },
    title: { text: "Bridge Ages" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/bridge-ages`)
      .then((res) => res.json())
      .then((data) => {
        setBridgeAgesData(data);
        setBridgeAgesOptions(
          withClickHandler(
            {
              chart: { type: "column" },
              title: { text: "Bridge Ages" },
              xAxis: { categories: data.map((d) => d.name) },
              series: [{ name: "Count", data: data.map((d) => d.y) }],
            },
            data,
            "Bridge Ages"
          )
        );
      });
  }, []);

  // ------------------- Bridge Status (API) -------------------
  const [bridgeStatusData, setBridgeStatusData] = useState([]);
  const [bridgeStatusOptions, setBridgeStatusOptions] = useState({
    chart: { type: "pie" },
    title: { text: "Structures Status" },
    series: [{ name: "Count", data: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/bridge-status`)
      .then((res) => res.json())
      .then((data) => {
        setBridgeStatusData(data);
        setBridgeStatusOptions(
          withClickHandler(
            {
              chart: { type: "pie" },
              title: { text: "Structures Status" },
              series: [{ name: "Count", data }],
            },
            data,
            "Structures Status"
          )
        );
      });
  }, []);

  // ------------------- Bridge Length by Construction Types (Bar) -------------------
  const [bridgeLengthData, setBridgeLengthData] = useState([]);
  const [bridgeLengthOptions, setBridgeLengthOptions] = useState({
    chart: { type: "bar", height: 400 },
    title: { text: "Bridge Length Of Structure M" },
    series: [],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/api/bridge-length-construction-types`)
      .then((res) => res.json())
      .then((data) => {
        setBridgeLengthData(data);
        const categories = [
          "Less than 6 m",
          "6 to 10 m",
          "10 to 15 m",
          "15 to 20 m",
          "20 to 35 m",
          "Greater than 35 m",
        ];
        const types = [...new Set(data.map((d) => d.major_type))];
        const series = types.map((type) => ({
          name: type,
          data: categories.map((range) => {
            const match = data.find(
              (d) => d.major_type === type && d.length_range === range
            );
            return match ? match.count : 0;
          }),
        }));
        setBridgeLengthOptions(
          withClickHandler(
            {
              chart: { type: "bar", height: 400 },
              title: { text: "Bridge Length Of Structure M" },
              xAxis: { categories },
              series,
            },
            data,
            "Bridge Length Of Structure M"
          )
        );
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
      <DataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle}
      />
    </div>
  );
};

export default Graph;
