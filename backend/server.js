const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const JWT_SECRET = "123456789";

const app = express();
const port = process.env.PORT || 8081;

// Use built-in middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Pool Connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Check Database Connection
pool
  .connect()
  .then((client) => {
    console.log("Connected to the database successfully.");
    client.release();
  })
  .catch((err) => console.error("Database connection error:", err.stack));

// Login API Endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query to fetch user details from tbl_users_web
    const query = `
    SELECT id, username, password,phone_num, email, id, is_active
    FROM bms.tbl_users
    WHERE username = $1 AND is_active::boolean = true
    LIMIT 1
`;

    // Run the query with the provided username
    const result = await pool.query(query, [username]);

    // If no user is found or user is not active
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Direct password comparison (In production, use hashed comparison)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role_id,
        phoneNum: user.phone_num,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send token and user details (excluding password)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_id,
        email: user.email,
        phoneNum: user.phone_num,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// LoginEvaluation API Endpoint
app.post("/api/loginEvaluation", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query to fetch user details from tbl_users_web
    const query = `
    SELECT id, username, password,  phone_num,  email, id, is_active
    FROM bms.tbl_users
    WHERE username = $1 AND is_active::boolean = true
    LIMIT 1
`;

    // Run the query with the provided username
    const result = await pool.query(query, [username]);

    // If no user is found or user is not active
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Direct password comparison (In production, use hashed comparison)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role_id,
        phoneNum: user.phone_num,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send token and user details (excluding password)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_id,
        email: user.email,
        phoneNum: user.phone_num,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API Endpoint
app.get("/api/bms-score", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
  const offset = (page - 1) * limit;

  try {
    const query = `
    SELECT 
        c.objectid AS uu_bms_id, 
        c.damage_score, 
        c.critical_damage_score,
        c.inventory_score,
        m.structure_no, 
        m.structure_type_id, 
        m.structure_type, 
        m.road_name, 
        m.road_name_cwd, 
        m.route_id, 
        m.survey_id, 
        m.surveyor_name, 
        m.district_id, 
        m.district, 
        m.road_classification, 
        m.road_surface_type, 
        m.carriageway_type, 
        m.direction, 
        m.visual_condition, 
        m.construction_type_id, 
        m.construction_type, 
        m.no_of_span, 
        m.span_length_m, 
        m.structure_width_m, 
        m.construction_year, 
        m.last_maintenance_date, 
        m.remarks, 
        m.is_surveyed, 
        m.x_centroid, 
        m.y_centroid, 
        m.images_spans,
        CONCAT(m.pms_sec_id, ',', m.structure_no) AS bridge_name,
        ARRAY[m.image_1, m.image_2, m.image_3, m.image_4, m.image_5] AS photos
    FROM 
        bms.bms_calculations c
    LEFT JOIN 
        bms.tbl_bms_master_data m 
    ON 
        c.objectid = m.id
    ORDER BY c.objectid
    LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, [limit, offset]);

    // Query to get total records
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM bms.bms_calculations c 
      LEFT JOIN bms.tbl_bms_master_data m
      ON c.objectid = m.id;
    `;
    const countResult = await pool.query(countQuery);
    const totalRecords = countResult.rows[0].total;

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API Endpoint for Exporting Full BMS Data (No Limits)
app.get("/api/bms-score-export", async (req, res) => {
  try {
    const query = `
    SELECT 
    CONCAT('"', m.pms_sec_id, ',', m.structure_no, '"') AS "BridgeName",
    m.district,
    c.damage_score, 
    c.critical_damage_score,
    c.inventory_score
FROM 
    bms.bms_calculations c
LEFT JOIN 
    bms.tbl_bms_master_data m 
ON 
    c.objectid = m.id
ORDER BY c.objectid;
    `;

    const result = await pool.query(query);

    res.json({
      totalRecords: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching export data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to get counts for structure types and total "Arch" construction types
app.get("/api/structure-counts", async (req, res) => {
  try {
    // 1. Count of each structure_type
    const structureTypeCounts = await pool.query(`
      SELECT structure_type, COUNT(*) AS count
      FROM bms.tbl_bms_master_data
      GROUP BY structure_type
      ORDER BY count DESC;
    `);

    // 2. Total count of all records (for structure_type)
    const totalStructureCount = await pool.query(`
      SELECT COUNT(*) AS total_count
      FROM bms.tbl_bms_master_data;
    `);

    // Return all the counts as a single JSON response
    res.json({
      structureTypeCounts: structureTypeCounts.rows,
      totalStructureCount: totalStructureCount.rows[0].total_count,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/structure-counts-inspected", async (req, res) => {
  try {
    const query = `
      WITH inspected_structures AS (
        SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f
      )
      SELECT 
        m.structure_type, 
        COUNT(*) AS count
      FROM bms.tbl_bms_master_data m
      JOIN inspected_structures i ON m.uu_bms_id = i.uu_bms_id
      GROUP BY m.structure_type
      ORDER BY count DESC;
    `;

    const totalQuery = `
      SELECT COUNT(*) AS total_count
      FROM bms.tbl_bms_master_data m
      JOIN (
        SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f
      ) i ON m.uu_bms_id = i.uu_bms_id;
    `;

    const structureTypeCounts = await pool.query(query);
    const totalStructureCount = await pool.query(totalQuery);

    res.json({
      structureTypeCounts: structureTypeCounts.rows,
      totalStructureCount: totalStructureCount.rows[0]?.total_count || 0,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // Define the API endpoint to get data from `bms.tbl_bms_master_data`
// app.get("/api/bridgesdownload", async (req, res) => {
//   try {
//     const {
//       district = "%",
//       structureType,
//       constructionType,
//       minBridgeLength,
//       maxBridgeLength,
//       minSpanLength,
//       maxSpanLength,
//       minYear,
//       maxYear,
//     } = req.query;

//     let query = `
//       SELECT
//         uu_bms_id,
//         pms_sec_id,
//         structure_no,
//         structure_type_id,
//         structure_type,
//         road_name,
//         road_name_cwd,
//         route_id,
//         survey_id,
//         surveyor_name,
//         district_id,
//         district,
//         road_classification,
//         road_surface_type,
//         carriageway_type,
//         direction,
//         visual_condition,
//         construction_type_id,
//         construction_type,
//         no_of_span,
//         span_length_m,
//         structure_width_m,
//         construction_year,
//         last_maintenance_date,
//         remarks,
//         is_surveyed,
//         x_centroid,
//         y_centroid,
//         images_spans,
//         CONCAT(pms_sec_id, ',', structure_no) AS bridge_name,
//         ARRAY[image_1, image_2, image_3, image_4, image_5] AS photos
//       FROM bms.tbl_bms_master_data
//       WHERE 1=1
//     `;

//     const queryParams = [];
//     let paramIndex = 1;

//     // Filter by district
//     if (district !== "%") {
//       query += ` AND district_id = $${paramIndex}`;
//       queryParams.push(district);
//       paramIndex++;
//     }

//     // Filter by structure type
//     if (structureType) {
//       query += ` AND structure_type_id = $${paramIndex}`;
//       queryParams.push(structureType);
//       paramIndex++;
//     }

//     // Filter by construction type
//     if (constructionType) {
//       query += ` AND construction_type_id = $${paramIndex}`;
//       queryParams.push(constructionType);
//       paramIndex++;
//     }

//     // Filter by bridge width (min and max)
//     if (minBridgeLength) {
//       query += ` AND structure_width_m >= $${paramIndex}`;
//       queryParams.push(minBridgeLength);
//       paramIndex++;
//     }
//     if (maxBridgeLength) {
//       query += ` AND structure_width_m <= $${paramIndex}`;
//       queryParams.push(maxBridgeLength);
//       paramIndex++;
//     }

//     // Filter by span length (min and max)
//     if (minSpanLength) {
//       query += ` AND span_length_m >= $${paramIndex}`;
//       queryParams.push(minSpanLength);
//       paramIndex++;
//     }
//     if (maxSpanLength) {
//       query += ` AND span_length_m <= $${paramIndex}`;
//       queryParams.push(maxSpanLength);
//       paramIndex++;
//     }

//     // Filter by construction year (min and max)
//     if (minYear) {
//       query += ` AND construction_year >= $${paramIndex}`;
//       queryParams.push(minYear);
//       paramIndex++;
//     }
//     if (maxYear) {
//       query += ` AND construction_year <= $${paramIndex}`;
//       queryParams.push(maxYear);
//       paramIndex++;
//     }

//     // Execute the query without pagination (no OFFSET and LIMIT)
//     const result = await pool.query(query, queryParams);

//     // Send the result as the response
//     res.json({
//       success: true,
//       bridges: result.rows,
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching data from the database",
//     });
//   }
// });

app.get("/api/districtExtent", async (req, res) => {
  try {
    const { districtId = "%" } = req.query; // Get districtId from query parameters, default to "%"

    // SQL query to fetch the required data based on districtId
    let query = `
      SELECT gid, __gid, ____gid, district_n, div_name, geom , district_id,
      FROM public.punjab_district_boundary
    `;

    if (districtId !== "%") {
      query += ` WHERE district_id = $1`; // Modify the query to filter by districtId if it's not "%"
    }

    const values = districtId !== "%" ? [districtId] : [];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.json({
        success: true,
        data: result.rows, // Send the rows returned by the query
      });
    } else {
      res.status(404).json({
        success: false,
        message: "District not found",
      });
    }
  } catch (err) {
    console.error("Error fetching district data", err);
    res.status(500).json({
      success: false,
      message: "Error fetching district data",
      error: err.message,
    });
  }
});

// bridges details download for dashboard main
app.get("/api/bridgesdownloadNew", async (req, res) => {
  try {
    const {
      district = "%",
      structureType = "%",
      constructionType = "%",
      inspectionStatus = "%",
      minBridgeLength,
      maxBridgeLength,
      minSpanLength,
      maxSpanLength,
      minYear,
      maxYear,
      bridge = "%",
      category = "%",
    } = req.query;

    let query = `
    SELECT CONCAT(md.pms_sec_id, ',', md.structure_no) AS bridge_name, md.structure_type_id, md.structure_type, md.road_no, md.road_name_id, md.road_name, md.road_name_cwd, 
           md.road_code_cwd, md.route_id, md.survey_id, md.pms_start, md.pms_end, md.survey_chainage_start, md.survey_chainage_end, 
           md.pms_sec_id, md.structure_no, md.surveyor_name, md.zone_id, md.zone, md.district_id, md.district, 
           md.road_classification_id, md.road_classification, md.road_surface_type_id, md.road_surface_type, md.carriageway_type_id, 
           md.carriageway_type, md.direction, md.visual_condition, md.construction_type_id, md.construction_type, md.no_of_span, 
           md.span_length_m, md.structure_width_m, md.construction_year, md.last_maintenance_date, md.data_source, md.date_time, 
           md.remarks, f.surveyed_by, f."SpanIndex", f."WorkKindID", f."WorkKindName", f."PartsID", f."PartsName", 
           f."MaterialID", f."MaterialName", f."DamageKindID", f."DamageKindName", f."DamageLevelID", f."DamageLevel", 
           f.damage_extent, f."Remarks", f.current_date_time, 
           ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
           COALESCE(f."photopath"::jsonb, '[]'::jsonb) AS "Inspection Photos"
    FROM bms.tbl_bms_master_data md
    LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
    WHERE 1=1
  `;

    const queryParams = [];
    let paramIndex = 1;

    // Convert and sanitize query params
    const parseNumber = (value) =>
      value && !isNaN(value) ? Number(value) : null;

    // Apply filters
    if (district !== "%" && district !== "") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(parseNumber(district));
      paramIndex++;
    }

    if (inspectionStatus === "yes") {
      query += ` AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    } else if (inspectionStatus === "no") {
      query += ` AND uu_bms_id NOT IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    }

    if (category) {
      query += ` AND md.visual_condition ILIKE $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (structureType) {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(parseNumber(structureType));
      paramIndex++;
    }

    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridge}%`);
      paramIndex++;
    }

    if (inspectionStatus === "yes") {
      query += ` AND md.uu_bms_id IN (SELECT DISTINCT f.uu_bms_id FROM bms.tbl_inspection_f)`;
    } else if (inspectionStatus === "no") {
      query += ` AND md.uu_bms_id NOT IN (SELECT DISTINCT f.uu_bms_id FROM bms.tbl_inspection_f)`;
    }

    if (constructionType) {
      query += ` AND md.construction_type_id = $${paramIndex}`;
      queryParams.push(parseNumber(constructionType));
      paramIndex++;
    }

    if (minBridgeLength) {
      query += ` AND md.structure_width_m >= $${paramIndex}`;
      queryParams.push(parseNumber(minBridgeLength));
      paramIndex++;
    }

    if (maxBridgeLength) {
      query += ` AND md.structure_width_m <= $${paramIndex}`;
      queryParams.push(parseNumber(maxBridgeLength));
      paramIndex++;
    }

    if (minSpanLength) {
      query += ` AND md.span_length_m >= $${paramIndex}`;
      queryParams.push(parseNumber(minSpanLength));
      paramIndex++;
    }

    if (maxSpanLength) {
      query += ` AND md.span_length_m <= $${paramIndex}`;
      queryParams.push(parseNumber(maxSpanLength));
      paramIndex++;
    }

    if (minYear) {
      query += ` AND md.construction_year >= $${paramIndex}`;
      queryParams.push(parseNumber(minYear));
      paramIndex++;
    }

    if (maxYear) {
      query += ` AND md.construction_year <= $${paramIndex}`;
      queryParams.push(parseNumber(maxYear));
      paramIndex++;
    }

    const result = await pool.query(query, queryParams);
    res.json({ success: true, bridges: result.rows });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// briges details download for evaluation module
app.get("/api/bridgesdownloadNeww", async (req, res) => {
  try {
    const {
      district = "%",
      structureType = "%",
      constructionType = "%",
      inspectionStatus = "%",
      minBridgeLength,
      maxBridgeLength,
      minSpanLength,
      maxSpanLength,
      minYear,
      maxYear,
      bridge = "%",
      category = "%",
    } = req.query;

    let query = `
    SELECT CONCAT(md.pms_sec_id, ',', md.structure_no) AS bridge_name, md.structure_type_id, md.structure_type, 
           md.road_no, md.road_name_id, md.road_name, md.road_name_cwd, md.road_code_cwd, md.route_id, 
           md.survey_id, md.pms_start, md.pms_end, md.survey_chainage_start, md.survey_chainage_end, 
           md.pms_sec_id, md.structure_no, md.surveyor_name, md.zone_id, md.zone, md.district_id, md.district, 
           md.road_classification_id, md.road_classification, md.road_surface_type_id, md.road_surface_type, 
           md.carriageway_type_id, md.carriageway_type, md.direction, md.visual_condition, 
           md.construction_type_id, md.construction_type, md.no_of_span, md.span_length_m, md.structure_width_m, 
           md.construction_year, md.last_maintenance_date, md.data_source, md.date_time, md.remarks, 
           f.surveyed_by, f."SpanIndex", f."WorkKindID", f."WorkKindName", f."PartsID", f."PartsName", 
           f."MaterialID", f."MaterialName", f."DamageKindID", f."DamageKindName", f."DamageLevelID", 
           f."DamageLevel", f.damage_extent, f."Remarks", f.current_date_time, 
           ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
         COALESCE(string_to_array(f.inspection_images, ','), '{}') AS "Inspection Photos"
    FROM bms.tbl_bms_master_data md
    LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
    WHERE 1=1
    AND md.uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)
  `;

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridge}%`);
      paramIndex++;
    }

    if (inspectionStatus === "yes") {
      query += ` AND md.uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    } else if (inspectionStatus === "no") {
      query += ` AND md.uu_bms_id NOT IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    }

    if (category) {
      query += ` AND md.visual_condition ILIKE $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (structureType) {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    if (constructionType) {
      query += ` AND md.construction_type_id = $${paramIndex}`;
      queryParams.push(constructionType);
      paramIndex++;
    }

    if (minBridgeLength) {
      query += ` AND md.structure_width_m >= $${paramIndex}`;
      queryParams.push(minBridgeLength);
      paramIndex++;
    }

    if (maxBridgeLength) {
      query += ` AND md.structure_width_m <= $${paramIndex}`;
      queryParams.push(maxBridgeLength);
      paramIndex++;
    }

    if (minSpanLength) {
      query += ` AND md.span_length_m >= $${paramIndex}`;
      queryParams.push(minSpanLength);
      paramIndex++;
    }

    if (maxSpanLength) {
      query += ` AND md.span_length_m <= $${paramIndex}`;
      queryParams.push(maxSpanLength);
      paramIndex++;
    }

    if (minYear) {
      query += ` AND md.construction_year >= $${paramIndex}`;
      queryParams.push(minYear);
      paramIndex++;
    }

    if (maxYear) {
      query += ` AND md.construction_year <= $${paramIndex}`;
      queryParams.push(maxYear);
      paramIndex++;
    }

    query += ` ORDER BY md.uu_bms_id`;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      bridges: result.rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// inspection download for a specific bridge and dashboard + evaluation module
app.get("/api/inspections-export", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    let query = `
           SELECT md.uu_bms_id AS "Reference No:", CONCAT(md.pms_sec_id, ',', md.structure_no) AS bridge_name, md.structure_type, md.road_no,md.road_name, 
           md.road_name_cwd, md.road_code_cwd, md.route_id, md.survey_id, md.pms_sec_id, md.structure_no, md.surveyor_name, 
           md.zone, md.district, md.road_classification, md.road_surface_type, md.carriageway_type, md.direction, 
           md.visual_condition, md.construction_type, md.no_of_span, md.span_length_m, 
           md.structure_width_m, md.construction_year, md.last_maintenance_date, md.data_source, md.date_time, 
           md.remarks,
           ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
            f.surveyed_by, f."SpanIndex", f."WorkKindID", f."WorkKindName", f."PartsID", f."PartsName", 
           f."MaterialID", f."MaterialName", f."DamageKindID", f."DamageKindName", f."DamageLevelID", f."DamageLevel", 
           f.damage_extent, f."Remarks", f.current_date_time, 
           f.inspection_images AS "PhotoPaths"
    FROM bms.tbl_bms_master_data md
    LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
    WHERE 1=1`;

    const queryParams = [];
    if (bridgeId && !isNaN(bridgeId)) {
      query += ` AND md.uu_bms_id = $1`;
      queryParams.push(Number(bridgeId));
    }

    const result = await pool.query(query, queryParams);

    // Process the "PhotoPaths" to extract only URLs
    const processedData = result.rows.map(row => {
      let extractedPhotoPaths = [];

      try {
        if (row.PhotoPaths) {
          // Fix any formatting issues before parsing
          const cleanedJson = row.PhotoPaths.replace(/\"\{/g, '{').replace(/\}\"/g, '}'); 
          const parsedPhotos = JSON.parse(cleanedJson);

          // Loop through the object and extract all image URLs
          Object.values(parsedPhotos).forEach(category => {
            Object.values(category).forEach(imagesArray => {
              extractedPhotoPaths.push(...imagesArray);
            });
          });
        }
      } catch (error) {
        console.error("Error parsing PhotoPaths:", error);
      }

      return {
        ...row,
        PhotoPaths: extractedPhotoPaths, // Replace nested structure with a simple array
      };
    });

    res.json({ success: true, bridges: processedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// bridges list for dashboard main
app.get("/api/bridges", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = "%",
      structureType = "%",
      constructionType = "%",
      inspectionStatus = "%",
      minBridgeLength,
      maxBridgeLength,
      minSpanLength,
      maxSpanLength,
      minYear,
      maxYear,
      bridge = "%",
      category = "%",
    } = req.query;

    let query = `
      SELECT 
        uu_bms_id,
        surveyed_by, 
        pms_sec_id, 
        structure_no, 
        structure_type_id, 
        structure_type, 
        road_name, 
        road_name_cwd, 
        route_id, 
        survey_id, 
        surveyor_name, 
        district_id, 
        district, 
        road_classification, 
        road_surface_type, 
        carriageway_type, 
        direction, 
        data_source, 
        date_time, 
        visual_condition, 
        construction_type_id, 
        construction_type, 
        no_of_span, 
        span_length_m, 
        structure_width_m, 
        construction_year, 
        last_maintenance_date, 
        remarks, 
        is_surveyed, 
        x_centroid, 
        y_centroid, 
        images_spans,
        CONCAT(pms_sec_id, ',', structure_no) AS bridge_name,
        ARRAY[image_1, image_2, image_3, image_4, image_5] AS photos
      FROM bms.tbl_bms_master_data
      WHERE 1=1 
    `;

    let countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
      WHERE 1=1
    `;

    const queryParams = [];
    const countParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND district_id = $${paramIndex}`;
      countQuery += ` AND district_id = $${paramIndex}`;
      queryParams.push(district);
      countParams.push(district);
      paramIndex++;
    }

    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridge}%`);
      countParams.push(`%${bridge}%`);
      paramIndex++;
    }

    if (structureType) {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
      paramIndex++;
    }

    if (category) {
      query += ` AND visual_condition ILIKE $${paramIndex}`;
      countQuery += ` AND visual_condition ILIKE $${paramIndex}`;
      queryParams.push(category);
      countParams.push(category);
      paramIndex++;
    }

    if (constructionType) {
      query += ` AND construction_type_id = $${paramIndex}`;
      countQuery += ` AND construction_type_id = $${paramIndex}`;
      queryParams.push(constructionType);
      countParams.push(constructionType);
      paramIndex++;
    }

    if (inspectionStatus === "yes") {
      query += ` AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
      countQuery += ` AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    } else if (inspectionStatus === "no") {
      query += ` AND uu_bms_id NOT IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
      countQuery += ` AND uu_bms_id NOT IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    }

    if (minBridgeLength) {
      query += ` AND structure_width_m >= $${paramIndex}`;
      countQuery += ` AND structure_width_m >= $${paramIndex}`;
      queryParams.push(minBridgeLength);
      countParams.push(minBridgeLength);
      paramIndex++;
    }
    if (maxBridgeLength) {
      query += ` AND structure_width_m <= $${paramIndex}`;
      countQuery += ` AND structure_width_m <= $${paramIndex}`;
      queryParams.push(maxBridgeLength);
      countParams.push(maxBridgeLength);
      paramIndex++;
    }
    if (minSpanLength) {
      query += ` AND span_length_m >= $${paramIndex}`;
      countQuery += ` AND span_length_m >= $${paramIndex}`;
      queryParams.push(minSpanLength);
      countParams.push(minSpanLength);
      paramIndex++;
    }
    if (maxSpanLength) {
      query += ` AND span_length_m <= $${paramIndex}`;
      countQuery += ` AND span_length_m <= $${paramIndex}`;
      queryParams.push(maxSpanLength);
      countParams.push(maxSpanLength);
      paramIndex++;
    }
    if (minYear) {
      query += ` AND construction_year >= $${paramIndex}`;
      countQuery += ` AND construction_year >= $${paramIndex}`;
      queryParams.push(minYear);
      countParams.push(minYear);
      paramIndex++;
    }
    if (maxYear) {
      query += ` AND construction_year <= $${paramIndex}`;
      countQuery += ` AND construction_year <= $${paramIndex}`;
      queryParams.push(maxYear);
      countParams.push(maxYear);
      paramIndex++;
    }

    query += ` ORDER BY uu_bms_id OFFSET $${paramIndex} LIMIT $${
      paramIndex + 1
    }`;
    queryParams.push(parseInt(set, 10), parseInt(limit, 10));

    const result = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      bridges: result.rows,
      totalCount: parseInt(countResult.rows[0].totalcount, 10),
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// bridges list for evaluation module
app.get("/api/bridgesNew", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = "%",
      structureType = "%",
      constructionType = "%",
      inspectionStatus = "%",
      minBridgeLength,
      maxBridgeLength,
      minSpanLength,
      maxSpanLength,
      minYear,
      maxYear,
      bridge = "%",
      category = "%",
    } = req.query;

    let query = `
SELECT 
        uu_bms_id, surveyed_by,
        pms_sec_id, 
        structure_no, 
        structure_type_id, 
        structure_type, 
        road_name, 
        road_name_cwd, 
        route_id, 
        survey_id, 
        surveyor_name, 
        district_id, 
        district, 
        road_classification, 
        road_surface_type, 
        carriageway_type, 
        direction, 
        visual_condition, 
        construction_type_id, 
        construction_type, 
        no_of_span,
        data_source, 
        date_time, 
        span_length_m, 
        structure_width_m, 
        construction_year, 
        last_maintenance_date, 
        remarks, 
        is_surveyed, 
        x_centroid, 
        y_centroid, 
        images_spans,
        CONCAT(pms_sec_id, ',', structure_no) AS bridge_name,
        ARRAY[image_1, image_2, image_3, image_4, image_5] AS photos
      FROM bms.tbl_bms_master_data
      WHERE 1=1 
	  AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)
    `;

    let countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
      WHERE 1=1
      AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)
    `;

    const queryParams = [];
    const countParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND district_id = $${paramIndex}`;
      countQuery += ` AND district_id = $${paramIndex}`;
      queryParams.push(district);
      countParams.push(district);
      paramIndex++;
    }

    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridge}%`);
      countParams.push(`%${bridge}%`);
      paramIndex++;
    }

    if (inspectionStatus === "yes") {
      query += ` AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
      countQuery += ` AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    } else if (inspectionStatus === "no") {
      query += ` AND uu_bms_id NOT IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
      countQuery += ` AND uu_bms_id NOT IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f)`;
    }

    if (category) {
      query += ` AND visual_condition ILIKE $${paramIndex}`;
      countQuery += ` AND visual_condition ILIKE $${paramIndex}`;
      queryParams.push(category);
      countParams.push(category);
      paramIndex++;
    }

    if (structureType) {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
      paramIndex++;
    }
    if (constructionType) {
      query += ` AND construction_type_id = $${paramIndex}`;
      countQuery += ` AND construction_type_id = $${paramIndex}`;
      queryParams.push(constructionType);
      countParams.push(constructionType);
      paramIndex++;
    }
    if (minBridgeLength) {
      query += ` AND structure_width_m >= $${paramIndex}`;
      countQuery += ` AND structure_width_m >= $${paramIndex}`;
      queryParams.push(minBridgeLength);
      countParams.push(minBridgeLength);
      paramIndex++;
    }
    if (maxBridgeLength) {
      query += ` AND structure_width_m <= $${paramIndex}`;
      countQuery += ` AND structure_width_m <= $${paramIndex}`;
      queryParams.push(maxBridgeLength);
      countParams.push(maxBridgeLength);
      paramIndex++;
    }
    if (minSpanLength) {
      query += ` AND span_length_m >= $${paramIndex}`;
      countQuery += ` AND span_length_m >= $${paramIndex}`;
      queryParams.push(minSpanLength);
      countParams.push(minSpanLength);
      paramIndex++;
    }
    if (maxSpanLength) {
      query += ` AND span_length_m <= $${paramIndex}`;
      countQuery += ` AND span_length_m <= $${paramIndex}`;
      queryParams.push(maxSpanLength);
      countParams.push(maxSpanLength);
      paramIndex++;
    }
    if (minYear) {
      query += ` AND construction_year >= $${paramIndex}`;
      countQuery += ` AND construction_year >= $${paramIndex}`;
      queryParams.push(minYear);
      countParams.push(minYear);
      paramIndex++;
    }
    if (maxYear) {
      query += ` AND construction_year <= $${paramIndex}`;
      countQuery += ` AND construction_year <= $${paramIndex}`;
      queryParams.push(maxYear);
      countParams.push(maxYear);
      paramIndex++;
    }

    query += ` ORDER BY uu_bms_id OFFSET $${paramIndex} LIMIT $${
      paramIndex + 1
    }`;
    queryParams.push(parseInt(set, 10), parseInt(limit, 10));

    const result = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      bridges: result.rows,
      totalCount: parseInt(countResult.rows[0].totalcount, 10),
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// inspections for table dashboard
app.get("/api/inspections", async (req, res) => {
  try {
    // Extract and validate query parameters
    let { district, bridge } = req.query;

    // Base query
    let query = `
      SELECT 
        bmd."pms_sec_id", 
        bmd."structure_no",
        CONCAT(bmd."pms_sec_id", ',', bmd."structure_no") AS bridge_name, 
        ins."SpanIndex",
        ins."district_id", 
        ins."WorkKindName", 
        ins."PartsName", 
        ins."MaterialName", 
        ins."DamageKindName", 
        ins."DamageLevel", 
        ins."damage_extent",  
        ins."Remarks", 
        ins.inspection_images AS "PhotoPaths",
        ins."ApprovedFlag"
      FROM bms.tbl_inspection_f AS ins
      JOIN bms.tbl_bms_master_data AS bmd 
      ON ins."uu_bms_id" = bmd."uu_bms_id"
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Ensure `district` is a valid number before adding it
    if (district && !isNaN(parseInt(district))) {
      query += ` AND ins."district_id" = $${paramIndex}`;
      queryParams.push(parseInt(district)); // Convert to integer
      paramIndex++;
    }

    // Validate `bridge`
    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(bmd."pms_sec_id", ',', bmd."structure_no") ILIKE $${paramIndex}`;
      queryParams.push(`%${bridge}%`);
      paramIndex++;
    }

    const result = await pool.query(query, queryParams);

    // Process the "PhotoPaths" to extract only URLs
    const processedData = result.rows.map(row => {
      let extractedPhotoPaths = [];

      try {
        if (row.PhotoPaths) {
          // Fix any formatting issues before parsing
          const cleanedJson = row.PhotoPaths.replace(/\"\{/g, '{').replace(/\}\"/g, '}'); 
          const parsedPhotos = JSON.parse(cleanedJson);

          // Loop through the object and extract all image URLs
          Object.values(parsedPhotos).forEach(category => {
            Object.values(category).forEach(imagesArray => {
              extractedPhotoPaths.push(...imagesArray);
            });
          });
        }
      } catch (error) {
        console.error("Error parsing PhotoPaths:", error);
      }

      return {
        ...row,
        PhotoPaths: extractedPhotoPaths, // Replace nested structure with a simple array
      };
    });

    res.json({ success: true, data: processedData });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// for both(C+R) summary data
app.get("/api/get-summary", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    if (!bridgeId) {
      return res
        .status(400)
        .json({ success: false, message: "uu_bms_id is required" });
    }

    const query = `
      SELECT 
        uu_bms_id,
        surveyed_by,
        damage_extent,
        inspection_id,
        qc_con,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        "inspection_images" AS "PhotoPaths",
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
      ORDER BY inspection_id DESC;
    `;

    const { rows } = await pool.query(query, [bridgeId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Inspection not found" });
    }

    // Process the rows to convert inspection_images to an array
    const modifiedRows = rows.map((row) => {
      let extractedPhotoPaths = [];

      try {
        if (row.PhotoPaths) {
          // Ensure JSON is properly formatted before parsing
          const cleanedJson = row.PhotoPaths.replace(/\"\{/g, '{').replace(/\}\"/g, '}'); 
          const parsedPhotos = JSON.parse(cleanedJson);

          // Extract all image URLs from the nested object
          Object.values(parsedPhotos).forEach(category => {
            Object.values(category).forEach(imagesArray => {
              extractedPhotoPaths.push(...imagesArray);
            });
          });
        }
      } catch (error) {
        console.error("Error parsing PhotoPaths:", error);
      }

      return {
        ...row,
        PhotoPaths: extractedPhotoPaths, // Replace nested structure with a simple array
        ApprovedFlag: row.ApprovedFlag === 1 ? "Approved" : "Unapproved",
      };
    });

    res.status(200).json({ success: true, data: modifiedRows });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/get-inspections", async (req, res) => {
  try {
    const { bridgeId } = req.query; // Get uu_bms_id from query parameters

    if (!bridgeId) {
      return res
        .status(400)
        .json({ success: false, message: "uu_bms_id is required" });
    }

    const pendingQuery = `
      SELECT 
        uu_bms_id,
        inspection_id,
        surveyed_by,
        damage_extent,
        qc_con,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
      AND qc_con = '1'
      ORDER BY inspection_id DESC;
    `;

    const approvedQuery = `
      SELECT 
        uu_bms_id,
        inspection_id,
        qc_con,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
      AND qc_con = '2'
      ORDER BY inspection_id DESC;
    `;

    const unapprovedQuery = `
      SELECT 
        uu_bms_id,
        inspection_id,
        qc_con,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
         COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
      AND qc_con = '3'
      ORDER BY inspection_id DESC;
    `;

    const [pendingRows, approvedRows, unapprovedRows] = await Promise.all([
      pool.query(pendingQuery, [bridgeId]),
      pool.query(approvedQuery, [bridgeId]),
      pool.query(unapprovedQuery, [bridgeId]),
    ]);

    // Helper function to extract URLs from potentially malformed JSON paths
    function extractUrlsFromPath(pathString) {
      // If it's not a string or empty, return empty array
      if (!pathString || typeof pathString !== "string") return [];

      // Clean up the string
      const trimmedPath = pathString.trim();

      // Case 1: Direct URL
      if (trimmedPath.startsWith("http")) {
        return [trimmedPath];
      }

      // Case 2: Try to parse as JSON
      try {
        // Handle malformed JSON with missing opening brace
        let jsonStr = trimmedPath;
        if (trimmedPath.startsWith('"') && !trimmedPath.startsWith('"{')) {
          jsonStr = "{" + trimmedPath;
        }

        // Add missing closing brace if needed
        const openBraces = (jsonStr.match(/{/g) || []).length;
        const closeBraces = (jsonStr.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          jsonStr += "}";
        }

        const parsed = JSON.parse(jsonStr);
        const urls = [];

        // Extract URLs from nested structure
        Object.keys(parsed).forEach((category) => {
          const categoryObj = parsed[category];
          Object.keys(categoryObj).forEach((index) => {
            const urlArray = categoryObj[index];
            if (Array.isArray(urlArray)) {
              urlArray.forEach((url) => {
                if (typeof url === "string" && url.startsWith("http")) {
                  urls.push(url);
                }
              });
            }
          });
        });

        return urls;
      } catch (e) {
        // Case 3: Fallback - try to extract URL using regex
        const urlMatches = trimmedPath.match(/(http[^"]+\.jpg)/g);
        return urlMatches || [];
      }
    }

    // Updated formatRows function
    const formatRows = (rows) =>
      rows.map((row) => {
        // Process PhotoPaths
        let extractedUrls = [];
        if (Array.isArray(row.PhotoPaths)) {
          // Process each path string and collect all URLs
          row.PhotoPaths.forEach((pathString) => {
            extractedUrls = extractedUrls.concat(
              extractUrlsFromPath(pathString)
            );
          });
        }

        return {
          ...row,
          PhotoPaths: extractedUrls,
          ApprovedFlag: row.ApprovedFlag === 1 ? "Approved" : "Unapproved",
        };
      });

    res.status(200).json({
      success: true,
      data: {
        pending: formatRows(pendingRows.rows),
        approved: formatRows(approvedRows.rows),
        unapproved: formatRows(unapprovedRows.rows),
      },
    });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// For Rams inspection
app.get("/api/get-inspections-rams", async (req, res) => {
  try {
    const { bridgeId } = req.query; // Get uu_bms_id from query parameters

    if (!bridgeId) {
      return res
        .status(400)
        .json({ success: false, message: "uu_bms_id is required" });
    }

    const pendingQuery = `
      SELECT 
        uu_bms_id,
        inspection_id,
        surveyed_by,
        damage_extent,
        qc_con,
        qc_remarks_con,
        qc_remarks_rams,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
     AND qc_con = '2'  -- Approved Consultant Inspections
      AND qc_rams = '0' -- Pending RAMS Review
      ORDER BY inspection_id DESC;
    `;

    const approvedQuery = `
      SELECT 
        uu_bms_id,
        inspection_id,
        qc_con,
        qc_remarks_con,
        qc_remarks_rams,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
       COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
      AND qc_rams = '2'
      ORDER BY inspection_id DESC;
    `;

    const unapprovedQuery = `
      SELECT 
        uu_bms_id,
        inspection_id,
        qc_con,
        qc_remarks_con,
        qc_remarks_rams,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
       AND qc_rams = '3'
      ORDER BY inspection_id DESC;
    `;

    const [pendingRows, approvedRows, unapprovedRows] = await Promise.all([
      pool.query(pendingQuery, [bridgeId]),
      pool.query(approvedQuery, [bridgeId]),
      pool.query(unapprovedQuery, [bridgeId]),
    ]);

    // Helper function to extract URLs from potentially malformed JSON paths
    function extractUrlsFromPath(pathString) {
      // If it's not a string or empty, return empty array
      if (!pathString || typeof pathString !== "string") return [];

      // Clean up the string
      const trimmedPath = pathString.trim();

      // Case 1: Direct URL
      if (trimmedPath.startsWith("http")) {
        return [trimmedPath];
      }

      // Case 2: Try to parse as JSON
      try {
        // Handle malformed JSON with missing opening brace
        let jsonStr = trimmedPath;
        if (trimmedPath.startsWith('"') && !trimmedPath.startsWith('"{')) {
          jsonStr = "{" + trimmedPath;
        }

        // Add missing closing brace if needed
        const openBraces = (jsonStr.match(/{/g) || []).length;
        const closeBraces = (jsonStr.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          jsonStr += "}";
        }

        const parsed = JSON.parse(jsonStr);
        const urls = [];

        // Extract URLs from nested structure
        Object.keys(parsed).forEach((category) => {
          const categoryObj = parsed[category];
          Object.keys(categoryObj).forEach((index) => {
            const urlArray = categoryObj[index];
            if (Array.isArray(urlArray)) {
              urlArray.forEach((url) => {
                if (typeof url === "string" && url.startsWith("http")) {
                  urls.push(url);
                }
              });
            }
          });
        });

        return urls;
      } catch (e) {
        // Case 3: Fallback - try to extract URL using regex
        const urlMatches = trimmedPath.match(/(http[^"]+\.jpg)/g);
        return urlMatches || [];
      }
    }

    // Updated formatRows function
    const formatRows = (rows) =>
      rows.map((row) => {
        // Process PhotoPaths
        let extractedUrls = [];
        if (Array.isArray(row.PhotoPaths)) {
          // Process each path string and collect all URLs
          row.PhotoPaths.forEach((pathString) => {
            extractedUrls = extractedUrls.concat(
              extractUrlsFromPath(pathString)
            );
          });
        }

        return {
          ...row,
          PhotoPaths: extractedUrls,
          ApprovedFlag: row.ApprovedFlag === 1 ? "Approved" : "Unapproved",
        };
      });

    res.status(200).json({
      success: true,
      data: {
        pending: formatRows(pendingRows.rows),
        approved: formatRows(approvedRows.rows),
        unapproved: formatRows(unapprovedRows.rows),
      },
    });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// For Evaluator inspection
app.get("/api/get-inspections-evaluator", async (req, res) => {
  try {
    const { bridgeId } = req.query; // Get uu_bms_id from query parameters

    if (!bridgeId) {
      return res
        .status(400)
        .json({ success: false, message: "uu_bms_id is required" });
    }

    const pendingQuery = `
      SELECT 
       uu_bms_id,
        inspection_id,
         surveyed_by,
        damage_extent,
        qc_rams,
        qc_remarks_rams,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks",
        COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
     AND qc_rams = '2'  -- Approved Consultant Inspections
      ORDER BY inspection_id DESC;
    `;

    const approvedQuery = `
      SELECT 
         uu_bms_id,
        inspection_id,
        qc_rams,
        qc_remarks_rams,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        COALESCE(string_to_array(photopath, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
      AND qc_rams = '2'
      ORDER BY inspection_id DESC;
    `;

    const unapprovedQuery = `
      SELECT 
       uu_bms_id,
        inspection_id,
        qc_rams,
        qc_remarks_rams,
        qc_remarks_con,
        reviewed_by,
        bridge_name, 
        "SpanIndex", 
        "WorkKindName", 
        "PartsName", 
        "MaterialName", 
        "DamageKindName", 
        "DamageLevel", 
        "Remarks", 
        COALESCE(string_to_array(photopath, ','), '{}') AS "PhotoPaths", 
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
       AND qc_rams = '3'
      ORDER BY inspection_id DESC;
    `;

    const [pendingRows, approvedRows, unapprovedRows] = await Promise.all([
      pool.query(pendingQuery, [bridgeId]),
      pool.query(approvedQuery, [bridgeId]),
      pool.query(unapprovedQuery, [bridgeId]),
    ]);

    // Helper function to extract URLs from potentially malformed JSON paths
    function extractUrlsFromPath(pathString) {
      // If it's not a string or empty, return empty array
      if (!pathString || typeof pathString !== "string") return [];

      // Clean up the string
      const trimmedPath = pathString.trim();

      // Case 1: Direct URL
      if (trimmedPath.startsWith("http")) {
        return [trimmedPath];
      }

      // Case 2: Try to parse as JSON
      try {
        // Handle malformed JSON with missing opening brace
        let jsonStr = trimmedPath;
        if (trimmedPath.startsWith('"') && !trimmedPath.startsWith('"{')) {
          jsonStr = "{" + trimmedPath;
        }

        // Add missing closing brace if needed
        const openBraces = (jsonStr.match(/{/g) || []).length;
        const closeBraces = (jsonStr.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          jsonStr += "}";
        }

        const parsed = JSON.parse(jsonStr);
        const urls = [];

        // Extract URLs from nested structure
        Object.keys(parsed).forEach((category) => {
          const categoryObj = parsed[category];
          Object.keys(categoryObj).forEach((index) => {
            const urlArray = categoryObj[index];
            if (Array.isArray(urlArray)) {
              urlArray.forEach((url) => {
                if (typeof url === "string" && url.startsWith("http")) {
                  urls.push(url);
                }
              });
            }
          });
        });

        return urls;
      } catch (e) {
        // Case 3: Fallback - try to extract URL using regex
        const urlMatches = trimmedPath.match(/(http[^"]+\.jpg)/g);
        return urlMatches || [];
      }
    }

    // Updated formatRows function
    const formatRows = (rows) =>
      rows.map((row) => {
        // Process PhotoPaths
        let extractedUrls = [];
        if (Array.isArray(row.PhotoPaths)) {
          // Process each path string and collect all URLs
          row.PhotoPaths.forEach((pathString) => {
            extractedUrls = extractedUrls.concat(
              extractUrlsFromPath(pathString)
            );
          });
        }

        return {
          ...row,
          PhotoPaths: extractedUrls,
          ApprovedFlag: row.ApprovedFlag === 1 ? "Approved" : "Unapproved",
        };
      });

    res.status(200).json({
      success: true,
      data: {
        pending: formatRows(pendingRows.rows),
        approved: formatRows(approvedRows.rows),
        unapproved: formatRows(unapprovedRows.rows),
      },
    });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Endpoint to update inspection data for consultant
app.put("/api/update-inspection", async (req, res) => {
  const { id, qc_remarks_con, qc_con } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Invalid data: ID is required" });
  }

  try {
    // Prepare the query and values dynamically based on provided fields
    let query = "UPDATE bms.tbl_inspection_f SET";
    const values = [];
    let valueIndex = 1;

    // Conditionally add the fields to update
    if (qc_remarks_con !== undefined) {
      query += ` qc_remarks_con = $${valueIndex},`;
      values.push(qc_remarks_con === null ? null : qc_remarks_con);
      valueIndex++;
    }

    if (qc_con !== undefined) {
      query += ` qc_con = $${valueIndex},`;
      values.push(qc_con);
      valueIndex++;
    }

    // Always update reviewd_by to 1
    query += ` reviewed_by = 1,`;

    // If no fields to update, return an error
    if (values.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Remove the trailing comma and add the WHERE clause
    query =
      query.slice(0, -1) + ` WHERE inspection_id = $${valueIndex} RETURNING *;`;
    values.push(id);

    // Execute the query to update the record
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.status(200).json({
      message: "Inspection updated successfully",
      updatedRow: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating inspection:", error);
    res.status(500).json({ error: "Failed to update inspection" });
  }
});

// Endpoint to update inspection data for rams
app.put("/api/update-inspection-rams", async (req, res) => {
  const { id, qc_remarks_rams, qc_rams } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Invalid data: ID is required" });
  }

  try {
    // Prepare the query and values dynamically based on provided fields
    let query = "UPDATE bms.tbl_inspection_f SET";
    const values = [];
    let valueIndex = 1;

    // Conditionally add the fields to update
    if (qc_remarks_rams !== undefined) {
      query += ` qc_remarks_rams = $${valueIndex},`;
      values.push(qc_remarks_rams === null ? null : qc_remarks_rams);
      valueIndex++;
    }

    if (qc_rams !== undefined) {
      query += ` qc_rams = $${valueIndex},`;
      values.push(qc_rams);
      valueIndex++;
    }

    // Always update reviewd_by to 1
    query += ` reviewed_by = 2,`;

    // If no fields to update, return an error
    if (values.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Remove the trailing comma and add the WHERE clause
    query =
      query.slice(0, -1) + ` WHERE inspection_id = $${valueIndex} RETURNING *;`;
    values.push(id);

    // Execute the query to update the record
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.status(200).json({
      message: "Inspection updated successfully",
      updatedRow: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating inspection:", error);
    res.status(500).json({ error: "Failed to update inspection" });
  }
});

app.get("/api/structure-types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, structure_type FROM bms.tbl_structure_types"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

app.get("/api/carriageway-types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, carriageway_type FROM bms.tbl_carriageway_types"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

app.get("/api/construction-types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, construction_type FROM bms.tbl_construction_types"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// API route to get Districts
app.get("/api/districts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id,district FROM bms.tbl_districts"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API route to get Districts
app.get("/api/directions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id,direction FROM bms.tbl_direction_types"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/work-kinds", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "WorkKindID", "WorkKindName" FROM bms.tbl_work_kinds'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/parts", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "PartsID", "PartsName" FROM bms.tbl_parts'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/materials", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "MaterialID", "MaterialName" FROM bms.tbl_materials'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/damage-levels", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "DamageLevelID", "DamageLevel" FROM bms.tbl_damage_levels'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/damage-kinds", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "DamageKindID", "DamageKindName" FROM bms.tbl_damage_kinds'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/damage-ranks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bms.tbl_damage_levels");
    res.json({ data: result.rows }); // Wrap the data in a "data" property
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/elements", async (req, res) => {
  try {
    // Query to join tbl_parts and tbl_work_kinds based on WorkKindID
    const result = await pool.query(`
      SELECT 
        parts."PartsID",
        parts."PartsName",
        parts."PartsNameJa",
        parts."PartsCode",
        parts."MainPartsFlag",
        parts."DeleteFlag",
        parts."InYMD",
        parts."UpYMD",
        parts."PartsImportantFactorPcentValue",
        work."WorkKindID",
        work."WorkKindName"
      FROM 
        bms.tbl_parts AS parts
      LEFT JOIN 
        bms.tbl_work_kinds AS work
      ON 
        parts."WorkKindID" = work."WorkKindID"
    `);

    // Send response
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API for Visual Conditions
app.get("/api/visual-conditions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, visual_condition FROM bms.tbl_visual_conditions"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching visual conditions:", error);
    res.status(500).json({ error: "Failed to fetch visual conditions" });
  }
});

// API for Road Classifications
app.get("/api/road-classifications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, road_classification FROM bms.tbl_road_classifications"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching road classifications:", error);
    res.status(500).json({ error: "Failed to fetch road classifications" });
  }
});

// API for Road Surface Types
app.get("/api/road-surface-types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, road_surface_type FROM bms.tbl_road_surface_types"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching road surface types:", error);
    res.status(500).json({ error: "Failed to fetch road surface types" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
