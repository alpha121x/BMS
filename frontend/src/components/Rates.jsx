import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "./config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import "../index.css"; // Custom styles

const Rates = () => {
  const [ratesData, setRatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratesCount, setRatesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/rates/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const result = await response.json();
        if (result.success && Array.isArray(result.categories)) {
          setCategories(result.categories);
        } else {
          throw new Error("Invalid categories format");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedCategory
        ? `${BASE_URL}/api/rates?category=${encodeURIComponent(selectedCategory)}`
        : `${BASE_URL}/api/rates`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch rates data");

      const result = await response.json();
      if (Array.isArray(result.data)) {
        setRatesData(result.data);
        setRatesCount(result.data.length);
        setTotalItems(result.data.length);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { name: "Category", selector: (row) => row.category || "N/A", sortable: true },
    { name: "Structure Type", selector: (row) => row.structure_type || "N/A", sortable: true },
    { name: "Type of Defect", selector: (row) => row.type_of_defect || "N/A", sortable: true },
    { name: "Damage Severity", selector: (row) => row.damage_severity || "N/A", sortable: true },
    { name: "Repair Method", selector: (row) => row.repair_method || "N/A", sortable: true },
    { name: "Unit Rate", selector: (row) => row.unit_rate || "N/A", sortable: true },
    { name: "Quantity Assumed Per Span", selector: (row) => row.quantity_assumed_per_span || "N/A", sortable: true },
    { name: "Cost of Repair Per Span", selector: (row) => row.cost_of_repair_per_span ? parseFloat(row.cost_of_repair_per_span).toFixed(2) : "N/A", sortable: true }
  ];

  const handleDownloadCSV = async () => {
    try {
      const url = selectedCategory
        ? `${BASE_URL}/api/rates?category=${encodeURIComponent(selectedCategory)}`
        : `${BASE_URL}/api/rates`;
      const response = await fetch(url);
      const { data } = await response.json();

      if (!data.length) return;

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).map(val => `"${val}"`).join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Rates_Data${selectedCategory ? `_${selectedCategory}` : ''}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const url = selectedCategory
        ? `${BASE_URL}/api/rates?category=${encodeURIComponent(selectedCategory)}`
        : `${BASE_URL}/api/rates`;
      const response = await fetch(url);
      const { data } = await response.json();

      if (!data.length) return;

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rates Data");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Rates_Data${selectedCategory ? `_${selectedCategory}` : ''}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = ratesData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="container p-2 mt-3 bg-gray-200">
      <div className="card-header rounded-0 p-2" style={{ background: "#005D7F", color: "#fff" }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-4">
            <h5 className="mb-0">Rates</h5>
            <h6 className="mb-0">
              Rates Count:
              <span className="badge text-white ms-2" style={{ background: "#009CB8" }}>
                {ratesCount || 0}
              </span>
            </h6>
          </div>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            {/* Category Buttons */}
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`category-btn ${selectedCategory === null ? "active" : ""}`}
                onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="d-flex gap-2">
              <button className="export-btn csv" onClick={handleDownloadCSV}>
                <FontAwesomeIcon icon={faFileCsv} /> CSV
              </button>
              <button className="export-btn excel" onClick={handleDownloadExcel}>
                <FontAwesomeIcon icon={faFileExcel} /> Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0 pb-2">
        {loading ? (
          <p className="text-center mt-4">Loading...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
         <DataTable
            columns={columns}
            data={currentData}
            highlightOnHover
            responsive
            persistTableHead
            noDataComponent="No rates data available"
            customStyles={{
              table: {
                style: {
                  border: "1px solid #dee2e6",
                },
              },
              headRow: {
                style: {
                  backgroundColor: "#009DB9",
                  borderBottom: "2px solid #dee2e6",
                },
              },
              rows: {
                style: {
                  borderBottom: "1px solid #dee2e6",
                },
                stripedStyle: {
                  backgroundColor: "#f2f2f2", // stripe effect
                },
              },
              cells: {
                style: {
                  borderRight: "1px solid #dee2e6",
                },
              },
            }}
            striped
          />

        )}
      </div>
    </section>
  );
};

export default Rates;
