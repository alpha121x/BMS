import React, { useState, useEffect } from "react";
import { BASE_URL } from "./config";

const FilterComponent = ({
  setSelectedDistrict,
  setMinBridgeLength, // Changed to match passed prop
  setMaxBridgeLength, // Changed to match passed prop
  setMinSpanLength, // Changed to match passed prop
  setMaxSpanLength, // Changed to match passed prop
  setStructureType,
  setConstructionType,
  setCategory,
  setEvaluationStatus,
  setInspectionStatus,
  setMinYear,
  setMaxYear,
  setBridge,
}) => {
  const [districts, setDistricts] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);
  const [constructionTypes, setConstructionTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [evaluationStatuses, setEvaluationStatuses] = useState([]);
  const [inspectionStatuses, setInspectionStatuses] = useState([]);

  const [districtId, setDistrictId] = useState("");
  const [localBridgeId, setLocalBridgeId] = useState("");
  const [bridgeId, setBridgeId] = useState("");
  const [minBridgeLength, setMinBridgeLengthState] = useState("");
  const [maxBridgeLength, setMaxBridgeLengthState] = useState("");
  const [minSpanLength, setMinSpanLengthState] = useState("");
  const [maxSpanLength, setMaxSpanLengthState] = useState("");
  const [structureType, setStructureTypeState] = useState("");
  const [constructionType, setConstructionTypeState] = useState("");
  const [category, setCategoryState] = useState("");
  const [evaluationStatus, setEvaluationStatusState] = useState("");
  const [inspectionStatus, setInspectionStatusState] = useState("");
  const [minYear, setMinYearState] = useState("");
  const [maxYear, setMaxYearState] = useState("");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetching districts
        const districtResponse = await fetch(`${BASE_URL}/api/districts`);
        const districtData = await districtResponse.json();
        setDistricts(
          districtData.map((district) => ({
            id: district.id,
            district: district.district || district.name, // Handle different property names
          }))
        );

        // Fetching structure types
        const structureTypeResponse = await fetch(
          `${BASE_URL}/api/structure-types`
        );
        const structureTypesData = await structureTypeResponse.json();

        // Assuming the response now directly gives the array
        setStructureTypes(
          structureTypesData.map((type) => ({
            id: type.id,
            name: type.structure_type || type.name, // Normalize the property name
          }))
        );

        // Fetching construction types
        const constructionTypeResponse = await fetch(
          `${BASE_URL}/api/construction-types`
        );
        const constructionTypeData = await constructionTypeResponse.json();

        // Assuming the response now directly gives the array
        setConstructionTypes(
          constructionTypeData.map((type) => ({
            id: type.id,
            name: type.construction_type || type.name, // Normalize the property name
          }))
        );

        // Fetching categories
        const categoryResponse = await fetch(`${BASE_URL}/api/categories`);
        const categoryData = await categoryResponse.json();
        setCategories(
          categoryData.map((cat) => ({
            id: cat.id,
            name: cat.category || cat.name, // Normalize the property name
          }))
        );

        // Fetching evaluation statuses
        const evaluationStatusResponse = await fetch(
          `${BASE_URL}/api/evaluation-statuses`
        );
        const evaluationStatusData = await evaluationStatusResponse.json();
        setEvaluationStatuses(
          evaluationStatusData.map((status) => ({
            id: status.id,
            name: status.evaluation_status || status.name, // Normalize the property name
          }))
        );

        // Fetching inspection statuses
        const inspectionStatusResponse = await fetch(
          `${BASE_URL}/api/inspection-statuses`
        );
        const inspectionStatusData = await inspectionStatusResponse.json();
        setInspectionStatuses(
          inspectionStatusData.map((status) => ({
            id: status.id,
            name: status.inspection_status || status.name, // Normalize the property name
          }))
        );
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
          {districts.map((district, index) => (
            <option key={district.id || index} value={district.id}>
              {district.district}
            </option>
          ))}
        </select>
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
          {structureTypes.map((type, index) => (
            <option key={type.id || index} value={type.id}>
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
          htmlFor="category-filter"
          className="block text-gray-700 font-medium mb-1"
        >
          Category
        </label>
        <select
          id="category-filter"
          className="w-full border rounded-md p-2 bg-gray-100"
          value={category}
          onChange={handleChange(setCategoryState)}
        >
          <option value="%">--All Categories--</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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

      {/* Bridge ID Filter */}
      <div className="flex mb-4 space-x-4">
        <div className="flex-1">
          <label
            htmlFor="bridge-id"
            className="block text-gray-700 font-medium mb-1"
          >
            Bridge ID
          </label>
          <input
            id="bridge-id"
            type="text"
            className="w-full border rounded-md p-2 bg-gray-100"
            value={localBridgeId}
            onChange={(e) => {
              const value = e.target.value;
              setLocalBridgeId(value);
            }}
            placeholder="Enter Bridge ID"
          />
        </div>
      </div>

      {/* Min and Max Year Filters */}
      <div className="flex mb-4 space-x-4">
        <div className="flex-1">
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
        <div className="flex-1">
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
      </div>

      {/* Min and Max Bridge Length Filters */}
      <div className="flex mb-4 space-x-4">
        <div className="flex-1">
          <label
            htmlFor="min-bridge-length"
            className="block text-gray-700 font-medium mb-1"
          >
            Min Bridge Length
          </label>
          <input
            id="min-bridge-length"
            type="number"
            className="w-full border rounded-md p-2 bg-gray-100"
            value={minBridgeLength}
            onChange={handleChange(setMinBridgeLengthState)}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="max-bridge-length"
            className="block text-gray-700 font-medium mb-1"
          >
            Max Bridge Length
          </label>
          <input
            id="max-bridge-length"
            type="number"
            className="w-full border rounded-md p-2 bg-gray-100"
            value={maxBridgeLength}
            onChange={handleChange(setMaxBridgeLengthState)}
          />
        </div>
      </div>

      {/* Min and Max Span Length Filters */}
      <div className="flex mb-4 space-x-4">
        <div className="flex-1">
          <label
            htmlFor="min-span-length"
            className="block text-gray-700 font-medium mb-1"
          >
            Min Span Length
          </label>
          <input
            id="min-span-length"
            type="number"
            className="w-full border rounded-md p-2 bg-gray-100"
            value={minSpanLength}
            onChange={handleChange(setMinSpanLengthState)}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="max-span-length"
            className="block text-gray-700 font-medium mb-1"
          >
            Max Span Length
          </label>
          <input
            id="max-span-length"
            type="number"
            className="w-full border rounded-md p-2 bg-gray-100"
            value={maxSpanLength}
            onChange={handleChange(setMaxSpanLengthState)}
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="text-right">
        <button
          onClick={() => {
            setSelectedDistrict(districtId);
            setMinBridgeLength(minBridgeLength);
            setMaxBridgeLength(maxBridgeLength);
            setMinSpanLength(minSpanLength);
            setMaxSpanLength(maxSpanLength);
            setStructureType(structureType);
            setConstructionType(constructionType);
            setCategory(category);
            setEvaluationStatus(evaluationStatus);
            setInspectionStatus(inspectionStatus);
            setMinYear(minYear);
            setMaxYear(maxYear);
            setBridge(localBridgeId);
          }}
          className="bg-blue-500 text-white rounded-md px-4 py-2"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
