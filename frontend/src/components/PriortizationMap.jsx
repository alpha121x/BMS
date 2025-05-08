import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const EsriMap = () => {
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
        "esri/identity/IdentityManager", // Add IdentityManager for authentication
      ],
      { css: true }
    )
      .then(([Map, MapView, MapImageLayer, Legend, IdentityManager]) => {
        // Register the token with IdentityManager (preferred method)
        const token = "your-token-here"; // Replace with the token you obtained
        IdentityManager.registerToken({
          server: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services",
          token: token,
        });

        // Initialize the map
        const map = new Map({
          basemap: "gray-vector",
        });

        // Define a popup template for the layer
        const popupTemplate = {
          title: "Bridge Details",
          content: `
            <div style="margin-bottom: 20px;">
              <b>Road Name:</b> {road_name}<br/>
              <b>District:</b> {district}<br/>
              <b>Structure Type:</b> {structure_type}<br/>
              <b>Damage Category:</b> {damagecategory}<br/>
              <b>Damage Score:</b> {damagescore}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
              <img src="{image_1}" alt="Overview Image 1" style="width: 18%; height: auto; object-fit: cover;">
              <img src="{image_2}" alt="Overview Image 2" style="width: 18%; height: auto; object-fit: cover;">
              <img src="{image_3}" alt="Overview Image 3" style="width: 18%; height: auto; object-fit: cover;">
              <img src="{image_4}" alt="Overview Image 4" style="width: 18%; height: auto; object-fit: cover;">
              <img src="{image_5}" alt="Overview Image 5" style="width: 18%; height: auto; object-fit: cover;">
            </div>
          `,
        };

        // Add the ArcGIS MapImageLayer for the road damage service with sublayers
        const mapServiceLayer = new MapImageLayer({
          url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_road_Damage_catagory/MapServer",
          title: "Bridge Categories",
          sublayers: [
            { id: 1, title: "Severe", popupTemplate: popupTemplate },
            { id: 2, title: "Poor", popupTemplate: popupTemplate },
            { id: 3, title: "Fair", popupTemplate: popupTemplate },
            { id: 4, title: "Good", popupTemplate: popupTemplate },
          ],
        });

        const divisionBoundaryLayer = new MapImageLayer({
          url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_road_Damage_catagory/MapServer",
          title: "Divisions",
          sublayers: [
            { id: 5, title: "Divisions", popupTemplate: popupTemplate },
          ],
        });

        // Add the layers to the map
        map.add(mapServiceLayer);
        map.add(divisionBoundaryLayer);

        // Create a MapView
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [72.7097, 31.1704],
          zoom: 6,
        });

        viewRef.current = view;

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

        // Add a small Legend widget
        const legend = new Legend({
          view: view,
          layerInfos: [
            {
              layer: mapServiceLayer,
              title: "Bridge Categories",
              sublayers:
                mapServiceLayer.sublayers?.filter(
                  (sublayer) => !sublayer.isGroupLayer
                ) || [],
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

        // Cleanup on component unmount
        return () => {
          if (view) {
            view.destroy();
          }
        };
      })
      .catch((err) => {
        console.error("Error loading ArcGIS modules:", err);
      });
  }, []);

  return (
    <div
      className="map-container"
      ref={mapRef}
      style={{ height: "500px", width: "100%" }}
    />
  );
};

export default EsriMap;