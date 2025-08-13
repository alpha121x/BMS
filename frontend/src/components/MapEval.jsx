import { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./config";

const MapEval = ({
  districtId,
  structureType,
  bridgeName,
  constructionType,
  bridgeLength,
  roadClassification,
  spanLength,
}) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const [Map, MapView, MapImageLayer, Extent, LayerList, Legend] = await loadModules(
          [
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/MapImageLayer",
            "esri/geometry/Extent",
            "esri/widgets/LayerList",
            "esri/widgets/Legend",
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
            const attributes = view.popup.selectedFeature?.attributes;
            const bridgeId = attributes?.uu_bms_id;

            if (!bridgeId) {
              console.error("Bridge ID not found in attributes:", attributes);
              return;
            }

            try {
              const response = await fetch(`${BASE_URL}/api/bridgesNew?bridgeId=${bridgeId}`);
              const bridgeData = await response.json();

              if (bridgeData.success) {
                const bridgesArray = bridgeData.bridges;
                const bridge = bridgesArray[0];

                if (!bridge) {
                  console.error("No bridge details found");
                  return;
                }

                const serializedBridgeData = encodeURIComponent(JSON.stringify(bridge));
                window.location.href = `/BridgeInformation?bridgeData=${serializedBridgeData}`;
              } else {
                console.error("Bridge details not found");
              }
            } catch (error) {
              console.error("Error fetching bridge details:", error);
            }
          }
        };

        const handlePopupTrigger = (event) => {
          const graphic = event.graphic;
          const attributes = graphic?.attributes || {};
          const geometry = graphic?.geometry;
          console.log("Popup triggered for feature:", {
            attributes,
            geometry: geometry ? "Valid" : "Null",
            layerId: graphic?.layer?.id,
          });
          if (!geometry) {
            console.warn("Feature has null geometry, popup may be empty.");
          }
        };

        view.popup.on("trigger-action", handlePopupAction);
        view.popup.on("trigger", handlePopupTrigger);

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
                <tr><th>Structure Type:</th><td>{structure_type}</td></tr>
                <tr><th>District:</th><td>{district}</td></tr>
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
              title: "View Bridge Details",
              id: "view-details",
              className: "esri-popup__button--primary",
            },
          ],
        };

        // Build definition expression based on filter props
        const buildDefinitionExpression = () => {
          const expressions = [];
          console.log("Input values:", {
            districtId,
            structureType,
            bridgeName,
            constructionType,
            bridgeLength,
            roadClassification,
            spanLength,
          });

          if (districtId && districtId !== "" && districtId !== "%") {
            expressions.push(`district_id = '${districtId}'`);
          }
          if (structureType && structureType !== "" && structureType !== "%") {
            expressions.push(`structure_type_id = '${structureType}'`);
          }
          if (bridgeName && bridgeName !== "" && bridgeName !== "%") {
            expressions.push(`bridge_name ILIKE '%${bridgeName}%'`);
          }
          if (constructionType && constructionType !== "" && constructionType !== "%") {
            expressions.push(`construction_type_id = '${constructionType}'`);
          }
          if (roadClassification && roadClassification !== "" && roadClassification !== "%") {
            expressions.push(`road_classification_id = '${roadClassification}'`);
          }
             if (bridgeLength && bridgeLength !== "" && bridgeLength !== "%") {
              try {
                const computedField = "(no_of_span * span_length_m)";
                if (bridgeLength.startsWith("<")) {
                  const value = parseFloat(bridgeLength.substring(1));
                  if (!isNaN(value)) {
                    expressions.push(`${computedField} < ${value}`);
                  } else {
                    console.warn(`Invalid bridgeLength value: ${bridgeLength}`);
                  }
                } else if (bridgeLength.includes("-")) {
                  const [min, max] = bridgeLength.split("-").map(v => parseFloat(v.trim()));
                  if (!isNaN(min) && !isNaN(max)) {
                    expressions.push(`${computedField} BETWEEN ${min} AND ${max}`);
                  } else {
                    console.warn(`Invalid bridgeLength range: ${bridgeLength}`);
                  }
                } else if (bridgeLength.startsWith(">")) {
                  const value = parseFloat(bridgeLength.substring(1));
                  if (!isNaN(value)) {
                    expressions.push(`${computedField} > ${value}`);
                  } else {
                    console.warn(`Invalid bridgeLength value: ${bridgeLength}`);
                  }
                } else {
                  const value = parseFloat(bridgeLength);
                  if (!isNaN(value)) {
                    expressions.push(`${computedField} = ${value}`);
                  } else {
                    console.warn(`Invalid bridgeLength value: ${bridgeLength}`);
                  }
                }
              } catch (error) {
                console.error(`Error parsing bridgeLength: ${bridgeLength}`, error);
              }
            }
          if (spanLength && spanLength !== "" && spanLength !== "%") {
            try {
              if (spanLength.startsWith("<")) {
                const value = parseFloat(spanLength.substring(1));
                if (!isNaN(value)) {
                  expressions.push(`span_length_m < ${value}`);
                } else {
                  console.warn(`Invalid spanLength value: ${spanLength}`);
                }
              } else if (spanLength.includes("-")) {
                const [min, max] = spanLength.split("-").map(parseFloat);
                if (!isNaN(min) && !isNaN(max)) {
                  expressions.push(`span_length_m BETWEEN ${min} AND ${max}`);
                } else {
                  console.warn(`Invalid spanLength range: ${spanLength}`);
                }
              } else if (spanLength.startsWith(">")) {
                const value = parseFloat(spanLength.substring(1));
                if (!isNaN(value)) {
                  expressions.push(`span_length_m > ${value}`);
                } else {
                  console.warn(`Invalid spanLength value: ${spanLength}`);
                }
              } else {
                const value = parseFloat(spanLength);
                if (!isNaN(value)) {
                  expressions.push(`span_length_m = ${value}`);
                } else {
                  console.warn(`Invalid spanLength value: ${spanLength}`);
                }
              }
            } catch (error) {
              console.error(`Error parsing spanLength: ${spanLength}`, error);
            }
          }

          const expression = expressions.length > 0 ? expressions.join(" AND ") : null;
          console.log("Generated definitionExpression:", expression);
          return expression;
        };

        const definitionExpression = buildDefinitionExpression();

        const bridgeLayer = new MapImageLayer({
          url: "https://map3.urbanunit.gov.pk:6443/arcgis/rest/services/Punjab/PB_BMS_Inspections_Evaluations_120825/MapServer",
          title: "Inspected Structures",
          opacity: 0.8,
          listMode: "show",
          sublayers: [
            {
              id: 0,
              title: "Divisions",
              opacity: 0.6,
              listMode: "show",
              popupTemplate,
              visible: false,
              definitionExpression,
            },
            {
              id: 1,
              title: "Districts",
              opacity: 0.6,
              listMode: "show",
              popupTemplate,
              visible: true,
              definitionExpression,
            },
            {
              id: 2,
              title: "Evaluated Structures",
              opacity: 0.6,
              listMode: "show",
              popupTemplate,
              visible: false,
              definitionExpression,
            },
            {
              id: 3,
              title: "Inspected Structures",
              opacity: 0.6,
              listMode: "show",
              popupTemplate,
              visible: true,
              definitionExpression,
            },
          ],
        });

        map.add(bridgeLayer);

        // Enhanced layer view error handling
        bridgeLayer.when(() => {
          console.log("Bridge layer loaded successfully.");
          bridgeLayer.sublayers.forEach((sublayer) => {
            console.log(`Sublayer ${sublayer.id} definitionExpression:`, sublayer.definitionExpression);
            console.log(`Sublayer ${sublayer.id} visibility:`, sublayer.visible);
          });
        }).catch((error) => {
          console.error("Error loading bridge layer:", error);
        });

        // Force refresh after layer load
        bridgeLayer.when(() => {
          bridgeLayer.refresh();
          console.log("Layer refreshed.");
          bridgeLayer.sublayers.forEach((sublayer) => {
            sublayer.definitionExpression = definitionExpression;
          });
        }).catch((error) => {
          console.error("Error during layer refresh:", error);
        });

        // Add LayerList widget to the top-right without legend
        const layerList = new LayerList({
          view: view,
          listItemCreatedFunction: function (event) {
            const item = event.item;
            if (item.layer.type !== "group") {
              item.panel = {
                content: null,
                open: true,
              };
              item.actionsSections = [
                [
                  {
                    title: "Toggle Visibility",
                    className: "esri-icon-visible",
                    id: "toggle-layer-visibility",
                  },
                ],
              ];
            }
          },
        });

        // Handle layer visibility toggle
        layerList.on("trigger-action", function (event) {
          if (event.action.id === "toggle-layer-visibility") {
            const item = event.item;
            item.layer.visible = !item.layer.visible;
            event.action.title = item.layer.visible ? "Hide Layer" : "Show Layer";
            event.action.className = item.layer.visible ? "esri-icon-non-visible" : "esri-icon-visible";
          }
        });

        view.ui.add(layerList, {
          position: "top-right",
          className: "esri-ui-corner-container",
        });

        // Add Legend widget to the left
        const legend = new Legend({
          view: view,
          container: document.createElement("div"),
        });
        view.ui.add(legend, {
          position: "top-left",
          className: "esri-ui-corner-container",
        });

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
  }, [districtId, structureType, bridgeName, constructionType, bridgeLength, roadClassification, spanLength, navigate]);

  return (
    <div className="bg-white border-1 p-0 rounded-0 shadow-md" style={{ border: "1px solid #005D7F" }}>
      <div ref={mapRef} className="map-container" style={{ height: "500px" }} />
    </div>
  );
};

export default MapEval;