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

// api endpoint for districts extent
app.get("/api/districtExtent", async (req, res) => {
  try {
    const { districtId } = req.query;

    let query = `
      SELECT 
        district_id, district_n, div_name, 
        ST_Extent(geom) AS bbox 
      FROM public.punjab_district_boundary
    `;

    const values = [];
    if (districtId) {
      query += ` WHERE district_id = $1`;
      values.push(districtId);
    }

    query += " GROUP BY district_id, district_n, div_name"; // Ensure grouping for ST_Extent

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      const bboxString = result.rows[0].bbox
        .replace("BOX(", "")
        .replace(")", "");
      const [xmin, ymin, xmax, ymax] = bboxString
        .split(",")
        .flatMap((coord) => coord.split(" "));

      res.json({
        success: true,
        district: {
          district_id: result.rows[0].district_id,
          district_name: result.rows[0].district_n,
          division_name: result.rows[0].div_name,
          xmin: parseFloat(xmin),
          ymin: parseFloat(ymin),
          xmax: parseFloat(xmax),
          ymax: parseFloat(ymax),
        },
      });
    } else {
      res.status(404).json({ success: false, message: "District not found" });
    }
  } catch (err) {
    console.error("Error fetching district extent:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching district extent",
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

app.get("/api/inspections-export-new", async (req, res) => {
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
    WITH ranked_data AS (
      SELECT 
        md.uu_bms_id AS "Reference No:",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS bridge_name,
        md.structure_type, md.road_no, md.road_name, md.road_name_cwd, 
        md.road_code_cwd, md.route_id, md.survey_id, md.surveyor_name, 
        md.zone, md.district, md.road_classification, md.road_surface_type, 
        md.carriageway_type, md.direction, md.visual_condition, md.construction_type, 
        md.no_of_span, md.span_length_m, md.structure_width_m, md.construction_year, 
        md.last_maintenance_date, md.data_source, md.date_time, md.remarks,
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",

        f.surveyed_by, f."SpanIndex", f."WorkKindID", f."WorkKindName", 
        f."PartsID", f."PartsName", f."MaterialID", f."MaterialName", 
        f."DamageKindID", f."DamageKindName", f."DamageLevelID", f."DamageLevel", 
        f.damage_extent, f."Remarks", f.current_date_time, 
        COALESCE(string_to_array(f.inspection_images, ','), '{}') AS "Inspection Photos",

        ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time ASC) AS rn
      FROM bms.tbl_bms_master_data md
      LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
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

    query += ` ) SELECT * FROM ranked_data ORDER BY "Reference No:"`;

    const result = await pool.query(query, queryParams);

    let firstRow = true;
    const processedData = result.rows.map((row) => {
      row["Inspection Photos"] = row["Inspection Photos"].filter(Boolean);

      row["Overview Photos"] = row["Overview Photos"]
        .map((photo) => (photo ? photo : null))
        .filter(Boolean);

      if (!firstRow) {
        row["Reference No:"] = null;
        row.bridge_name = null;
        row.structure_type = null;
        row.road_no = null;
        row.road_name = null;
        row.road_name_cwd = null;
        row.road_code_cwd = null;
        row.route_id = null;
        row.survey_id = null;
        row.surveyor_name = null;
        row.zone = null;
        row.district = null;
        row.road_classification = null;
        row.road_surface_type = null;
        row.carriageway_type = null;
        row.direction = null;
        row.visual_condition = null;
        row.construction_type = null;
        row.no_of_span = null;
        row.span_length_m = null;
        row.structure_width_m = null;
        row.construction_year = null;
        row.last_maintenance_date = null;
        row.data_source = null;
        row.date_time = null;
        row.remarks = null;
        row["Overview Photos"] = null;
      }

      firstRow = false;
      return row;
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

// inspection download for a specific bridge and dashboard + evaluation module
app.get("/api/inspections-export", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    let query = `
      WITH ranked_data AS (
        SELECT 
          md.uu_bms_id AS "Reference No:",
          CONCAT(md.pms_sec_id, ',', md.structure_no) AS bridge_name,
          md.structure_type, md.road_no, md.road_name, md.road_name_cwd, 
          md.road_code_cwd, md.route_id, md.survey_id, md.surveyor_name, 
          md.zone, md.district, md.road_classification, md.road_surface_type, 
          md.carriageway_type, md.direction, md.visual_condition, md.construction_type, 
          md.no_of_span, md.span_length_m, md.structure_width_m, md.construction_year, 
          md.last_maintenance_date, md.data_source, md.date_time, md.remarks,
          ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
          
          f.surveyed_by, f."SpanIndex", f."WorkKindID", f."WorkKindName", 
          f."PartsID", f."PartsName", f."MaterialID", f."MaterialName", 
          f."DamageKindID", f."DamageKindName", f."DamageLevelID", f."DamageLevel", 
          f.damage_extent, f."Remarks", f.current_date_time, COALESCE(f.inspection_images, '[]') AS "PhotoPaths",

          ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time ASC) AS rn
        FROM bms.tbl_bms_master_data md
        LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
      )
      SELECT * FROM ranked_data WHERE 1=1`;

    const queryParams = [];
    if (bridgeId && !isNaN(bridgeId)) {
      query += ` AND "Reference No:" = $1`;
      queryParams.push(Number(bridgeId));
    }

    const result = await pool.query(query, queryParams);

    let firstRow = true;
    const processedData = result.rows.map((row) => {
      row.PhotoPaths = extractUrlsFromPath(row.PhotoPaths);
      
      // Update Overview Photos using the same logic as PhotoPaths
      row["Overview Photos"] = row["Overview Photos"]
        .map((photo) => (photo ? swapDomain(photo) : null))
        .filter(Boolean);

      if (!firstRow) {
        row["Overview Photos"] = null;
      }

      firstRow = false;
      return row;
    });

    res.json({ success: true, bridges: processedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: "Error fetching data from the database" });
  }
});

// Helper function to extract valid URLs from PhotoPaths
function extractUrlsFromPath(photoPaths) {
  if (!photoPaths) return [];

  try {
    const parsedData =
      typeof photoPaths === "string" ? JSON.parse(photoPaths) : photoPaths;
    let urls = [];

    function extractFromNested(obj) {
      if (Array.isArray(obj)) {
        obj.forEach((item) => extractFromNested(item));
      } else if (typeof obj === "object" && obj !== null) {
        if (obj.path && typeof obj.path === "string" && obj.path.startsWith("http")) {
          urls.push(swapDomain(obj.path));
        }
        Object.values(obj).forEach((value) => extractFromNested(value));
      } else if (typeof obj === "string" && obj.startsWith("http")) {
        urls.push(swapDomain(obj));
      }
    }

    extractFromNested(parsedData);
    return urls.length > 0 ? urls : [];
  } catch (e) {
    console.error("Error parsing PhotoPaths:", e);
    return [];
  }
}

// Function to swap domain/IP
function swapDomain(url) {
  return url.includes("cnw.urbanunit.gov.pk")
    ? url.replace("cnw.urbanunit.gov.pk", "118.103.225.148")
    : url.replace("118.103.225.148", "cnw.urbanunit.gov.pk");
}

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
    let { district, bridge } = req.query;

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

    if (district && !isNaN(parseInt(district))) {
      query += ` AND ins."district_id" = $${paramIndex}`;
      queryParams.push(parseInt(district));
      paramIndex++;
    }

    if (bridge && bridge.trim() !== "" && bridge !== "%") {
      query += ` AND CONCAT(bmd."pms_sec_id", ',', bmd."structure_no") ILIKE $${paramIndex}`;
      queryParams.push(`%${bridge}%`);
      paramIndex++;
    }

    const result = await pool.query(query, queryParams);

    // Process PhotoPaths to extract image URLs
    const processedData = result.rows.map((row) => {
      let extractedPhotoPaths = [];

      try {
        if (row.PhotoPaths) {
          const cleanedJson = row.PhotoPaths.replace(/\"\{/g, "{").replace(
            /\}\"/g,
            "}"
          );
          const parsedPhotos = JSON.parse(cleanedJson);

          if (Array.isArray(parsedPhotos)) {
            // Case 1: Array of objects with "path" keys
            parsedPhotos.forEach((item) => {
              if (item.path) extractedPhotoPaths.push(item.path);
            });
          } else if (typeof parsedPhotos === "object") {
            // Case 2: Nested object with image paths
            Object.values(parsedPhotos).forEach((category) => {
              if (typeof category === "object") {
                Object.values(category).forEach((imagesArray) => {
                  if (Array.isArray(imagesArray)) {
                    extractedPhotoPaths.push(...imagesArray);
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Error parsing PhotoPaths:", error);
      }

      return {
        ...row,
        PhotoPaths: extractedPhotoPaths, // Store extracted paths as a flat array
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

    // Process PhotoPaths for all rows
    const processedData = rows.map((row) => {
      let extractedPhotoPaths = [];

      try {
        if (row.PhotoPaths) {
          // Clean JSON if wrapped in quotes
          const cleanedJson = row.PhotoPaths.replace(/\"\{/g, "{").replace(
            /\}\"/g,
            "}"
          );
          const parsedPhotos = JSON.parse(cleanedJson);

          if (Array.isArray(parsedPhotos)) {
            // Case 1: Array of objects with "path" keys
            parsedPhotos.forEach((item) => {
              if (item.path) extractedPhotoPaths.push(item.path);
            });
          } else if (typeof parsedPhotos === "object") {
            // Case 2: Nested object with image paths
            Object.values(parsedPhotos).forEach((category) => {
              if (typeof category === "object") {
                Object.values(category).forEach((imagesArray) => {
                  if (Array.isArray(imagesArray)) {
                    extractedPhotoPaths.push(...imagesArray);
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error("Error parsing PhotoPaths:", error);
      }

      return {
        ...row,
        PhotoPaths: extractedPhotoPaths, // Flattened array of image paths
        ApprovedFlag: row.ApprovedFlag === 1 ? "Approved" : "Unapproved",
      };
    });

    res.status(200).json({ success: true, data: processedData });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// api endpoint for consultant inspections data
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
      and is_latest = true
      ORDER BY inspection_id DESC;
    `;

    const [pendingRows, approvedRows, unapprovedRows] = await Promise.all([
      pool.query(pendingQuery, [bridgeId]),
      pool.query(approvedQuery, [bridgeId]),
      pool.query(unapprovedQuery, [bridgeId]),
    ]);

    // Helper function to extract URLs from potentially malformed JSON paths
    function extractUrlsFromPath(pathString) {
      if (!pathString || typeof pathString !== "string") return [];

      const trimmedPath = pathString.trim();

      // Case 1: Direct URL
      if (trimmedPath.startsWith("http")) {
        return [trimmedPath];
      }

      // Case 2: Try to parse as JSON (handling nested objects)
      try {
        const parsed = JSON.parse(trimmedPath);
        const urls = [];

        function extractFromNested(obj) {
          if (Array.isArray(obj)) {
            obj.forEach((item) => {
              if (typeof item === "string" && item.startsWith("http")) {
                urls.push(item);
              } else if (typeof item === "object" && item !== null) {
                extractFromNested(item);
              }
            });
          } else if (typeof obj === "object" && obj !== null) {
            Object.values(obj).forEach((value) => extractFromNested(value));
          }
        }

        extractFromNested(parsed);
        return urls;
      } catch (e) {
        // Case 3: Fallback - extract URLs using regex
        const urlMatches = trimmedPath.match(
          /(http[^"]+\.(jpg|jpeg|png|gif))/g
        );
        return urlMatches || [];
      }
    }

    // Updated formatRows function
    const formatRows = (rows) =>
      rows.map((row) => {
        let extractedUrls = [];

        if (Array.isArray(row.PhotoPaths)) {
          row.PhotoPaths.forEach((pathString) => {
            extractedUrls = extractedUrls.concat(
              extractUrlsFromPath(pathString)
            );
          });
        } else if (typeof row.PhotoPaths === "string") {
          extractedUrls = extractUrlsFromPath(row.PhotoPaths);
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
     AND qc_rams = '0'  -- Pending Rams Inspections
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
      and is_latest = true
      ORDER BY inspection_id DESC;
    `;

    const [pendingRows, approvedRows, unapprovedRows] = await Promise.all([
      pool.query(pendingQuery, [bridgeId]),
      pool.query(approvedQuery, [bridgeId]),
      pool.query(unapprovedQuery, [bridgeId]),
    ]);

    // Helper function to extract URLs from potentially malformed JSON paths
    function extractUrlsFromPath(pathString) {
      if (!pathString || typeof pathString !== "string") return [];

      const trimmedPath = pathString.trim();

      // Case 1: Direct URL
      if (trimmedPath.startsWith("http")) {
        return [trimmedPath];
      }

      // Case 2: Try to parse as JSON (handling nested objects)
      try {
        const parsed = JSON.parse(trimmedPath);
        const urls = [];

        function extractFromNested(obj) {
          if (Array.isArray(obj)) {
            obj.forEach((item) => {
              if (typeof item === "string" && item.startsWith("http")) {
                urls.push(item);
              } else if (typeof item === "object" && item !== null) {
                extractFromNested(item);
              }
            });
          } else if (typeof obj === "object" && obj !== null) {
            Object.values(obj).forEach((value) => extractFromNested(value));
          }
        }

        extractFromNested(parsed);
        return urls;
      } catch (e) {
        // Case 3: Fallback - extract URLs using regex
        const urlMatches = trimmedPath.match(
          /(http[^"]+\.(jpg|jpeg|png|gif))/g
        );
        return urlMatches || [];
      }
    }

    // Updated formatRows function
    const formatRows = (rows) =>
      rows.map((row) => {
        let extractedUrls = [];

        if (Array.isArray(row.PhotoPaths)) {
          row.PhotoPaths.forEach((pathString) => {
            extractedUrls = extractedUrls.concat(
              extractUrlsFromPath(pathString)
            );
          });
        } else if (typeof row.PhotoPaths === "string") {
          extractedUrls = extractUrlsFromPath(row.PhotoPaths);
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
     AND qc_evaluator = '0'  -- Pending Evaluator Inspections
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
      if (!pathString || typeof pathString !== "string") return [];

      const trimmedPath = pathString.trim();

      // Case 1: Direct URL
      if (trimmedPath.startsWith("http")) {
        return [trimmedPath];
      }

      // Case 2: Try to parse as JSON (handling nested objects)
      try {
        const parsed = JSON.parse(trimmedPath);
        const urls = [];

        function extractFromNested(obj) {
          if (Array.isArray(obj)) {
            obj.forEach((item) => {
              if (typeof item === "string" && item.startsWith("http")) {
                urls.push(item);
              } else if (typeof item === "object" && item !== null) {
                extractFromNested(item);
              }
            });
          } else if (typeof obj === "object" && obj !== null) {
            Object.values(obj).forEach((value) => extractFromNested(value));
          }
        }

        extractFromNested(parsed);
        return urls;
      } catch (e) {
        // Case 3: Fallback - extract URLs using regex
        const urlMatches = trimmedPath.match(
          /(http[^"]+\.(jpg|jpeg|png|gif))/g
        );
        return urlMatches || [];
      }
    }

    // Updated formatRows function
    const formatRows = (rows) =>
      rows.map((row) => {
        let extractedUrls = [];

        if (Array.isArray(row.PhotoPaths)) {
          row.PhotoPaths.forEach((pathString) => {
            extractedUrls = extractedUrls.concat(
              extractUrlsFromPath(pathString)
            );
          });
        } else if (typeof row.PhotoPaths === "string") {
          extractedUrls = extractUrlsFromPath(row.PhotoPaths);
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

      // Hard-code evaluation_status based on qc_con value
      if (qc_con === 2) {
        query += ` evaluation_status = 'approved',`;
      } else if (qc_con === 3) {
        query += ` evaluation_status = 'unapproved',`;
      }
    }

    // Always update reviewed_by to 1
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

// Endpoint to update inspection data for RAMS
app.put("/api/update-inspection-rams", async (req, res) => {
  const { id, qc_remarks_rams, qc_rams } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Invalid data: ID is required" });
  }

  try {
    let query = "UPDATE bms.tbl_inspection_f SET";
    const values = [];
    let valueIndex = 1;

    // Conditionally add fields to update
    if (qc_remarks_rams !== undefined) {
      query += ` qc_remarks_rams = $${valueIndex},`;
      values.push(qc_remarks_rams === null ? null : qc_remarks_rams);
      valueIndex++;
    }

    if (qc_rams !== undefined) {
      query += ` qc_rams = $${valueIndex},`;
      values.push(qc_rams);
      valueIndex++;

      // Hardcoded evaluation_status based on qc_rams value
      if (qc_rams === 2) {
        query += ` evaluation_status = 'approved',`;
      } else if (qc_rams === 3) {
        query += ` evaluation_status = 'unapproved',`;
      }
    }

    // Always update reviewed_by to 2
    query += ` reviewed_by = 2,`;

    // If no fields to update, return an error
    if (values.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Remove the trailing comma and add the WHERE clause
    query =
      query.slice(0, -1) + ` WHERE inspection_id = $${valueIndex} RETURNING *;`;
    values.push(id);

    // Execute the query
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
