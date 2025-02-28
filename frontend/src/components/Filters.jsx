const Filters = ({ filters, setFilters, fetchData, showSearchButton = true }) => {
    // Update state dynamically when any filter changes
    const handleChange = (key, value) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    };
  
    // Handle search button click
    const handleSearch = () => {
      fetchData();
    };
  
    return (
      <div className="flex items-center gap-2 justify-between">
        {filters.map(({ key, label, type, options, placeholder }) => (
          <div key={key}>
            {type === "select" ? (
              <select
                className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
                value={setFilters[key] || "%"}
                onChange={(e) => handleChange(key, e.target.value)}
              >
                <option value="%">{`--Select ${label}--`}</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="w-full border border-[#3B82F6] rounded p-1 bg-gray-200"
                placeholder={placeholder}
                value={setFilters[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
  
        {/* Search Button (optional) */}
        {showSearchButton && (
          <button
            onClick={handleSearch}
            className="p-2 bg-[#3B82F6] text-white rounded hover:bg-blue-700"
          >
            <FaSearch />
          </button>
        )}
      </div>
    );
  };
  