import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import "bootstrap/dist/css/bootstrap.min.css";

const Map = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const [popupContent, setPopupContent] = useState("");

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, LayerList] = await loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/MapImageLayer",
            "esri/widgets/LayerList",
            "esri/Graphic"
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

        // Define the Popup Template dynamically for Road Layer
        const popupTemplate = {
          content: (event) => {
            const graphic = event.graphic;
            const attributes = graphic.attributes;
            console.log("Popup attributes:", attributes);

            // Prepare the popup content dynamically
            const content = `
              <table class="table">
                <thead>
                  <tr>
                    <th colspan="2" class="table-primary text-center">Details for ${attributes['facility']}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>District Name:</th>
                    <td>${attributes['district']}</td>
                  </tr>
                  <tr>
                    <th>Facility Name:</th>
                    <td>${attributes['facility']}</td>
                  </tr>
                  <tr class="table-warning">
                    <th>Physical Progress:</th>
                    <td>${attributes['progress_physical']}</td>
                  </tr>
                </tbody>
              </table>
            `;
            // Set popup content to state for rendering
            setPopupContent(content);
          }
        };

        // Add Road Layer with the popupTemplate
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 0,
              title: "Roads",
              popupTemplate: popupTemplate
            }
          ]
        });

        map.add(roadLayer);

        // Layer List Widget
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: (event) => {
            const item = event.item;
            if (item.layer === roadLayer) {
              item.panel = {
                content: "legend",
                open: true
              };
            }
          }
        });

        view.ui.add(layerList, "top-right");

        await view.when();
        console.log("EsriMap is ready.");

        // Listen for click events to trigger the modal
        view.on("click", (event) => {
          view.hitTest(event).then((response) => {
            const graphic = response.results[0]?.graphic;
            if (graphic) {
              const attributes = graphic.attributes;

              const content = `
                <table class="table">
                  <thead>
                    <tr>
                      <th colspan="2" class="table-primary text-center">Details for ${attributes['facility']}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>District Name:</th>
                      <td>${attributes['district']}</td>
                    </tr>
                    <tr>
                      <th>Facility Name:</th>
                      <td>${attributes['facility']}</td>
                    </tr>
                    <tr class="table-warning">
                      <th>Physical Progress:</th>
                      <td>${attributes['progress_physical']}</td>
                    </tr>
                  </tbody>
                </table>
              `;
              setPopupContent(content);

              // Open the modal after setting content
              const modal = new window.bootstrap.Modal(document.getElementById('featureModal'));
              modal.show();
            }
          });
        });

      } catch (error) {
        console.error("Error initializing EsriMap:", error);
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
      {/* Modal for displaying feature details */}
      <div
        className="modal fade"
        id="featureModal"
        tabIndex="-1"
        aria-labelledby="featureModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="featureModalLabel">Feature Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div id="popupContent" dangerouslySetInnerHTML={{ __html: popupContent }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
