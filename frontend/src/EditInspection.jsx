import React from "react";
import HeaderEvaluation from "./components/HeaderEvaluation";
import Footer from "./components/Footer";
import "./index.css";
import EditEvaluatorForm from "./components/EditInspectionEvaForm";
import EditRAMSForm from "./components/EditInspectionRamForm";
import EditConsultantForm from "./components/EditInspectionConForm";

const EditInspection = () => {
  // Retrieve user information from local storage
  const userToken = JSON.parse(localStorage.getItem("user")); // Adjust the key as per your implementation
  const userRole = userToken ? userToken.role : null; // Extract role

  // Function to render form based on user role
  const renderFormBasedOnRole = () => {
    switch (userRole) {
      case "evaluator":
        return <EditEvaluatorForm />;
      case "rams":
        return <EditRAMSForm />;
      case "consultant":
        return <EditConsultantForm />;
    }
  };

  /* 
  Designed and Developed By: Abbas Ch.
  React and Node.js Developer
  abbasshakor0123@gmail.com
  Date: 12/31/2024
  */

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <HeaderEvaluation />
      </div>

      <main className="flex-grow p-1">
        {renderFormBasedOnRole()}
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default EditInspection;
