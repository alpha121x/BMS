import { useState, useEffect } from 'react';

// Storage keys
const STORAGE_KEYS = {
  DISTRICT_ID: 'dashboard_filter_district_id',
  STRUCTURE_TYPE: 'dashboard_filter_structure_type',
  CONSTRUCTION_TYPE: 'dashboard_filter_construction_type',
  BRIDGE_NAME: 'dashboard_filter_bridge_name',
  BRIDGE_LENGTH: 'dashboard_filter_bridge_length',
  AGE: 'dashboard_filter_age',
  UNDER_FACILITY: 'dashboard_filter_under_facility',
  ROAD_CLASSIFICATION: 'dashboard_filter_road_classification',
  SPAN_LENGTH: 'dashboard_filter_span_length',
  INSPECTION_STATUS: 'dashboard_filter_inspection_status',
  ACTIVE_VIEW: 'dashboard_active_view',
};

// Helper function to get initial district ID from token
const getInitialDistrictId = () => {
  const userTokenRaw =
    sessionStorage.getItem("user") || sessionStorage.getItem("userEvaluation");
  if (userTokenRaw) {
    try {
      const parsedToken = JSON.parse(userTokenRaw);
      const district = parsedToken?.districtId?.toString();
      return !district || district === "0" ? "%" : district;
    } catch (err) {
      console.error("Invalid user token:", err);
    }
  }
  return "%";
};

// Helper functions for localStorage operations
const getStoredValue = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
  }
};

// Custom hook for persisted filters
const usePersistedFilters = () => {
  // Initialize all filter states with stored values or defaults
  const [districtId, setDistrictId] = useState(() => {
    const stored = getStoredValue(STORAGE_KEYS.DISTRICT_ID, null);
    return stored !== null ? stored : getInitialDistrictId();
  });

  const [structureType, setStructureType] = useState(() =>
    getStoredValue(STORAGE_KEYS.STRUCTURE_TYPE, "%")
  );

  const [constructionType, setConstructionType] = useState(() =>
    getStoredValue(STORAGE_KEYS.CONSTRUCTION_TYPE, "%")
  );

  const [bridgeName, setBridgeName] = useState(() =>
    getStoredValue(STORAGE_KEYS.BRIDGE_NAME, "")
  );

  const [bridgeLength, setBridgeLength] = useState(() =>
    getStoredValue(STORAGE_KEYS.BRIDGE_LENGTH, "%")
  );

  const [age, setAge] = useState(() =>
    getStoredValue(STORAGE_KEYS.AGE, "")
  );

  const [underFacility, setUnderFacility] = useState(() =>
    getStoredValue(STORAGE_KEYS.UNDER_FACILITY, "%")
  );

  const [roadClassification, setRoadClassification] = useState(() =>
    getStoredValue(STORAGE_KEYS.ROAD_CLASSIFICATION, "%")
  );

  const [spanLength, setSpanLength] = useState(() =>
    getStoredValue(STORAGE_KEYS.SPAN_LENGTH, "%")
  );

  const [inspectionStatus, setInspectionStatus] = useState(() =>
    getStoredValue(STORAGE_KEYS.INSPECTION_STATUS, "%")
  );

  const [activeView, setActiveView] = useState(() =>
    getStoredValue(STORAGE_KEYS.ACTIVE_VIEW, "inventory")
  );

  // Create wrapped setters that also update localStorage
  const createPersistedSetter = (setter, storageKey) => {
    return (value) => {
      setter(value);
      setStoredValue(storageKey, value);
    };
  };

  const persistedSetters = {
    setDistrictId: createPersistedSetter(setDistrictId, STORAGE_KEYS.DISTRICT_ID),
    setStructureType: createPersistedSetter(setStructureType, STORAGE_KEYS.STRUCTURE_TYPE),
    setConstructionType: createPersistedSetter(setConstructionType, STORAGE_KEYS.CONSTRUCTION_TYPE),
    setBridgeName: createPersistedSetter(setBridgeName, STORAGE_KEYS.BRIDGE_NAME),
    setBridgeLength: createPersistedSetter(setBridgeLength, STORAGE_KEYS.BRIDGE_LENGTH),
    setAge: createPersistedSetter(setAge, STORAGE_KEYS.AGE),
    setUnderFacility: createPersistedSetter(setUnderFacility, STORAGE_KEYS.UNDER_FACILITY),
    setRoadClassification: createPersistedSetter(setRoadClassification, STORAGE_KEYS.ROAD_CLASSIFICATION),
    setSpanLength: createPersistedSetter(setSpanLength, STORAGE_KEYS.SPAN_LENGTH),
    setInspectionStatus: createPersistedSetter(setInspectionStatus, STORAGE_KEYS.INSPECTION_STATUS),
    setActiveView: createPersistedSetter(setActiveView, STORAGE_KEYS.ACTIVE_VIEW),
  };

  // Function to clear all persisted filters (call this on logout)
  const clearPersistedFilters = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset to defaults
    const defaultDistrictId = getInitialDistrictId();
    setDistrictId(defaultDistrictId);
    setStructureType("%");
    setConstructionType("%");
    setBridgeName("");
    setBridgeLength("%");
    setAge("");
    setUnderFacility("%");
    setRoadClassification("%");
    setSpanLength("%");
    setInspectionStatus("%");
    setActiveView("inventory");
  };

  // Function to reset filters but keep them persisted
  const resetFilters = () => {
    const defaultDistrictId = getInitialDistrictId();
    persistedSetters.setDistrictId(defaultDistrictId);
    persistedSetters.setStructureType("%");
    persistedSetters.setConstructionType("%");
    persistedSetters.setBridgeName("");
    persistedSetters.setBridgeLength("%");
    persistedSetters.setAge("");
    persistedSetters.setUnderFacility("%");
    persistedSetters.setRoadClassification("%");
    persistedSetters.setSpanLength("%");
    persistedSetters.setInspectionStatus("%");
  };

  return {
    // Current filter values
    districtId,
    structureType,
    constructionType,
    bridgeName,
    bridgeLength,
    age,
    underFacility,
    roadClassification,
    spanLength,
    inspectionStatus,
    activeView,
    
    // Persisted setters
    ...persistedSetters,
    
    // Utility functions
    clearPersistedFilters,
    resetFilters,
  };
};

export default usePersistedFilters;