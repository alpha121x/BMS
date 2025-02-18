import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

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
            "esri/widgets/LayerList"
          ],
          { css: true }
        );

        // Initialize Map
        const map = new Map({
          basemap: "gray-vector"
        });

        // Initialize MapView
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [73.1587, 31.5204],
          zoom: 6
        });

        viewRef.current = view;

        // Define Popup Template for Road Layer
        const popupTemplate = {
          content: `
          <table class="table table-bordered">
            <thead>
              <tr>
                <th colspan="2" class="table-primary text-center">Bridge Information</th>
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
          <div style="margin-top: 10px; text-align: center;">
            <button class="btn btn-primary btn-sm" id="modal1Button">Open Modal 1</button>
            <button class="btn btn-secondary btn-sm" id="modal2Button" style="margin-left: 10px;">Open Modal 2</button>
          </div>
        `
        };

        // Road Layer with Popup Template
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 0,
              title: "Bridge Locations",
              popupTemplate: popupTemplate
            }
          ]
        });

        map.add(roadLayer);

        // Layer List Widget
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            // Customize Layer List items
            const item = event.item;
            if (item.layer === roadLayer) {
              item.panel = {
                content: "legend",
                open: true
              };
            }
          }
        });

        // Add Layer List to the view
        view.ui.add(layerList, "top-right");

        await view.when();
        console.log("EzriMap is ready.");
      } catch (error) {
        console.error("Error initializing EzriMap:", error);
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