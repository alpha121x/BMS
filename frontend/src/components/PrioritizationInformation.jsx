import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import InventoryInfoDashboard from "./InventoryInfoDashboard";
import InspectionListDashboard from "./InspectionListDashboard";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BASE_URL } from "./config";

const PrioritizationInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uu_bms_id = queryParams.get("uu_bms_id"); // Extract uu_bms_id from query string
  const [bridgeData, setBridgeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBridgeData = async () => {
      setLoading(true);
      try {
        if (!uu_bms_id) {
          throw new Error("No bridge ID provided");
        }
        console.log("Fetching bridge data for uu_bms_id:", uu_bms_id);
        const response = await fetch(
          `${BASE_URL}/api/PriortizationInfo?bridgeId=${encodeURIComponent(
            uu_bms_id
          )}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Bridge data received:", data);
        setBridgeData(data);
      } catch (error) {
        console.error("Error fetching bridge data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (uu_bms_id) {
      fetchBridgeData();
    } else {
      setError("No bridge ID provided");
      setLoading(false);
    }
  }, [uu_bms_id]);

  const handleBackClick = () => {
    navigate("/Priortization");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <Header />
      </div>

      <main className="flex-grow">
        <section className="bg-gray-100 min-h-screen">
          <div className="w-full sm:w-3/4 md:w-75 lg:w-75 mx-auto mt-2">
            <div className="bg-[#60A5FA] text-grey p-3 rounded-md shadow-md flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-start mt-5">
                  <button
                    onClick={handleBackClick}
                    className="bg-inherit hover:bg-blue-500 text-black py-2 rounded-md flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5" /> Prioritization
                  </button>
                </div>
                <div className="text-lg font-semibold">
                  Bridge Name: {bridgeData?.bridge_name || "N/A"}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-gray">Latest Inspection Date:</span>
                    <span className="ml-2">
                      {bridgeData?.last_inspection_date || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray">Latest Inspection Status:</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="w-full sm:w-3/4 md:w-75 lg:w-75 bg-white p-6 rounded-lg shadow-md">
              {loading ? (
                <p>Loading bridge data...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : bridgeData ? (
                <>
                  <InventoryInfoDashboard inventoryData={bridgeData} />
                  <div className="border-t border-gray-300 my-4"></div>
                  <InspectionListDashboard bridgeId={uu_bms_id} />
                </>
              ) : (
                <p>No bridge data available</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default PrioritizationInformation;
