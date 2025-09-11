// Utility function to handle logout and clear filters
import usePersistedFilters from '../hooks/usePersistedFilters';

// Call this function when user logs out
export const handleLogout = () => {
  // Clear user session data
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userEvaluation');
  
  // Clear persisted filters
  const storageKeys = [
    'dashboard_filter_district_id',
    'dashboard_filter_structure_type',
    'dashboard_filter_construction_type',
    'dashboard_filter_bridge_name',
    'dashboard_filter_bridge_length',
    'dashboard_filter_age',
    'dashboard_filter_under_facility',
    'dashboard_filter_road_classification',
    'dashboard_filter_span_length',
    'dashboard_filter_inspection_status',
    'dashboard_active_view',
  ];
  
  storageKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Redirect to login page or home
  // window.location.href = '/login';
};

// Hook version for use in components
export const useLogout = () => {
  const logout = () => {
    handleLogout();
  };
  
  return logout;
};

export default handleLogout;