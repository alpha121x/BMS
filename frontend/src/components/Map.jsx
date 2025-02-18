import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import { BASE_URL } from './config';

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
          center: [73.1587, 31.5204], // Center the map on a default location
          zoom: 6,
        });

        viewRef.current = view;

        const popupTemplate = {
          title: "Bridge Information",
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
                  <th>Reference No:</th>
                  <td>{uu_bms_id}</td>
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
          actions: [{
            title: "View Details",
            id: "view-details",
            className: "esri-popup__button--primary"
          }]
        };

        view.popup.on("trigger-action", (event) => {
          if (event.action.id === "view-details") {
            const graphic = view.popup.selectedFeature;
            const uuBmsId = graphic.attributes.uu_bms_id;
            
            // Fetch the bridge information from the API
            fetch(`${BASE_URL}/api/bridges?uu_bms_id=${uuBmsId}`)
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  const bridge = data.bridges[0]; // Assuming only one bridge is returned
                  const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
                  window.location.href = `BridgeInformation?bridgeData=${serializedBridgeData}`;
                } else {
                  alert("Error fetching details.");
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while fetching the data.");
              });
          }
        });

        // MapImageLayer for Divisions
        const divisionsLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Divisions",
          opacity: 0.6,
          listMode: "show",
          sublayers: [
            {
              id: 0, // Divisions layer (index 0)
              title: "Divisions",
              opacity: 0.6,
              listMode: "show",
            }
          ]
        });

        // MapImageLayer for Districts
        const districtsLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Districts",
          opacity: 0.6,
          listMode: "show",
          sublayers: [
            {
              id: 1, // Districts layer (index 1)
              title: "Districts",
              opacity: 0.6,
              listMode: "show",
            }
          ]
        });

        // MapImageLayer for Bridge Locations (Index 2)
        const bridgeLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Bridge Locations",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 2, // Bridge Locations (index 2)
              title: "Bridges",
              opacity: 0.8,
              listMode: "show",
            }
          ]
        });

        // MapImageLayer for Condition Layers (Good, Fair, Poor, etc.)
        const conditionLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Condition Locations",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 3, // GOOD layer (index 3)
              title: "Good",
              opacity: 0.6,
              listMode: "show",
            },
            {
              id: 4, // FAIR layer (index 4)
              title: "Fair",
              opacity: 0.6,
              listMode: "show",
            },
            {
              id: 5, // POOR layer (index 5)
              title: "Poor",
              opacity: 0.6,
              listMode: "show",
            },
            {
              id: 6, // UNDER CONSTRUCTION layer (index 6)
              title: "Under Construction",
              opacity: 0.6,
              listMode: "show",
            }
          ]
        });

        // Add Layers to the Map
        map.add(divisionsLayer);
        map.add(districtsLayer);
        map.add(bridgeLayer);
        map.add(conditionLayer);

        // Layer List Widget
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            const item = event.item;
            if (item.layer === divisionsLayer || item.layer === districtsLayer || item.layer === bridgeLayer || item.layer === conditionLayer) {
              item.panel = {
                content: "legend",
                open: true,
              };
            }
          },
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
      <div ref={mapRef} className="map-container" style={{ height: "500px" }} />
    </div>
  );
};

export default Map;
