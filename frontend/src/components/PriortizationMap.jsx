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
      ],
      { css: true }
    )
      .then(([Map, MapView, MapImageLayer, Legend]) => {
        // Initialize the map
        const map = new Map({
          basemap: "gray-vector",
        });

        // Define a popup template for the layer
        const popupTemplate = {
          title: "Bridge/Road Details",
          content: `
            <div>
             <b>Road Name:</b> {road_name}<br/>
              <b>District:</b> {district}<br/>
              <b>Structure Type:</b> {structure_type}<br/>
              <b>Damage Category:</b> {damagecategory}<br/>
              <b>Damage Score:</b> {damagescore}
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

        // Add the layer to the map
        map.add(mapServiceLayer);

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
       legend.container.style.maxWidth = '200px'; // Limit width
       legend.container.style.maxHeight = '150px'; // Limit height
       legend.container.style.overflow = 'auto'; // Add scroll if content overflows
       legend.container.style.fontSize = '12px'; // Smaller font size

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
