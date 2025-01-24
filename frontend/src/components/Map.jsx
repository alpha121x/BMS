import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import "bootstrap/dist/css/bootstrap.min.css";

const Map = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, LayerList] = await loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/MapImageLayer",
            "esri/widgets/LayerList",
          ],
          { css: true }
        );

        // Initialize Map
        const map = new Map({
          basemap: "gray-vector",
        });

        // Initialize MapView
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [73.1587, 31.5204], // Example center coordinates
          zoom: 6,
        });

        viewRef.current = view;

        // Add Road Layer with outFields and PopupTemplate
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS Roads",
          opacity: 0.8,
          sublayers: [
            {
              id: 0, // Assuming the roads layer is at sublayer 0
              title: "Roads",
              popupTemplate: {
                content: `
                  <table class="table">
                    <thead>
                      <tr>
                        <th colspan="2" class="table-primary text-center">Birdge Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>Road Name:</th>
                        <td>{road_name}</td>
                      </tr>
                      <tr>
                        <th>District:</th>
                        <td>{district}</td>
                      </tr>
                      <tr>
                        <th>Inventory Score:</th>
                        <td>{inventory_score}</td>
                      </tr>
                      <tr>
                        <th>Inspection Score:</th>
                        <td>{inspection_score}</td>
                      </tr>
                      <tr>
                        <th>Budget Cost:</th>
                        <td>{budget_cost}</td>
                      </tr>
                    </tbody>
                  </table>
                `,
              },
              outFields: [
                "road_name",
                "district",
                "inventory_score",
                "inspection_score",
                "budget_cost",
              ],
            },
          ],
        });

        map.add(roadLayer);

        // Add LayerList Widget
        const layerList = new LayerList({
          view: view,
        });

        view.ui.add(layerList, "top-right");

        await view.when();
        console.log("Map is ready.");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    return () => {
      if (viewRef.current) {
        viewRef.current.container = null;
      }
    };
  }, []);

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div
        ref={mapRef}
        className="map-container"
        style={{ height: "500px" }}
      />
    </div>
  );
};

export default Map;
