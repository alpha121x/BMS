import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

const EsriMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load the required ArcGIS modules
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer'], {
      css: true,
    })
      .then(([Map, MapView, MapImageLayer]) => {
        // Initialize the map
        const map = new Map({
          basemap: 'topo-vector', // You can change this to 'streets', 'satellite', etc.
        });

        // Add the ArcGIS MapImageLayer for the dynamic map service
        const mapServiceLayer = new MapImageLayer({
          url: 'https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_road_Damage_catagory/MapServer',
        });

        // Add the layer to the map
        map.add(mapServiceLayer);

        // Create a MapView
        const view = new MapView({
          container: mapRef.current, // Reference to the DOM element
          map: map,
          center: [73.0479, 31.3753], // Center on Punjab, Pakistan (adjust as needed)
          zoom: 7, // Adjust zoom level as needed
        });

        // Cleanup on component unmount
        return () => {
          if (view) {
            view.destroy();
          }
        };
      })
      .catch((err) => {
        console.error('Error loading ArcGIS modules:', err);
      });
  }, []);

  return (
    <div className="map-container" ref={mapRef} style={{ height: '500px', width: '100%' }} />
  );
};

export default EsriMap;