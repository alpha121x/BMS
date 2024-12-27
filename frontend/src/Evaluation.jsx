import React from "react";
import HeaderEvaluation from "./components/HeaderEvaluation";
import Footer from "./components/Footer";
import "./index.css";
import EvaluationMain from "./components/EvaluationMain.";

const Evaluation = () => {
  /* 
  Designed and Developed By: Abbas Ch.
  React and Node.js Developer
  abbasshakor0123@gmail.com
  Date: 11/21/2024
*/

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <HeaderEvaluation />
      </div>

      <main className="flex-grow p-1">
        <EvaluationMain />
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default Evaluation;
