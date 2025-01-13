import React from "react";
import Header from "./components/Header";
import DashboardMain from "./components/DashboardMain";
import Footer from "./components/Footer";
import "./index.css";

const BridgeWiseScore = () => {
  /* 
  Designed and Developed By: Abbas Ch.
  React and Node.js Developer
  abbasshakor0123@gmail.com
  Date: 13/01/2025
*/

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <Header />
      </div>

      <main className="flex-grow p-1">
        <DashboardMain />
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default BridgeWiseScore;
