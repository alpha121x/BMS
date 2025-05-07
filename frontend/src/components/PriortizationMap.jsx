import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

const EsriMap = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    // Load the required ArcGIS modules
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/MapImageLayer', 'esri/widgets/Legend'], {
      css: true,
    })
      .then(([Map, MapView, MapImageLayer, Legend]) => {
        // Initialize the map
        const map = new Map({
          basemap: 'gray-vector',
        });

        // Add the ArcGIS MapImageLayer for the road damage service
        const mapServiceLayer = new MapImageLayer({
          url: 'https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_road_Damage_catagory/MapServer',
          title: 'Bridge Categories', // Title for legend
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

        // Add a small Legend widget
        const legend = new Legend({
          view: view,
          layerInfos: [
            {
              layer: mapServiceLayer,
              title: 'Bridge Categories',
            },
          ],
          container: document.createElement('div'), // Custom container for styling
        });

        // Add the legend to the top-right corner
        view.ui.add(legend, 'top-right');

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
        console.error('Error loading ArcGIS modules:', err);
      });
  }, []);

  return (
    <div className="map-container" ref={mapRef} style={{ height: '500px', width: '100%' }} />
  );
};

export default EsriMap;