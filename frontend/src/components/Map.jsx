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
                  <table class="table table-bordered">
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
                      <tr>
                        <th>Images:</th>
                        <td>
                          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 100%;">
                            <img src="{image_1}" alt="Image 1" style="width: 18%; height: auto; border-radius: 5px;" />
                            <img src="{image_2}" alt="Image 2" style="width: 18%; height: auto; border-radius: 5px;" />
                            <img src="{image_3}" alt="Image 3" style="width: 18%; height: auto; border-radius: 5px;" />
                            <img src="{image_4}" alt="Image 4" style="width: 18%; height: auto; border-radius: 5px;" />
                            <img src="{image_5}" alt="Image 5" style="width: 18%; height: auto; border-radius: 5px;" />
                          </div>
                        </td>
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
                "image_1",
                "image_2",
                "image_3",
                "image_4",
                "image_5",
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
      <div ref={mapRef} className="map-container" style={{ height: "500px" }} />
    </div>
  );
};

export default Map;
