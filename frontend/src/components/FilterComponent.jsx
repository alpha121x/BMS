import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({
  setSelectedDistrict,
  setBridgeMinLength,
  setBridgeMaxLength,
  setSpanMinLength,
  setSpanMaxLength,
  setStructureType,
  setConstructionType,
  setCategory,
  setNoOfSpan,
  setEvaluationStatus,
  setInspectionStatus,
  setMinYear,
  setMaxYear,
}) => {
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [evaluationStatuses, setEvaluationStatuses] = useState([]);
  const [inspectionStatuses, setInspectionStatuses] = useState([]);

  const [districtId, setDistrictId] = useState("");
  const [minBridgeLength, setMinBridgeLength] = useState("");
  const [maxBridgeLength, setMaxBridgeLength] = useState("");
  const [minSpanLength, setMinSpanLength] = useState("");
  const [maxSpanLength, setMaxSpanLength] = useState("");
  const [structureType, setStructureTypeState] = useState("");
  const [constructionType, setConstructionTypeState] = useState("");
  const [category, setCategoryState] = useState("");
  const [noOfSpan, setNoOfSpanState] = useState("");
  const [evaluationStatus, setEvaluationStatusState] = useState("");
  const [inspectionStatus, setInspectionStatusState] = useState("");
  const [minYear, setMinYearState] = useState("");
  const [maxYear, setMaxYearState] = useState("");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetching districts and zones
        const districtResponse = await fetch(`${BASE_URL}/api/districts`);
        const districtData = await districtResponse.json();
        setDistricts(districtData);

        // Fetch additional filters
        const structureTypeResponse = await fetch(
          `${BASE_URL}/api/structure-types`
        );
        const structureTypeData = await structureTypeResponse.json();
        setStructureTypes(structureTypeData);

        const constructionTypeResponse = await fetch(
          `${BASE_URL}/api/construction-types`
        );
        const constructionTypeData = await constructionTypeResponse.json();
        setConstructionTypes(constructionTypeData);

        const categoryResponse = await fetch(`${BASE_URL}/api/categories`);
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);

        const evaluationStatusResponse = await fetch(
          `${BASE_URL}/api/evaluation-statuses`
        );
        const evaluationStatusData = await evaluationStatusResponse.json();
        setEvaluationStatuses(evaluationStatusData);

        const inspectionStatusResponse = await fetch(
          `${BASE_URL}/api/inspection-statuses`
        );
        const inspectionStatusData = await inspectionStatusResponse.json();
        setInspectionStatuses(inspectionStatusData);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  // Handle handlers for various inputs
  const handleChange = (setter) => (e) => setter(e.target.value);

  return (
    <div className="p-4">
      
      {/* District Filter */}
      <div className="mb-4">
        <label
          htmlFor="district-filter"
          className="block text-gray-700 font-medium mb-1"
        >
          Select District
        </label>
        <select
          id="district-filter"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={districtId}
          onChange={handleChange(setDistrictId)}
        >
          <option value="%">--All Districts--</option>
          {districts.map((district) => (
            <option key={district.DistrictsID} value={district.DistrictsID}>
              {district.DistrictsName}
            </option>
          ))}
        </select>
      </div>

      {/* Bridge Min Length Filter */}
      <div className="mb-4">
        <label
          htmlFor="bridge-min-length"
          className="block text-gray-700 font-medium mb-1"
        >
          Bridge Min Length
        </label>
        <input
          id="bridge-min-length"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={minBridgeLength}
          onChange={handleChange(setMinBridgeLength)}
        />
      </div>

      {/* Bridge Max Length Filter */}
      <div className="mb-4">
        <label
          htmlFor="bridge-max-length"
          className="block text-gray-700 font-medium mb-1"
        >
          Bridge Max Length
        </label>
        <input
          id="bridge-max-length"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={maxBridgeLength}
          onChange={handleChange(setMaxBridgeLength)}
        />
      </div>

      {/* Span Min Length Filter */}
      <div className="mb-4">
        <label
          htmlFor="span-min-length"
          className="block text-gray-700 font-medium mb-1"
        >
          Span Min Length
        </label>
        <input
          id="span-min-length"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={minSpanLength}
          onChange={handleChange(setMinSpanLength)}
        />
      </div>

      {/* Span Max Length Filter */}
      <div className="mb-4">
        <label
          htmlFor="span-max-length"
          className="block text-gray-700 font-medium mb-1"
        >
          Span Max Length
        </label>
        <input
          id="span-max-length"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={maxSpanLength}
          onChange={handleChange(setMaxSpanLength)}
        />
      </div>

      {/* Structure Type Filter */}
      <div className="mb-4">
        <label
          htmlFor="structure-type"
          className="block text-gray-700 font-medium mb-1"
        >
          Structure Type
        </label>
        <select
          id="structure-type"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={structureType}
          onChange={handleChange(setStructureTypeState)}
        >
          <option value="%">--All Structure Types--</option>
          {structureTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Construction Type Filter */}
      <div className="mb-4">
        <label
          htmlFor="construction-type"
          className="block text-gray-700 font-medium mb-1"
        >
          Construction Type
        </label>
        <select
          id="construction-type"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={constructionType}
          onChange={handleChange(setConstructionTypeState)}
        >
          <option value="%">--All Construction Types--</option>
          {constructionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label
          htmlFor="category"
          className="block text-gray-700 font-medium mb-1"
        >
          Category
        </label>
        <select
          id="category"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={category}
          onChange={handleChange(setCategoryState)}
        >
          <option value="%">--All Categories--</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* No of Span Filter */}
      <div className="mb-4">
        <label
          htmlFor="no-of-span"
          className="block text-gray-700 font-medium mb-1"
        >
          No. of Span
        </label>
        <input
          id="no-of-span"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={noOfSpan}
          onChange={handleChange(setNoOfSpanState)}
        />
      </div>

      {/* Evaluation Status Filter */}
      <div className="mb-4">
        <label
          htmlFor="evaluation-status"
          className="block text-gray-700 font-medium mb-1"
        >
          Evaluation Status
        </label>
        <select
          id="evaluation-status"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={evaluationStatus}
          onChange={handleChange(setEvaluationStatusState)}
        >
          <option value="%">--All Evaluation Statuses--</option>
          {evaluationStatuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inspection Status Filter */}
      <div className="mb-4">
        <label
          htmlFor="inspection-status"
          className="block text-gray-700 font-medium mb-1"
        >
          Inspection Status
        </label>
        <select
          id="inspection-status"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={inspectionStatus}
          onChange={handleChange(setInspectionStatusState)}
        >
          <option value="%">--All Inspection Statuses--</option>
          {inspectionStatuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      {/* Min Year Filter */}
      <div className="mb-4">
        <label
          htmlFor="min-year"
          className="block text-gray-700 font-medium mb-1"
        >
          Min Year
        </label>
        <input
          id="min-year"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={minYear}
          onChange={handleChange(setMinYearState)}
        />
      </div>

      {/* Max Year Filter */}
      <div className="mb-4">
        <label
          htmlFor="max-year"
          className="block text-gray-700 font-medium mb-1"
        >
          Max Year
        </label>
        <input
          id="max-year"
          type="number"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={maxYear}
          onChange={handleChange(setMaxYearState)}
        />
      </div>

      {/* Apply Button */}
      <div className="text-right">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
          onClick={() => {
            setSelectedDistrict(districtId);
            setBridgeMinLength(minBridgeLength);
            setBridgeMaxLength(maxBridgeLength);
            setSpanMinLength(minSpanLength);
            setSpanMaxLength(maxSpanLength);
            setStructureType(structureType);
            setConstructionType(constructionType);
            setCategory(category);
            setNoOfSpan(noOfSpan);
            setEvaluationStatus(evaluationStatus);
            setInspectionStatus(inspectionStatus);
            setMinYear(minYear);
            setMaxYear(maxYear);
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
