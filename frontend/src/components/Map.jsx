import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import { BASE_URL } from "./config";

const Map = ({ districtId }) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, LayerList, Extent] =
          await loadModules(
            [
              "esri/Map",
              "esri/views/MapView",
              "esri/layers/MapImageLayer",
              "esri/widgets/LayerList",
              "esri/geometry/Extent", // To work with extents
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
          center: [73.1587, 31.5204],
          zoom: 6,
        });

        viewRef.current = view;

        // Function to get extent by districtId
        const getDistrictExtent = async (districtId) => {
          if (districtId === "%") {
            // Return extent for entire Punjab
            return new Extent({
              xmin: 69.0,
              ymin: 29.5,
              xmax: 77.0,
              ymax: 35.0,
              spatialReference: { wkid: 4326 },
            });
          } else {
            try {
              const response = await fetch(
                `${BASE_URL}/api/districtExtent?districtId=${districtId}`
              );
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

        // Fetch the extent and zoom to the district
        const extent = await getDistrictExtent(districtId);
        if (extent) {
          view.extent = extent; // Set the map extent to the district or Punjab
        }

        // Define the popup template for bridge information
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
          actions: [
            {
              title: "View Details",
              id: "view-details",
              className: "esri-popup__button--primary",
            },
          ],
        };

        // MapImageLayer with multiple layers by index
        const bridgeLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Condition Locations",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 1, // Districts layer (index 1)
              title: "Districts",
              opacity: 0.6,
              listMode: "show",
            },
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
            },
            {
              id: 2, // BRIDGES LOCATIONS layer (index 2)
              title: "Bridge Locations",
              popupTemplate: popupTemplate,
            },
          ],
        });

        // Add the Layer to the Map
        map.add(bridgeLayer);

        // Layer List Widget
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            // Customize Layer List items
            const item = event.item;
            if (item.layer === bridgeLayer) {
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
  }, [districtId]); // Re-run when districtId changes

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div ref={mapRef} className="map-container" style={{ height: "500px" }} />
    </div>
  );
};

export default Map;
