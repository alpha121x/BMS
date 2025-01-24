import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const Map = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, LayerList] = await loadModules(
          ["esri/Map", "esri/views/MapView", "esri/layers/MapImageLayer", "esri/widgets/LayerList"],
          { css: true }
        );
    
        const map = new Map({
          basemap: "gray-vector",
        });
        console.log("Map instance:", map);
    
        const view = new MapView({
          container: mapRef.current,
          map: map,
          center: [73.1587, 31.5204],
          zoom: 6,
        });
        console.log("MapView instance:", view);
    
        viewRef.current = view;
    
        const popupTemplate = {
          title: "{road_name}",
          content: `
            <b>Road Number:</b> {road_no}<br>
            <b>District:</b> {district}<br>
            <b>Surveyor:</b> {surveyor_name}<br>
            <b>Condition:</b> {str_visual_condition}<br><br>
            <div>
              <h3>Images:</h3>
              <img src="{image_1}" alt="Image 1" style="width:100px; margin-right:10px;" />
              <img src="{image_2}" alt="Image 2" style="width:100px; margin-right:10px;" />
              <img src="{image_3}" alt="Image 3" style="width:100px; margin-right:10px;" />
              <img src="{image_4}" alt="Image 4" style="width:100px; margin-right:10px;" />
              <img src="{image_5}" alt="Image 5" style="width:100px;" />
            </div>
          `,
        };
    
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS Roads",
          sublayers: [
            {
              id: 0,
              title: "Roads",
              popupTemplate: popupTemplate,
              outFields: ["road_name", "road_no", "district", "surveyor_name", "str_visual_condition", "image_1", "image_2", "image_3", "image_4", "image_5"],
            },
          ],
        });
        console.log("Road Layer:", roadLayer);
    
        roadLayer.when(() => {
          console.log("Road Layer loaded.");
        });
    
        map.add(roadLayer);
    
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            const item = event.item;
            if (item.layer === roadLayer) {
              item.panel = {
                content: "legend",
                open: true,
              };
            }
          },
        });
        console.log("LayerList instance:", layerList);
    
        view.ui.add(layerList, "top-right");
    
        view.on("click", (event) => {
          console.log("Map clicked at:", event.mapPoint);
        });
    
        view.popup.watch("visible", (isVisible) => {
          if (isVisible) {
            console.log("Popup data:", view.popup.selectedFeature.attributes);
          }
        });
    
        await view.when();
        console.log("Esri Map is ready.");
      } catch (error) {
        console.error("Error initializing the map:", error);
      }
    };
    

    initializeMap();

    return () => {
      if (viewRef.current) {
        viewRef.current.container = null; // Clean up MapView container on component unmount
      }
    };
  }, []);

  return (
    <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
      <div
        ref={mapRef}
        className="map-container"
        style={{ height: "500px", width: "100%" }} // Ensure responsive width
      />
    </div>
  );
};

export default Map;
