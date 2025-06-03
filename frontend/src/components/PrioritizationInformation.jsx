import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import InventoryInfoDashboard from "./InventoryInfoDashboard";
import InspectionListDashboard from "./InspectionListDashboard";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const PrioritizationInformation = () => {
  const { uu_bms_id } = useParams(); // Get uu_bms_id from URL params
  const [bridgeData, setBridgeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder function to fetch bridge data based on uu_bms_id
    const fetchBridgeData = async () => {
      try {
        // Replace this with your actual API call
        // Example: const response = await fetch(`/api/bridge/${uu_bms_id}`);
        // const data = await response.json();
        const response = await mockFetchBridgeData(uu_bms_id);
        setBridgeData(response);
      } catch (error) {
        console.error("Error fetching bridge data:", error);
        setBridgeData(null);
      }
    };

    fetchBridgeData();
  }, [uu_bms_id]);

  // Mock fetch function (replace with actual API call)
  const mockFetchBridgeData = async (id) => {
    // Simulate API response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uu_bms_id: id,
          bridge_name: `Bridge ${id}`,
          last_inspection_date: "2025-05-15",
          // Add other relevant bridge data fields as needed
        });
      }, 500);
    });
  };

  const handleBackClick = () => {
    navigate("/BridgeWiseScore"); // Adjust the route as needed
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
                <div className="flex justify-start">
                  <button
                    onClick={handleBackClick}
                    className="bg-inherit hover:bg-blue-500 text-black py-2 rounded-md flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5" /> Bridges Wise Score
                  </button>
                </div>
                <div className="text-lg font-semibold">
                  Bridge Name: {bridgeData?.bridge_name || "Loading..."}
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

          {/* Single Card wrapping both components */}
          <div className="flex justify-center w-full">
            <div className="w-full sm:w-3/4 md:w-75 lg:w-75 bg-white p-6 rounded-lg shadow-md">
              {bridgeData ? (
                <InventoryInfoDashboard inventoryData={bridgeData} />
              ) : (
                <p>Loading bridge data...</p>
              )}
              <div className="border-t border-gray-300 my-4"></div>
              <InspectionListDashboard bridgeId={uu_bms_id} />
            </div>
          </div>
        </section>
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default PrioritizationInformation;