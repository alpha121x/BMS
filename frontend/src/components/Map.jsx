import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import "bootstrap/dist/css/bootstrap.min.css";

const Map = () => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);

  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);

  const toggleModal1 = () => setIsModal1Open(!isModal1Open);
  const toggleModal2 = () => setIsModal2Open(!isModal2Open);

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
          center: [73.1587, 31.5204], // Example center coordinates
          zoom: 6,
        });

        viewRef.current = view;

        // Add Road Layer with outFields and PopupTemplate
        const roadLayer = new MapImageLayer({
          url: "http://map3.urbanunit.gov.pk:6080/arcgis/rest/services/Punjab/PB_BMS_Road_241224/MapServer",
          title: "BMS Roads",
          opacity: 0.8,
          sublayers: [
            {
              id: 0, // Assuming the roads layer is at sublayer 0
              title: "Roads",
              popupTemplate: {
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
                `,
              },
            },
          ],
        });

        map.add(roadLayer);

        // Add LayerList Widget
        const layerList = new LayerList({
          view: view,
        });

        view.ui.add(layerList, "top-right");

        view.when(() => {
          // Attach event listeners to buttons in popup
          view.popup.on("trigger-action", (event) => {
            if (event.action.id === "modal1Button") {
              toggleModal1();
            }
            if (event.action.id === "modal2Button") {
              toggleModal2();
            }
          });
        });
      } catch (error) {
        console.error("Error initializing map:", error);
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
    <>
      <div className="bg-white border-2 border-blue-400 p-2 rounded-lg shadow-md">
        <div ref={mapRef} className="map-container" style={{ height: "500px" }} />
      </div>

      {/* Modal 1 */}
      {isModal1Open && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modal 1</h5>
                <button type="button" className="btn-close" onClick={toggleModal1}></button>
              </div>
              <div className="modal-body">
                <p>This is the content of Modal 1.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={toggleModal1}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 */}
      {isModal2Open && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modal 2</h5>
                <button type="button" className="btn-close" onClick={toggleModal2}></button>
              </div>
              <div className="modal-body">
                <p>This is the content of Modal 2.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={toggleModal2}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Map;
