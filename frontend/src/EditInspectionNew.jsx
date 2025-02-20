import React from "react";
import HeaderEvaluation from "./components/HeaderEvaluation";
import Footer from "./components/Footer";
import "./index.css";
import EditInspectionForm from "./components/EditInspectionForm";

const EditInspectionNew = () => {
  // Retrieve user information from local storage
    const userToken = JSON.parse(localStorage.getItem("user")); // Adjust the key as per your implementation
    const userRole = userToken ? userToken.role : null; // Extract roleId
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
        <EditInspectionForm />
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default EditInspectionNew;