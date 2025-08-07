import React from "react";
import HeaderEvaluation from "./components/HeaderEvaluation";
import Footer from "./components/Footer";
import "./index.css";
import EvaluationMainCon from "./components/EvaluationMainCon";
import EvaluationMainRams from "./components/EvaluationMainRams";
import EvaluationMain from "./components/EvaluationMain";


const Evaluation = () => {
  /* 
  Designed and Developed By: Abbas Ch.
  React and Node.js Developer
  abbasshakor0123@gmail.com
  Date: 11/21/2024
*/

const userToken = JSON.parse(sessionStorage.getItem("userEvaluation"));

  // Extract username safely
  const user_type = userToken?.usertype;

   // Function to render components based on username
   const renderEvaComponent = () => {
    if (user_type === "consultant") {
      return <EvaluationMainCon/>;
    } else if (user_type === "rams") {
      return <EvaluationMainRams/>;
    } else if (user_type === "evaluator") {
      return <EvaluationMain/>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mb-1">
        <HeaderEvaluation />
      </div>

      <main className="flex-grow p-1">
      {renderEvaComponent()}
      </main>

      <Footer className="mt-1" />
    </div>
  );
};

export default Evaluation;
