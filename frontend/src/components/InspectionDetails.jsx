import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import HeaderEvaluation from "./HeaderEvaluation";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./Footer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const InspectionDetails = () => {
  // State for back-to-top button visibility
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [inspectionData, setInspectionData] = useState(null);

  // Parse the data from query parameters
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const serializedData = queryParams.get("data");

    if (serializedData) {
      const parsedData = JSON.parse(decodeURIComponent(serializedData));
      setInspectionData(parsedData);
      console.log(parsedData);
    }
  }, [location.search]);

  const handleBackClick = () => {
    window.location.href = "/Evaluation"; // Adjust the route as needed
  };

  const handleEditClick = () => {};

  const buttonStyles = {
    margin: "0 6px",
    padding: "4px 8px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  };

  // Show back-to-top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <HeaderEvaluation />
      </div>

      <main className="flex-grow p-1">
        <section className="bg-gray-100 min-h-screen">
          <div className="w-full sm:w-3/4 md:w-75 lg:w-75 mx-auto mt-2">
            {/* Bridge Information Card */}
            <div className="bg-[#60A5FA] text-grey p-3 rounded-md shadow-md flex items-center justify-between">
              <div className="flex-1">
                {/* Back Button */}
                <div className="flex justify-start">
                  <button
                    onClick={handleBackClick}
                    className="bg-inherit hover:bg-blue-500 text-black py-2 rounded-md flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5" /> Inspection List
                  </button>
                </div>
                <div className="text-lg font-semibold">
                  Bridge Name: {inspectionData?.BridgeName || "N/A"}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-gray">Latest Inspection Date:</span>
                    <span className="ml-2">
                      {inspectionData?.inspectionDate || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray">Latest Inspection Status:</span>
                    <span className="ml-2">
                      {inspectionData?.inspectionStatus || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2"></div>
            </div>
            <div
              className="card p-2 rounded-lg text-black"
              style={{
                background: "#FFFFFF",
                border: "2px solid #60A5FA",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                position: "relative",
              }}
            >
              <div className="card-body pb-0">
                <h6
                  className="card-title text-lg font-semibold pb-2"
                  style={{ fontSize: "1.25rem" }}
                >
                  Inspections Details
                </h6>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {/* Left Column */}
                  <div style={{ flex: 1, paddingRight: "10px" }}>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Work Kind</strong>
                      <p>{inspectionData?.WorkKindName || "N/A"}</p>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <strong>Part</strong>
                      <p>{inspectionData?.PartsName || "N/A"}</p>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <strong>Material</strong>
                      <p>{inspectionData?.MaterialName || "N/A"}</p>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <strong>Span Index</strong>
                      <p>{inspectionData?.SpanIndex || "N/A"}</p>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <strong>Damage Kind</strong>
                      <p>{inspectionData?.DamageKindName || "N/A"}</p>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <strong>Damage Level</strong>
                      <p>{inspectionData?.DamageLevel || "N/A"}</p>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                      <strong>Remarks</strong>
                      <p>{inspectionData?.Remarks || "N/A"}</p>
                    </div>
                  </div>

                  {/* Right Column (Images) */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px" }}>
                      {inspectionData?.PhotoPaths?.map((image, index) => (
                        <img
                          key={index}
                          src={image || "placeholder.png"}
                          alt={`Image ${index + 1}`}
                          width="150" // Increased size
                          height="150" // Increased size
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-5 right-5 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 focus:outline-none w-12 h-12 flex items-center justify-center"
            >
              ↑
            </button>
          )}
        </section>
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default InspectionDetails;
