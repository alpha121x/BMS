import { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import { BASE_URL } from "./config";

const CostMap = ({ districtId }) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    // Load the required ArcGIS modules
    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/MapImageLayer",
        "esri/widgets/Legend",
        "esri/geometry/Extent",
      ],
      { css: true }
    )
      .then(([Map, MapView, MapImageLayer, Legend, Extent]) => {
        // Initialize the map
        const map = new Map({
          basemap: "gray-vector",
        });

        // Define a popup template for the cost layers
        const popupTemplate = {
          title: "Bridge Cost Details",
          content: ({ graphic }) => {
            const attributes = graphic.attributes;
            const images = [
              attributes.image_1,
              attributes.image_2,
              attributes.image_3,
              attributes.image_4,
              attributes.image_5,
            ].map((img, index) =>
              img
                ? `<img src="${img}" alt="Overview Image ${index + 1}" style="width: 18%; height: auto; object-fit: cover;">`
                : `<span>No image</span>`
            ).join(" ");

            return `
              <div style="margin-bottom: 20px;">
                <b>Bridge ID:</b> {uu_bms_id}<br/>
                <b>Cost (Millions):</b> <b>{cost_million}</b><br/>
                <b>Road Name:</b> {road_name}<br/>
                <b>District:</b> {district}<br/>
                <b>Structure Type:</b> {structure_type}<br/>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 10px;">
                ${images}
              </div>
            `;
          },
        };

        // Add the ArcGIS MapImageLayer for the cost data with sublayers
        const costLayer = new MapImageLayer({
          url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_Road_cost/MapServer",
          title: "BMS Cost",
          sublayers: [
            { id: 1, title: "Cost 1 - 3 (Millions)", popupTemplate: popupTemplate },
            { id: 2, title: "Cost 4 - 5 (Millions)", popupTemplate: popupTemplate },
            { id: 3, title: "Cost 6 - 8 (Millions)", popupTemplate: popupTemplate },
            { id: 4, title: "Cost 9 - 10 (Millions)", popupTemplate: popupTemplate },
          ],
        });

        // Add the division boundary layer
        const divisionBoundaryLayer = new MapImageLayer({
          url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_Road_cost/MapServer",
          title: "Punjab Division Boundary",
          sublayers: [
            { id: 5, title: "Division Layer" },
          ],
        });

        // Add the layers to the map
        map.add(costLayer);
        map.add(divisionBoundaryLayer);

        // Function to fetch district extent
        const getDistrictExtent = async (districtId) => {
          if (districtId === "%") {
            return new Extent({
              xmin: 69.0,
              ymin: 29.5,
              xmax: 77.0,
              ymax: 35.0,
              spatialReference: { wkid: 4326 },
            });
          } else {
            try {
              const response = await fetch(`${BASE_URL}/api/districtExtent?districtId=${districtId}`);
              const data = await response.json();

              if (data.success && data.district) {
                const { xmin, ymin, xmax, ymax } = data.district;
                return new Extent({
                  xmin: xmin,
                  ymin: ymin,
                  xmax: xmax,
                  ymax: ymax,
                  spatialReference: { wkid: 4326 },
                });
              } else {
                console.error("District not found");
                return null;
              }
            } catch (error) {
              console.error("Error fetching district extent:", error);
              return null;
            }
          }
        };

        // Initialize MapView and set extent
        const initializeView = async () => {
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [72.7097, 31.1704], // Fallback center
            zoom: 6, // Fallback zoom
          });

          viewRef.current = view;

          // Fetch and set district extent
          const extent = await getDistrictExtent(districtId);
          if (extent) {
            view.extent = extent;
          } else {
            // Fallback to default extent if API call fails
            view.extent = {
              xmin: 68.62067428141843,
              ymin: 29.931631969254486,
              xmax: 75.77809298695591,
              ymax: 34.22608319257698,
              spatialReference: { wkid: 4326 },
            };
          }

          // Add a click event to debug popup behavior
          view.on("click", (event) => {
            view.hitTest(event).then((response) => {
              const graphic = response.results.find((result) => result.graphic);
              if (graphic) {
                console.log("Clicked Graphic:", graphic.graphic.attributes);
              } else {
                console.log("No graphic found at click location");
              }
            });
          });

          // Add a small Legend widget for the cost layers
          const legend = new Legend({
            view: view,
            layerInfos: [
              {
                layer: costLayer,
                title: "BMS Cost (Millions)",
              },
            ],
            container: document.createElement("div"),
          });

          // Add the legend to the top-right corner
          view.ui.add(legend, "top-right");

          // Apply custom styles to make the legend small
          legend.container.style.maxWidth = "200px";
          legend.container.style.maxHeight = "150px";
          legend.container.style.overflow = "auto";
          legend.container.style.fontSize = "12px";

          await view.when();
          console.log("CostMap is ready.");
        };

        initializeView();

        // Cleanup on component unmount
        return () => {
          if (viewRef.current) {
            viewRef.current.destroy();
          }
        };
      })
      .catch((err) => {
        console.error("Error loading ArcGIS modules:", err);
      });
  }, [districtId]);

  return (
    <div
      className="map-container"
      ref={mapRef}
      style={{ height: "500px", width: "100%" }}
    />
  );
};

export default CostMap;