import React, { useEffect, useState } from "react";
import {
  TrashIcon,
  PencilIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import HeaderEvaluation from "./HeaderEvaluation";
import Footer from "./Footer";
import InventoryInfo from "./InventoryInfo";
import { useLocation, useNavigate } from "react-router-dom";
import InspectionListRams from "./InspectionListRams";
import InspectionListEvaluator from "./InspectionListEvaluator";
import InspectionListCon from "./InspectionListCon";
import OverallBridgeCondition from "./OverallBridgeCondition";
import OverallBridgeConditionRams from "./OverallBridgeConditionRams";

const BridgeInfo = () => {
  const { state } = useLocation();
  const bridgeData = state?.bridge;
  

  useEffect(() => {
    if (!bridgeData) {
      console.error('No bridge data in state');
    }
  }, [bridgeData]);

  const userToken = JSON.parse(sessionStorage.getItem("userEvaluation"));

  // Extract username safely
  const user_type = userToken?.usertype;

  const navigate = useNavigate();
  

  // Function to render components based on username
  const renderInspectionList = () => {
    if (user_type === "consultant") {
      return <InspectionListCon bridgeId={bridgeData?.uu_bms_id} />;
    }  else if (user_type === "rams") {
      return <InspectionListRams bridgeId={bridgeData?.uu_bms_id} />;
    } else if (user_type === "evaluator") {
      return <InspectionListEvaluator bridgeId={bridgeData?.uu_bms_id} />;
    }
    else {
      return <InspectionListCon bridgeId={bridgeData?.uu_bms_id} />;
    }
  };

  // Function to render Overall Bridge Condition based on user type
  const renderOverallBridgesCondition = () => {
     if (user_type === "consultant") {
      return <OverallBridgeCondition inventoryData={bridgeData} />;
    }  else if (user_type === "rams") {
      return <OverallBridgeConditionRams inventoryData={bridgeData} />;
    } else if (user_type === "evaluator") {
      return <OverallBridgeCondition inventoryData={bridgeData} />;
    }
  };

  const handleBackClick = () => {
    navigate("/Evaluation");
  };

  const handleEditClick = () => {
    const serializedBridgeData = encodeURIComponent(JSON.stringify(bridgeData));
    window.location.href = `/EditBridge?data=${serializedBridgeData}`;
  };

  if (!bridgeData || !user_type) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    ); // Or redirect to login
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderEvaluation className="mb-1" />
      <main className="flex-grow p-1 mt-5">
        <section className="bg-gray-100 min-h-screen">
          <div className="w-full sm:w-3/4 md:w-75 lg:w-75 mx-auto mt-2">
            <div className="bg-[#CFE2FF] text-grey p-3 rounded-md shadow-md flex items-center justify-between">
              <div className="flex-1">
                <button
                  onClick={handleBackClick}
                  className="bg-inherit hover:bg-blue-500 text-black py-2 rounded-md flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-5 w-5" /> Bridges List
                </button>
                <div className="text-lg font-semibold">
                  Bridge Name: {bridgeData?.bridge_name || "Bridge Name"}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-gray">Latest Inspection Date:</span>
                    <span className="ml-2">N/A</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray">Latest Inspection Status:</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-[#5C636A] hover:bg-slate-400 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <PencilIcon className="h-5 w-5" /> Edit
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Single Card wrapping both components */}
          <div className="flex justify-center w-full">
            <div className="w-full sm:w-3/4 md:w-75 lg:w-75 bg-white p-6 rounded-lg shadow-md">
              {bridgeData && <InventoryInfo inventoryData={bridgeData} />}
              <div className="border-t border-gray-300 my-4"></div>
              <div>{renderOverallBridgesCondition()}</div>
              <div className="border-t border-gray-300 my-4"></div>
              <div>{renderInspectionList()}</div>
            </div>
          </div>
        </section>
      </main>
      <Footer className="mt-1" />
    </div>
  );
};

export default BridgeInfo;
