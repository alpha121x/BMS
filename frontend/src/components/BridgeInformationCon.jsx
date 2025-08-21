import React, { useEffect, useState } from "react";
import Header from "./HeaderEvaluation";
import Footer from "./Footer";
import InventoryInfo from "./InventoryInfo";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import InspectionListCon from "./InspectionListCon";

const BridgeInfoDashboard = () => {
  const location = useLocation();
  const [bridgeData, setBridgeData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
     if (location.state?.bridgeData) {
       setBridgeData(location.state.bridgeData);
     }
   }, [location.state]);

  const handleBackClick = () => {
    navigate("/Evaluation");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <Header />
      </div>

      <main className="flex-grow">
        <section className="bg-gray-100 min-h-screen">
          <div className="w-full sm:w-3/4 md:w-75 lg:w-75 mx-auto mt-5">
            <div className="bg-[#60A5FA] text-grey p-3 rounded-md shadow-md flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-start">
                  <button
                    onClick={handleBackClick}
                    className="bg-inherit hover:bg-blue-500 text-black py-2 rounded-md flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-5 w-5" /> Evaluation
                  </button>
                </div>
                <div className="text-lg font-semibold">
                  Bridge Name: {bridgeData?.bridge_name}
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
              {bridgeData && <InventoryInfo inventoryData={bridgeData} />}
              <div className="border-t border-gray-300 my-4"></div>
              <InspectionListCon bridgeId={bridgeData?.uu_bms_id} />
            </div>
          </div>
        </section>
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default BridgeInfoDashboard;
