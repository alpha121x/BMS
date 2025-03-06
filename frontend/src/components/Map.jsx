import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import { useNavigate } from "react-router-dom"; // For navigation
import { BASE_URL } from "./config";

const Map = ({ districtId }) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const navigate = useNavigate(); // Use for navigation

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
              "esri/geometry/Extent",
            ],
            { css: true }
          );

        const map = new Map({
          basemap: "gray-vector",
        });

        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [72.7097, 31.1704],
          zoom: 6,
        });

        viewRef.current = view;

        const handlePopupAction = async (event) => {
          if (event.action.id === "view-details") {
            const attributes = view.popup.selectedFeature.attributes;
            const bridgeId = attributes?.uu_bms_id; // Extract Bridge ID
        
            if (!bridgeId) {
              console.error("Bridge ID not found.");
              return;
            }
        
            try {
              const response = await fetch(`${BASE_URL}/api/bridgesNew?bridgeId=${bridgeId}`);
              const bridgeData = await response.json();
        
              if (bridgeData.success) {
                // Convert data to a serialized JSON string and encode it
                const serializedBridgeData = encodeURIComponent(JSON.stringify(bridgeData.bridge));
        
                // Redirect using window.location.href
                window.location.href = `/BridgeInformation?bridgeData=${serializedBridgeData}`;
              } else {
                console.error("Bridge details not found");
              }
            } catch (error) {
              console.error("Error fetching bridge details:", error);
            }
          }
        };
        
        

        view.popup.on("trigger-action", handlePopupAction);

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

        const extent = await getDistrictExtent(districtId);
        if (extent) {
          view.extent = extent;
        }

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
                <tr><th>Road Name:</th><td>{road_name}</td></tr>
                <tr><th>Reference No:</th><td>{uu_bms_id}</td></tr>
                <tr><th>District:</th><td>{district}</td></tr>
                <tr><th>Inventory Score:</th><td>{inventory_score}</td></tr>
                <tr><th>Inspection Score:</th><td>{inspection_score}</td></tr>
                <tr><th>Budget Cost:</th><td>{budget_cost}</td></tr>
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

        const bridgeLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "Condition Locations",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            { id: 1, title: "Districts", opacity: 0.6, listMode: "show" },
            { id: 3, title: "Good", opacity: 0.6, listMode: "show", popupTemplate },
            { id: 4, title: "Fair", opacity: 0.6, listMode: "show", popupTemplate },
            { id: 5, title: "Poor", opacity: 0.6, listMode: "show", popupTemplate },
            { id: 6, title: "Under Construction", opacity: 0.6, listMode: "show", popupTemplate },
            { id: 2, title: "Bridge Locations", popupTemplate },
          ],
        });

        map.add(bridgeLayer);

        const layerList = new LayerList({ view: view });

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
  }, [districtId, navigate]);

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div ref={mapRef} className="map-container" style={{ height: "500px" }} />
    </div>
  );
};

export default Map;
