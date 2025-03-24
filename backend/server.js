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
    SELECT id, user_name, user_password, user_type
    FROM bms.tbl_users_evaluations
    WHERE user_name = $1
`;

    // Run the query with the provided username
    const result = await pool.query(query, [username]);

    // If no user is found or user is not active
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Direct password comparison (In production, use hashed comparison)
    if (password !== user.user_password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.user_name,
        usertype: user.user_type,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send token and user details (excluding password)
    res.json({
      token,
      user: {
        userId: user.id,
        username: user.user_name,
        usertype: user.user_type,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API Endpoint for bridge eise score
app.get("/api/bms-score", async (req, res) => {
  try {
    let { page, limit, district, structureType, bridgeName } = req.query;

    // Default values
    page = parseInt(page) || 1; // Default to 1 if not provided
    limit = parseInt(limit) || 10; // Default to 10 if not provided
    const offset = (page - 1) * limit;

    // Default to '%' for optional filters
    district = district || "%";
    structureType = structureType || "%";
    bridgeName = bridgeName ? `%${bridgeName}%` : "%";

    const query = `
      SELECT 
          c."ObjectID" AS uu_bms_id,
          c.total_damage_score, 
          c.critical_damage_score,
          c.avg_damage_score AS average_damage_score,
          c.bridge_performance_index,
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
          bms.tbl_bms_calculations_2 c
      LEFT JOIN 
          bms.tbl_bms_master_data m 
      ON c."ObjectID"::INTEGER = m.id
      WHERE 
          m.district_id::TEXT LIKE $1
          AND m.structure_type_id::TEXT LIKE $2
          AND CONCAT(m.pms_sec_id, ',', m.structure_no) ILIKE $3
      ORDER BY c."ObjectID"
      LIMIT $4 OFFSET $5;
    `;

    const values = [district, structureType, bridgeName, limit, offset];

    const result = await pool.query(query, values);

    // Query to get total records (without pagination)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM bms.tbl_bms_calculations_2 c 
      LEFT JOIN bms.tbl_bms_master_data m
      ON c."ObjectID"::INTEGER = m.id
      WHERE 
          m.district_id::TEXT LIKE $1
          AND m.structure_type_id::TEXT LIKE $2
          AND CONCAT(m.pms_sec_id, ',', m.structure_no) ILIKE $3;
    `;

    const countResult = await pool.query(countQuery, values.slice(0, 3)); // Skip limit & offset
    const totalRecords = countResult.rows[0].total;

    res.json({
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// API Endpoint for Exporting Full BMS Data (No Limits)
app.get("/api/bms-score-export", async (req, res) => {
  try {
    const query = `
    SELECT 
        CONCAT(m.pms_sec_id, ',', m.structure_no) AS "BridgeName",
        m.district,
        c.total_damage_score, 
        c.critical_damage_score,
        c.avg_damage_score AS average_damage_score  -- Ensure consistent column naming
    FROM 
        bms.tbl_bms_calculations_2 c  -- Ensure correct table name
    LEFT JOIN 
        bms.tbl_bms_master_data m 
    ON 
        c."ObjectID"::INTEGER = m.id  -- Ensure case-sensitive match
    ORDER BY c."ObjectID";
    `;

    const result = await pool.query(query);

    res.json({
      totalRecords: result.rowCount, // More efficient than result.rows.length
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

// API endpoint to get counts for inspected structures
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

// API endpoint to get counts for inspected structures
app.get("/api/structure-counts-evaluated", async (req, res) => {
  try {
    const query = `
      WITH inspected_structures AS (
        SELECT DISTINCT uu_bms_id FROM bms.tbl_evaluation_f
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
        SELECT DISTINCT uu_bms_id FROM bms.tbl_evaluation_f
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

// counts for Con
app.get("/api/inspection-counts-con", async (req, res) => {
  try {
    let { districtId } = req.query;

    // Default to '%' if districtId is not provided
    districtId = districtId || "%";

    const query = `
      SELECT 
        COUNT(CASE WHEN qc_con = 1 THEN 1 END) AS pending_count,
        COUNT(CASE WHEN qc_con = 2 THEN 1 END) AS approved_count
      FROM bms.tbl_inspection_f
      WHERE surveyed_by = 'RAMS-UU'
      AND district_id::TEXT LIKE $1
    `;

    const values = [districtId];
    const result = await pool.query(query, values);

    res.json({
      pending: result.rows[0].pending_count,
      approved: result.rows[0].approved_count,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching counts from the database",
    });
  }
});

// Counts for Rams
app.get("/api/inspection-counts-rams", async (req, res) => {
  try {
    let { districtId } = req.query;

    // Default to '%' if districtId is not provided
    districtId = districtId || "%";

    const query = `
    SELECT 
        COUNT(CASE WHEN qc_rams = 0 AND qc_con = 2 THEN 1 END) AS pending_count,
       COUNT(CASE WHEN qc_rams = 2 THEN 1 END) AS approved_count
    FROM bms.tbl_inspection_f
      WHERE surveyed_by = 'RAMS-UU'
      AND district_id::TEXT LIKE $1
    `;

    const values = [districtId];
    const result = await pool.query(query, values);

    res.json({
      pending: result.rows[0].pending_count,
      approved: result.rows[0].approved_count,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching counts from the database",
    });
  }
});

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

// briges details download for dashboard and evaluationn working correctly
app.get("/api/bridgesConDownloadExcel", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
      WITH ranked_data AS (
        SELECT 
          md.uu_bms_id AS "REFERENCE NO",
          CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
          md.structure_type AS "STRUCTURE TYPE",
          md.road_no AS "ROAD NO",
          md.road_name AS "ROAD NAME",
          md.road_name_cwd AS "ROAD NAME CWD",
          md.road_code_cwd AS "ROAD CODE CWD",
          md.route_id AS "ROUTE ID",
          md.survey_id AS "SURVEY ID",
          md.pms_sec_id AS "PMS SEC ID",
          md.structure_no AS "STRUCTURE NO",
          md.surveyor_name AS "SURVEYOR NAME",
          md.zone AS "ZONE",
          md.district AS "DISTRICT",
          md.road_classification AS "ROAD CLASSIFICATION",
          md.road_surface_type AS "ROAD SURFACE TYPE",
          md.carriageway_type AS "CARRIAGEWAY TYPE",
          md.direction AS "DIRECTION",
          md.visual_condition AS "VISUAL CONDITION",
          md.construction_type AS "CONSTRUCTION TYPE",
          md.no_of_span AS "NO OF SPAN",
          md.span_length_m AS "SPAN LENGTH (M)",
          md.structure_width_m AS "STRUCTURE WIDTH (M)",
          md.construction_year AS "CONSTRUCTION YEAR",
          md.last_maintenance_date AS "LAST MAINTENANCE DATE",
          md.data_source AS "DATA SOURCE",
          md.date_time AS "DATE TIME",
          md.remarks AS "REMARKS",
          f.surveyed_by AS "SURVEYED BY",
          f."SpanIndex" AS "SPAN INDEX",
          f."WorkKindName" AS "WORK KIND NAME",
          f."PartsName" AS "PARTS NAME",
          f."MaterialName" AS "MATERIAL NAME",
          f."DamageKindName" AS "DAMAGE KIND NAME",
          f."DamageLevel" AS "DAMAGE LEVEL",
          f.damage_extent AS "DAMAGE EXTENT",
          f."Remarks" AS "SITUATION REMARKS",
          f.current_date_time AS "INSPECTION DATE",
          ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time DESC) AS "ROW RANK",
          ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
          COALESCE(f.inspection_images, '[]') AS "PhotoPaths"
        FROM bms.tbl_bms_master_data md
        JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id AND f.surveyed_by = 'RAMS-UU'
        WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "REFERENCE NO" ) SELECT * FROM ranked_data;`;

    const result = await pool.query(query, queryParams);

    // **Track First Row for Each uu_bms_id**
    let firstRowMap = new Map();

    // **Process Data**
    const processedData = result.rows.map((row) => {
      if (!firstRowMap.has(row["REFERENCE NO"])) {
        firstRowMap.set(row["REFERENCE NO"], true);
      } else {
        row["Overview Photos"] = null;
      }

      // **Fix Photo Paths**
      row["PhotoPaths"] = extractUrlsFromPath(row["PhotoPaths"]);

      return row;
    });

    res.json({
      success: true,
      bridges: processedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// bridges details download csv for dashboard and evluation
app.get("/api/bridgesConDownloadCsv", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
      SELECT
        md.uu_bms_id AS "Reference No",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "Bridge Name",
        md.structure_type AS "Structure Type",
        md.road_no AS "Road No",
        md.road_name AS "Road Name",
        md.road_name_cwd AS "Road Name CWD",
        md.road_code_cwd AS "Road Code CWD",
        md.route_id AS "Route ID",
        md.survey_id AS "Survey ID",
        md.surveyor_name AS "Surveyor Name",
        md.zone AS "Zone",
        md.district AS "District",
        md.road_classification AS "Road Classification",
        md.road_surface_type AS "Road Surface Type",
        md.carriageway_type AS "Carriageway Type",
        md.direction AS "Direction",
        md.visual_condition AS "Visual Condition",
        md.construction_type AS "Construction Type",
        md.no_of_span AS "No Of Spans",
        md.span_length_m AS "Span Length (m)",
        md.structure_width_m AS "Structure Width (m)",
        md.construction_year AS "Construction Year",
        md.last_maintenance_date AS "Last Maintenance Date",
        md.data_source AS "Data Source",
        md.date_time AS "Date Time",
        md.remarks AS "Remarks",
        f."SpanIndex" AS "Span Index",
        f."WorkKindName" AS "Work Kind",
        f."PartsName" AS "Part Name",
        f."MaterialName" AS "Material Name",
        f."DamageKindName" AS "Damage Kind",
        f."DamageLevel" AS "Damage Level",
        f.damage_extent AS "Damage Extent",
        f."Remarks" AS "Situation Remarks",
        f."surveyed_by" AS "Surveyed By",
        f.current_date_time AS "Inspection Date"
      FROM bms.tbl_bms_master_data md
      JOIN bms.tbl_inspection_f f ON (md.uu_bms_id = f.uu_bms_id AND f.surveyed_by = 'RAMS-UU')
      AND md.uu_bms_id IN (SELECT DISTINCT f.uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU')
      WHERE 1=1
    `; // 👈 Notice "WHERE 1=1" ensures the next conditions can safely be added

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "Reference No"`;

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

// briges details download for dashboard and evaluationn working correctly
app.get("/api/bridgesRamsDownloadExcel", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
    WITH ranked_data AS (
      SELECT 
        md.uu_bms_id AS "REFERENCE NO",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
        md.structure_type_id AS "STRUCTURE TYPE ID",
        md.structure_type AS "STRUCTURE TYPE",
        md.road_no AS "ROAD NO",
        md.road_name_id AS "ROAD NAME ID",
        md.road_name AS "ROAD NAME",
        md.road_name_cwd AS "ROAD NAME CWD",
        md.road_code_cwd AS "ROAD CODE CWD",
        md.route_id AS "ROUTE ID",
        md.survey_id AS "SURVEY ID",
        md.pms_sec_id AS "PMS SEC ID",
        md.structure_no AS "STRUCTURE NO",
        md.surveyor_name AS "SURVEYOR NAME",
        md.zone AS "ZONE",
        md.district AS "DISTRICT",
        md.road_classification AS "ROAD CLASSIFICATION",
        md.road_surface_type AS "ROAD SURFACE TYPE",
        md.carriageway_type AS "CARRIAGEWAY TYPE",
        md.direction AS "DIRECTION",
        md.visual_condition AS "VISUAL CONDITION",
        md.construction_type AS "CONSTRUCTION TYPE",
        md.no_of_span AS "NO OF SPAN",
        md.span_length_m AS "SPAN LENGTH (M)",
        md.structure_width_m AS "STRUCTURE WIDTH (M)",
        md.construction_year AS "CONSTRUCTION YEAR",
        md.last_maintenance_date AS "LAST MAINTENANCE DATE",
        md.data_source AS "DATA SOURCE",
        md.date_time AS "DATE TIME",
        md.remarks AS "REMARKS",
        f.surveyed_by AS "SURVEYED BY",
        f."SpanIndex" AS "SPAN INDEX",
        f."WorkKindName" AS "WORK KIND NAME",
        f."PartsName" AS "PARTS NAME",
        f."MaterialName" AS "MATERIAL NAME",
        f."DamageKindName" AS "DAMAGE KIND NAME",
        f."DamageLevel" AS "DAMAGE LEVEL",
        f.damage_extent AS "DAMAGE EXTENT",
        f."Remarks" AS "SITUATION REMARKS",
        f.current_date_time AS "INSPECTION DATE",
        ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time DESC) AS "ROW RANK",
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
        COALESCE(f.inspection_images, '[]') AS "PhotoPaths"
      FROM bms.tbl_bms_master_data md
      JOIN bms.tbl_inspection_f f 
      ON (md.uu_bms_id = f.uu_bms_id AND f.surveyed_by = 'RAMS-UU' AND qc_rams = '0')
      WHERE 1=1
      AND md.uu_bms_id IN (
        SELECT DISTINCT f.uu_bms_id 
        FROM bms.tbl_inspection_f 
        WHERE surveyed_by = 'RAMS-UU' AND qc_rams = '0'
      )
    )
    SELECT * FROM ranked_data
  `;

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` WHERE "DISTRICT ID" = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND "BRIDGE NAME" ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND "STRUCTURE TYPE ID" = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "REFERENCE NO"`;

    const result = await pool.query(query, queryParams);

    // **Track First Row for Each uu_bms_id**
    let firstRowMap = new Map();

    // **Process Data**
    const processedData = result.rows.map((row) => {
      if (!firstRowMap.has(row["REFERENCE NO"])) {
        firstRowMap.set(row["REFERENCE NO"], true);
      } else {
        row["Overview Photos"] = null;
      }

      // **Fix Photo Paths**
      row["PhotoPaths"] = extractUrlsFromPath(row["PhotoPaths"]);

      return row;
    });

    res.json({
      success: true,
      bridges: processedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// briges details download for dashboard and evaluationn working correctly
app.get("/api/bridgesEvalDownloadExcel", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
    WITH ranked_data AS (
      SELECT 
        md.uu_bms_id AS "REFERENCE NO",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
        md.structure_type_id AS "STRUCTURE TYPE ID",
        md.structure_type AS "STRUCTURE TYPE",
        md.road_no AS "ROAD NO",
        md.road_name AS "ROAD NAME",
        md.road_name_cwd AS "ROAD NAME CWD",
        md.road_code_cwd AS "ROAD CODE CWD",
        md.route_id AS "ROUTE ID",
        md.survey_id AS "SURVEY ID",
        md.surveyor_name AS "SURVEYOR NAME",
        md.zone AS "ZONE",
        md.district AS "DISTRICT",
        md.road_classification AS "ROAD CLASSIFICATION",
        md.road_surface_type AS "ROAD SURFACE TYPE",
        md.carriageway_type AS "CARRIAGEWAY TYPE",
        md.direction AS "DIRECTION",
        md.visual_condition AS "VISUAL CONDITION",
        md.construction_type AS "CONSTRUCTION TYPE",
        md.no_of_span AS "NO OF SPAN",
        md.span_length_m AS "SPAN LENGTH (M)",
        md.structure_width_m AS "STRUCTURE WIDTH (M)",
        md.construction_year AS "CONSTRUCTION YEAR",
        md.last_maintenance_date AS "LAST MAINTENANCE DATE",
        md.data_source AS "DATA SOURCE",
        md.date_time AS "DATE TIME",
        md.remarks AS "REMARKS",
        f.surveyed_by AS "SURVEYED BY",
        f."SpanIndex" AS "SPAN INDEX",
        f."WorkKindName" AS "WORK KIND NAME",
        f."PartsName" AS "PARTS NAME",
        f."MaterialName" AS "MATERIAL NAME",
        f."DamageKindName" AS "DAMAGE KIND NAME",
        f."DamageLevel" AS "DAMAGE LEVEL",
        f.damage_extent AS "DAMAGE EXTENT",
        f."Remarks" AS "SITUATION REMARKS",
        f.current_date_time AS "INSPECTION DATE",
        ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time DESC) AS "ROW RANK",
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
        COALESCE(f.inspection_images, '[]') AS "PhotoPaths"
      FROM bms.tbl_bms_master_data md
      INNER JOIN bms.tbl_inspection_f f 
      ON md.uu_bms_id = f.uu_bms_id
      WHERE f."DamageLevelID" IN (4, 5, 6)
      AND (f.surveyed_by = 'RAMS-PITB' OR f.surveyed_by = 'RAMS-UU' AND f.qc_rams = 2)
    )
    SELECT * FROM ranked_data`;

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` WHERE "DISTRICT" = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND "BRIDGE NAME" ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND "STRUCTURE TYPE ID" = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "REFERENCE NO"`;

    const result = await pool.query(query, queryParams);

    let firstRowMap = new Map();
    const processedData = result.rows.map((row) => {
      if (!firstRowMap.has(row["REFERENCE NO"])) {
        firstRowMap.set(row["REFERENCE NO"], true);
      } else {
        row["Overview Photos"] = null;
      }
      row["PhotoPaths"] = extractUrlsFromPath(row["PhotoPaths"]);
      return row;
    });

    res.json({
      success: true,
      bridges: processedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// bridges details download csv for dashboard and evluation
app.get("/api/bridgesRamsDownloadCsv", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
      SELECT
        md.uu_bms_id AS "Reference No",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "Bridge Name",
        md.structure_type AS "Structure Type",
        md.road_no AS "Road No",
        md.road_name AS "Road Name",
        md.road_name_cwd AS "Road Name CWD",
        md.road_code_cwd AS "Road Code CWD",
        md.route_id AS "Route ID",
        md.survey_id AS "Survey ID",
        md.surveyor_name AS "Surveyor Name",
        md.zone AS "Zone",
        md.district AS "District",
        md.road_classification AS "Road Classification",
        md.road_surface_type AS "Road Surface Type",
        md.carriageway_type AS "Carriageway Type",
        md.direction AS "Direction",
        md.visual_condition AS "Visual Condition",
        md.construction_type AS "Construction Type",
        md.no_of_span AS "No Of Spans",
        md.span_length_m AS "Span Length (m)",
        md.structure_width_m AS "Structure Width (m)",
        md.construction_year AS "Construction Year",
        md.last_maintenance_date AS "Last Maintenance Date",
        md.data_source AS "Data Source",
        md.date_time AS "Date Time",
        md.remarks AS "Remarks",
        f."SpanIndex" AS "Span Index",
        f."WorkKindName" AS "Work Kind",
        f."PartsName" AS "Part Name",
        f."MaterialName" AS "Material Name",
        f."DamageKindName" AS "Damage Kind",
        f."DamageLevel" AS "Damage Level",
        f.damage_extent AS "Damage Extent",
        f."Remarks" AS "Situation Remarks",
        f."surveyed_by" AS "Surveyed By",
        f.current_date_time AS "Inspection Date"
      FROM bms.tbl_bms_master_data md
      RIGHT JOIN bms.tbl_inspection_f f ON (md.uu_bms_id = f.uu_bms_id AND f.surveyed_by = 'RAMS-UU' AND qc_con = '2' AND qc_rams = '0')
      AND md.uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU' AND qc_con = '2' AND qc_rams = '0')
      WHERE 1=1
    `; // 👈 Notice "WHERE 1=1" ensures the next conditions can safely be added

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "Reference No"`;

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

// bridges details download csv for evluation
app.get("/api/bridgesEvalDownloadCsv", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
WITH ranked_data AS (
  SELECT 
    md.uu_bms_id AS "REFERENCE NO",
    CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
    md.structure_type_id AS "STRUCTURE TYPE ID",
    md.structure_type AS "STRUCTURE TYPE",
    md.road_no AS "ROAD NO",
    md.road_name AS "ROAD NAME",
    md.road_name_cwd AS "ROAD NAME CWD",
    md.road_code_cwd AS "ROAD CODE CWD",
    md.route_id AS "ROUTE ID",
    md.survey_id AS "SURVEY ID",
    md.surveyor_name AS "SURVEYOR NAME",
    md.zone AS "ZONE",
    md.district AS "DISTRICT",
    md.road_classification AS "ROAD CLASSIFICATION",
    md.road_surface_type AS "ROAD SURFACE TYPE",
    md.carriageway_type AS "CARRIAGEWAY TYPE",
    md.direction AS "DIRECTION",
    md.visual_condition AS "VISUAL CONDITION",
    md.construction_type AS "CONSTRUCTION TYPE",
    md.no_of_span AS "NO OF SPAN",
    md.span_length_m AS "SPAN LENGTH (M)",
    md.structure_width_m AS "STRUCTURE WIDTH (M)",
    md.construction_year AS "CONSTRUCTION YEAR",
    md.last_maintenance_date AS "LAST MAINTENANCE DATE",
    md.data_source AS "DATA SOURCE",
    md.date_time AS "DATE TIME",
    md.remarks AS "REMARKS",
    f.surveyed_by AS "SURVEYED BY",
    f."SpanIndex" AS "SPAN INDEX",
    f."WorkKindName" AS "WORK KIND NAME",
    f."PartsName" AS "PARTS NAME",
    f."MaterialName" AS "MATERIAL NAME",
    f."DamageKindName" AS "DAMAGE KIND NAME",
    f."DamageLevel" AS "DAMAGE LEVEL",
    f.damage_extent AS "DAMAGE EXTENT",
    f."Remarks" AS "SITUATION REMARKS",
    f.current_date_time AS "INSPECTION DATE",
    ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time DESC) AS "ROW RANK",
    ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
    COALESCE(f.inspection_images, '[]') AS "PhotoPaths"
  FROM bms.tbl_bms_master_data md
  INNER JOIN bms.tbl_inspection_f f 
  ON md.uu_bms_id = f.uu_bms_id
  WHERE f."DamageLevelID" IN (4, 5, 6)
    AND (f.surveyed_by = 'RAMS-PITB' OR f.surveyed_by = 'RAMS-UU' AND f.qc_rams = 2)
)
SELECT * FROM ranked_data`;


    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "Reference No"`;

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

// briges details download excel for dashboard and evaluationn working correctly
app.get("/api/bridgesdownloadExcel", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
      WITH ranked_data AS (
        SELECT 
          md.uu_bms_id AS "REFERENCE NO",
          CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
          md.structure_type AS "STRUCTURE TYPE",
          md.road_no AS "ROAD NO",
          md.road_name AS "ROAD NAME",
          md.road_name_cwd AS "ROAD NAME CWD",
          md.road_code_cwd AS "ROAD CODE CWD",
          md.route_id AS "ROUTE ID",
          md.survey_id AS "SURVEY ID",
          md.pms_start AS "PMS START",
          md.pms_end AS "PMS END",
          md.survey_chainage_start AS "SURVEY CHAINAGE START",
          md.survey_chainage_end AS "SURVEY CHAINAGE END",
          md.pms_sec_id AS "PMS SEC ID",
          md.structure_no AS "STRUCTURE NO",
          md.surveyor_name AS "SURVEYOR NAME",
          md.zone_id AS "ZONE ID",
          md.zone AS "ZONE",
          md.district_id AS "DISTRICT ID",
          md.district AS "DISTRICT",
          md.road_classification_id AS "ROAD CLASSIFICATION ID",
          md.road_classification AS "ROAD CLASSIFICATION",
          md.road_surface_type_id AS "ROAD SURFACE TYPE ID",
          md.road_surface_type AS "ROAD SURFACE TYPE",
          md.carriageway_type_id AS "CARRIAGEWAY TYPE ID",
          md.carriageway_type AS "CARRIAGEWAY TYPE",
          md.direction AS "DIRECTION",
          md.visual_condition AS "VISUAL CONDITION",
          md.construction_type_id AS "CONSTRUCTION TYPE ID",
          md.construction_type AS "CONSTRUCTION TYPE",
          md.no_of_span AS "NO OF SPAN",
          md.span_length_m AS "SPAN LENGTH (M)",
          md.structure_width_m AS "STRUCTURE WIDTH (M)",
          md.construction_year AS "CONSTRUCTION YEAR",
          md.last_maintenance_date AS "LAST MAINTENANCE DATE",
          md.data_source AS "DATA SOURCE",
          md.date_time AS "DATE TIME",
          md.remarks AS "REMARKS",
          f.surveyed_by AS "SURVEYED BY",
          f."SpanIndex" AS "SPAN INDEX",
          f."WorkKindName" AS "WORK KIND NAME",
          f."PartsName" AS "PARTS NAME",
          f."MaterialName" AS "MATERIAL NAME",
          f."DamageKindID" AS "DAMAGE KIND ID",
          f."DamageKindName" AS "DAMAGE KIND NAME",
          f."DamageLevelID" AS "DAMAGE LEVEL ID",
          f."DamageLevel" AS "DAMAGE LEVEL",
          f.damage_extent AS "DAMAGE EXTENT",
          f."Remarks" AS "INSPECTION REMARKS",
          f.current_date_time AS "CURRENT DATE TIME",
          ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time DESC) AS "ROW RANK",
          ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
          COALESCE(f.inspection_images, '[]') AS "PhotoPaths"
        FROM bms.tbl_bms_master_data md
        JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
        WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "REFERENCE NO" ) SELECT * FROM ranked_data;`;

    const result = await pool.query(query, queryParams);

    // **Track First Row for Each uu_bms_id**
    let firstRowMap = new Map();

    // **Process Data**
    const processedData = result.rows.map((row) => {
      if (!firstRowMap.has(row["REFERENCE NO"])) {
        firstRowMap.set(row["REFERENCE NO"], true);
      } else {
        row["Overview Photos"] = null;
      }

      // **Fix Photo Paths**
      row["PhotoPaths"] = extractUrlsFromPath(row["PhotoPaths"]);

      return row;
    });

    res.json({
      success: true,
      bridges: processedData,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from the database",
    });
  }
});

// bridges details download csv for dashboard and evluation
app.get("/api/bridgesdownloadCsv", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

    let query = `
      SELECT
        md.uu_bms_id AS "Reference No",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "Bridge Name",
        md.structure_type AS "Structure Type",
        md.road_no AS "Road No",
        md.road_name AS "Road Name",
        md.road_name_cwd AS "Road Name CWD",
        md.road_code_cwd AS "Road Code CWD",
        md.route_id AS "Route ID",
        md.survey_id AS "Survey ID",
        md.surveyor_name AS "Surveyor Name",
        md.zone AS "Zone",
        md.district AS "District",
        md.road_classification AS "Road Classification",
        md.road_surface_type AS "Road Surface Type",
        md.carriageway_type AS "Carriageway Type",
        md.direction AS "Direction",
        md.visual_condition AS "Visual Condition",
        md.construction_type AS "Construction Type",
        md.no_of_span AS "No Of Spans",
        md.span_length_m AS "Span Length (m)",
        md.structure_width_m AS "Structure Width (m)",
        md.construction_year AS "Construction Year",
        md.last_maintenance_date AS "Last Maintenance Date",
        md.data_source AS "Data Source",
        md.date_time AS "Date Time",
        md.remarks AS "Remarks",
        f."SpanIndex" AS "Span Index",
        f."WorkKindName" AS "Work Kind",
        f."PartsName" AS "Part Name",
        f."MaterialName" AS "Material Name",
        f."DamageKindName" AS "Damage Kind",
        f."DamageLevel" AS "Damage Level",
        f.damage_extent AS "Damage Extent",
        f."Remarks" AS "Situation Remarks",
        f.current_date_time AS "Inspection Date"
      FROM bms.tbl_bms_master_data md
      LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
      WHERE 1=1
    `; // 👈 Notice "WHERE 1=1" ensures the next conditions can safely be added

    const queryParams = [];
    let paramIndex = 1;

    if (district !== "%") {
      query += ` AND md.district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    query += ` ORDER BY "Reference No"`;

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

// api for downloadig multipke birdges data export
app.get("/api/inspections-export-new", async (req, res) => {
  try {
    const { district = "%", structureType = "%", bridgeName = "%" } = req.query;

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

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(md.pms_sec_id, ',', md.structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND md.structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
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
        row["Reference No:"] = row["Reference No:"];
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

// Inspection export for consultant
app.get("/api/inspections-export-con", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    let query = `
      WITH ranked_data AS (
    SELECT 
        md.uu_bms_id AS "REFERENCE NO",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
        md.structure_type AS "STRUCTURE TYPE",
        md.road_no AS "ROAD NO",
        md.road_name AS "ROAD NAME",
        md.road_name_cwd AS "ROAD NAME CWD",
        md.road_code_cwd AS "ROAD CODE CWD",
        md.route_id AS "ROUTE ID",
        md.survey_id AS "SURVEY ID",
        md.surveyor_name AS "SURVEYOR NAME",
        md.zone AS "ZONE",
        md.district AS "DISTRICT",
        md.road_classification AS "ROAD CLASSIFICATION",
        md.road_surface_type AS "ROAD SURFACE TYPE",
        md.carriageway_type AS "CARRIAGEWAY TYPE",
        md.direction AS "DIRECTION",
        md.visual_condition AS "VISUAL CONDITION",
        md.construction_type AS "CONSTRUCTION TYPE",
        md.no_of_span AS "NO OF SPANS",
        md.span_length_m AS "SPAN LENGTH (M)",
        md.structure_width_m AS "STRUCTURE WIDTH (M)",
        md.construction_year AS "CONSTRUCTION YEAR",
        md.last_maintenance_date AS "LAST MAINTENANCE DATE",
        md.data_source AS "DATA SOURCE",
        md.date_time AS "DATE TIME",
        md.remarks AS "REMARKS",
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
        f.surveyed_by AS "SURVEYED BY",
        f."SpanIndex" AS "SPAN INDEX",
        f."WorkKindID" AS "WORK KIND ID",
        f."WorkKindName" AS "WORK KIND NAME",
        f."PartsID" AS "PARTS ID",
        f."PartsName" AS "PARTS NAME",
        f."MaterialID" AS "MATERIAL ID",
        f."MaterialName" AS "MATERIAL NAME",
        f."DamageKindID" AS "DAMAGE KIND ID",
        f."DamageKindName" AS "DAMAGE KIND NAME",
        f."DamageLevelID" AS "DAMAGE LEVEL ID",
        f."DamageLevel" AS "DAMAGE LEVEL",
        f.damage_extent AS "DAMAGE EXTENT",
        f."Remarks" AS "INSPECTION REMARKS",
        f.current_date_time AS "INSPECTION DATE",
        COALESCE(f.inspection_images, '[]') AS "PhotoPaths",

        ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time ASC) AS "RN"
    FROM bms.tbl_bms_master_data md
    LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
    WHERE f.surveyed_by = 'RAMS-UU'
)
SELECT * FROM ranked_data WHERE 1=1`;

    const queryParams = [];
    if (bridgeId && !isNaN(bridgeId)) {
      query += ` AND "REFERENCE NO" = $1`;
      queryParams.push(Number(bridgeId));
    }

    const result = await pool.query(query, queryParams);

    let firstRow = true;
    const processedData = result.rows.map((row) => {
      row.PhotoPaths = extractUrlsFromPath(row.PhotoPaths);

      if (!firstRow) {
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

// Inspection export for consultant
app.get("/api/inspections-export-rams", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    let query = `
      WITH ranked_data AS (
        SELECT 
          md.uu_bms_id AS "REFERENCE NO",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
        md.structure_type AS "STRUCTURE TYPE",
        md.road_no AS "ROAD NO",
        md.road_name AS "ROAD NAME",
        md.road_name_cwd AS "ROAD NAME CWD",
        md.road_code_cwd AS "ROAD CODE CWD",
        md.route_id AS "ROUTE ID",
        md.survey_id AS "SURVEY ID",
        md.surveyor_name AS "SURVEYOR NAME",
        md.zone AS "ZONE",
        md.district AS "DISTRICT",
        md.road_classification AS "ROAD CLASSIFICATION",
        md.road_surface_type AS "ROAD SURFACE TYPE",
        md.carriageway_type AS "CARRIAGEWAY TYPE",
        md.direction AS "DIRECTION",
        md.visual_condition AS "VISUAL CONDITION",
        md.construction_type AS "CONSTRUCTION TYPE",
        md.no_of_span AS "NO OF SPANS",
        md.span_length_m AS "SPAN LENGTH (M)",
        md.structure_width_m AS "STRUCTURE WIDTH (M)",
        md.construction_year AS "CONSTRUCTION YEAR",
        md.last_maintenance_date AS "LAST MAINTENANCE DATE",
        md.data_source AS "DATA SOURCE",
        md.date_time AS "DATE TIME",
        md.remarks AS "REMARKS",
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
        f.surveyed_by AS "SURVEYED BY",
        f."SpanIndex" AS "SPAN INDEX",
        f."WorkKindID" AS "WORK KIND ID",
        f."WorkKindName" AS "WORK KIND NAME",
        f."PartsID" AS "PARTS ID",
        f."PartsName" AS "PARTS NAME",
        f."MaterialID" AS "MATERIAL ID",
        f."MaterialName" AS "MATERIAL NAME",
        f."DamageKindID" AS "DAMAGE KIND ID",
        f."DamageKindName" AS "DAMAGE KIND NAME",
        f."DamageLevelID" AS "DAMAGE LEVEL ID",
        f."DamageLevel" AS "DAMAGE LEVEL",
        f.damage_extent AS "DAMAGE EXTENT",
        f."Remarks" AS "INSPECTION REMARKS",
        f.current_date_time AS "INSPECTION DATE",
        COALESCE(f.inspection_images, '[]') AS "PhotoPaths",

          ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time ASC) AS rn
        FROM bms.tbl_bms_master_data md
        LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
        WHERE f.surveyed_by = 'RAMS-UU' AND f.qc_con = '2'
      )
      SELECT * FROM ranked_data WHERE 1=1`;

    const queryParams = [];
    if (bridgeId && !isNaN(bridgeId)) {
      query += ` AND "REFERENCE NO" = $1`;
      queryParams.push(Number(bridgeId));
    }

    const result = await pool.query(query, queryParams);

    let firstRow = true;
    const processedData = result.rows.map((row) => {
      row.PhotoPaths = extractUrlsFromPath(row.PhotoPaths);

      if (!firstRow) {
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

// inspection download for evaluator login
app.get("/api/inspections-export-evaluator", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    let query = `
      WITH ranked_data AS (
        SELECT 
         md.uu_bms_id AS "REFERENCE NO",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
        md.structure_type AS "STRUCTURE TYPE",
        md.road_no AS "ROAD NO",
        md.road_name AS "ROAD NAME",
        md.road_name_cwd AS "ROAD NAME CWD",
        md.road_code_cwd AS "ROAD CODE CWD",
        md.route_id AS "ROUTE ID",
        md.survey_id AS "SURVEY ID",
        md.surveyor_name AS "SURVEYOR NAME",
        md.zone AS "ZONE",
        md.district AS "DISTRICT",
        md.road_classification AS "ROAD CLASSIFICATION",
        md.road_surface_type AS "ROAD SURFACE TYPE",
        md.carriageway_type AS "CARRIAGEWAY TYPE",
        md.direction AS "DIRECTION",
        md.visual_condition AS "VISUAL CONDITION",
        md.construction_type AS "CONSTRUCTION TYPE",
        md.no_of_span AS "NO OF SPANS",
        md.span_length_m AS "SPAN LENGTH (M)",
        md.structure_width_m AS "STRUCTURE WIDTH (M)",
        md.construction_year AS "CONSTRUCTION YEAR",
        md.last_maintenance_date AS "LAST MAINTENANCE DATE",
        md.data_source AS "DATA SOURCE",
        md.date_time AS "DATE TIME",
        md.remarks AS "REMARKS",
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
        f.surveyed_by AS "SURVEYED BY",
        f."SpanIndex" AS "SPAN INDEX",
        f."WorkKindID" AS "WORK KIND ID",
        f."WorkKindName" AS "WORK KIND NAME",
        f."PartsID" AS "PARTS ID",
        f."PartsName" AS "PARTS NAME",
        f."MaterialID" AS "MATERIAL ID",
        f."MaterialName" AS "MATERIAL NAME",
        f."DamageKindID" AS "DAMAGE KIND ID",
        f."DamageKindName" AS "DAMAGE KIND NAME",
        f."DamageLevelID" AS "DAMAGE LEVEL ID",
        f."DamageLevel" AS "DAMAGE LEVEL",
        f.damage_extent AS "DAMAGE EXTENT",
        f."Remarks" AS "INSPECTION REMARKS",
        f.current_date_time AS "INSPECTION DATE",
        COALESCE(f.inspection_images, '[]') AS "PhotoPaths",
          
          ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time ASC) AS rn
        FROM bms.tbl_bms_master_data md
        RIGHT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
      )
      SELECT * FROM ranked_data WHERE "DamageLevelID" IN (4, 5, 6)
        AND (
          surveyed_by = 'RAMS-PITB' 
          OR 
          (surveyed_by = 'RAMS-UU' AND qc_rams = 2)
        )`;

    const queryParams = [];
    if (bridgeId && !isNaN(bridgeId)) {
      query += ` AND "REFERENCE NO" = $1`;
      queryParams.push(Number(bridgeId));
    }

    const result = await pool.query(query, queryParams);

    let firstRow = true;
    const processedData = result.rows.map((row) => {
      row.PhotoPaths = extractUrlsFromPath(row.PhotoPaths);

      if (!firstRow) {
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

// export for BMS dashboard bdirges table whole
app.get("/api/inspections-export", async (req, res) => {
  try {
    const { bridgeId } = req.query;

    let query = `
      WITH ranked_data AS (
        SELECT 
           md.uu_bms_id AS "REFERENCE NO",
        CONCAT(md.pms_sec_id, ',', md.structure_no) AS "BRIDGE NAME",
        md.structure_type AS "STRUCTURE TYPE",
        md.road_no AS "ROAD NO",
        md.road_name AS "ROAD NAME",
        md.road_name_cwd AS "ROAD NAME CWD",
        md.road_code_cwd AS "ROAD CODE CWD",
        md.route_id AS "ROUTE ID",
        md.survey_id AS "SURVEY ID",
        md.surveyor_name AS "SURVEYOR NAME",
        md.zone AS "ZONE",
        md.district AS "DISTRICT",
        md.road_classification AS "ROAD CLASSIFICATION",
        md.road_surface_type AS "ROAD SURFACE TYPE",
        md.carriageway_type AS "CARRIAGEWAY TYPE",
        md.direction AS "DIRECTION",
        md.visual_condition AS "VISUAL CONDITION",
        md.construction_type AS "CONSTRUCTION TYPE",
        md.no_of_span AS "NO OF SPANS",
        md.span_length_m AS "SPAN LENGTH (M)",
        md.structure_width_m AS "STRUCTURE WIDTH (M)",
        md.construction_year AS "CONSTRUCTION YEAR",
        md.last_maintenance_date AS "LAST MAINTENANCE DATE",
        md.data_source AS "DATA SOURCE",
        md.date_time AS "DATE TIME",
        md.remarks AS "REMARKS",
        ARRAY[md.image_1, md.image_2, md.image_3, md.image_4, md.image_5] AS "Overview Photos",
        f.surveyed_by AS "SURVEYED BY",
        f."SpanIndex" AS "SPAN INDEX",
        f."WorkKindID" AS "WORK KIND ID",
        f."WorkKindName" AS "WORK KIND NAME",
        f."PartsID" AS "PARTS ID",
        f."PartsName" AS "PARTS NAME",
        f."MaterialID" AS "MATERIAL ID",
        f."MaterialName" AS "MATERIAL NAME",
        f."DamageKindID" AS "DAMAGE KIND ID",
        f."DamageKindName" AS "DAMAGE KIND NAME",
        f."DamageLevelID" AS "DAMAGE LEVEL ID",
        f."DamageLevel" AS "DAMAGE LEVEL",
        f.damage_extent AS "DAMAGE EXTENT",
        f."Remarks" AS "INSPECTION REMARKS",
        f.current_date_time AS "INSPECTION DATE",
        COALESCE(f.inspection_images, '[]') AS "PhotoPaths",

          ROW_NUMBER() OVER (PARTITION BY md.uu_bms_id ORDER BY f.current_date_time ASC) AS rn
        FROM bms.tbl_bms_master_data md
        LEFT JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
        WHERE
         "DamageLevelID" IN (1, 2, 3) 
    AND (
        f.surveyed_by = 'RAMS-PITB' 
        OR 
        (f.surveyed_by = 'RAMS-UU' AND qc_rams = 2)
    ) 
    AND md.uu_bms_id = $1  -- ✅ Added condition
      )
      SELECT * FROM ranked_data WHERE 1=1`;

    const queryParams = [];
    if (bridgeId && !isNaN(bridgeId)) {
      query += ` AND "REFERENCE NO" = $1`;
      queryParams.push(Number(bridgeId));
    }

    const result = await pool.query(query, queryParams);

    let firstRow = true;
    const processedData = result.rows.map((row) => {
      row.PhotoPaths = extractUrlsFromPath(row.PhotoPaths);

      if (!firstRow) {
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
        if (
          obj.path &&
          typeof obj.path === "string" &&
          obj.path.startsWith("http")
        ) {
          urls.push(obj.path);
        }
        Object.values(obj).forEach((value) => extractFromNested(value));
      } else if (typeof obj === "string" && obj.startsWith("http")) {
        urls.push(obj);
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
  if (!url || typeof url !== "string") return url;

  // Ensure consistent URL format
  url = url.replace(/\\/g, "/"); // ✅ Convert backslashes to forward slashes

  return url.includes("cnw.urbanunit.gov.pk")
    ? url.replace("cnw.urbanunit.gov.pk", "118.103.225.148")
    : url;
}

// bridges list for dashboard main
app.get("/api/bridges", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = "%",
      structureType = "%",
      bridgeName = "%",
      bridgeId = "%",
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

    if (bridgeId !== "%") {
      query += ` AND uu_bms_id = $${paramIndex}`;
      countQuery += ` AND uu_bms_id = $${paramIndex}`;
      queryParams.push(bridgeId);
      countParams.push(bridgeId);
      paramIndex++;
    }

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      countParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
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
      bridgeName = "%",
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
	  AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU')
    `;

    let countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
      WHERE 1=1
      AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU')
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

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      countParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
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

// bridges list for Consultant evaluation module
app.get("/api/bridgesCon", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = "%",
      structureType = "%",
      bridgeName = "%",
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
	  AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU')
    `;

    let countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
      WHERE 1=1
      AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU')
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

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      countParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
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

// bridges list for Consultant evaluation module
app.get("/api/bridgesRams", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = "%",
      structureType = "%",
      bridgeName = "%",
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
	  AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU' AND qc_con = '2' AND qc_rams = '0')
    `;

    let countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
      WHERE 1=1
      AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE surveyed_by = 'RAMS-UU' AND qc_con = '2' AND qc_rams = '0')
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

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      countParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
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

// bridges list for evaluation module for evaluator
app.get("/api/bridgesEvaluator", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = "%",
      structureType = "%",
      bridgeName = "%",
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
	  AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE "DamageLevelID" IN (4, 5, 6) 
    AND (
        surveyed_by = 'RAMS-PITB' 
        OR 
        (surveyed_by = 'RAMS-UU' AND qc_rams = 2)
    ) )
    `;

    let countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
      WHERE 1=1
      AND uu_bms_id IN (SELECT DISTINCT uu_bms_id FROM bms.tbl_inspection_f WHERE "DamageLevelID" IN (4, 5, 6) 
    AND (
        surveyed_by = 'RAMS-PITB' 
        OR 
        (surveyed_by = 'RAMS-UU' AND qc_rams = 2)
    ) )
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

    if (bridgeName && bridgeName.trim() !== "" && bridgeName !== "%") {
      query += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      countQuery += ` AND CONCAT(pms_sec_id, ',', structure_no) ILIKE $${paramIndex}`;
      queryParams.push(`%${bridgeName}%`);
      countParams.push(`%${bridgeName}%`);
      paramIndex++;
    }

    if (structureType !== "%") {
      query += ` AND structure_type_id = $${paramIndex}`;
      countQuery += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      countParams.push(structureType);
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

    // Build the base query without ORDER BY
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
        ins."current_date_time",  
        ins."Remarks", 
        ins.inspection_images AS "PhotoPaths"
      FROM bms.tbl_inspection_f AS ins
      JOIN bms.tbl_bms_master_data AS bmd 
        ON ins."uu_bms_id" = bmd."uu_bms_id"
      WHERE 1=1
      AND ins."DamageLevelID" IN (1, 2, 3) 
    AND (
        ins.surveyed_by = 'RAMS-PITB' 
        OR 
        (ins.surveyed_by = 'RAMS-UU' AND qc_rams = 2)
    ) 
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

    // Append ORDER BY clause after dynamic filters
    query += ` ORDER BY inspection_id DESC;`;

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

// for evaluator summary data
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
      WHERE
     "DamageLevelID" IN (1, 2, 3) 
    AND (
        surveyed_by = 'RAMS-PITB' 
        OR 
        (surveyed_by = 'RAMS-UU' AND qc_rams = 2)
    ) 
    AND uu_bms_id = $1  -- ✅ Added condition
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

// for consultant summary data
app.get("/api/get-summary-con", async (req, res) => {
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
	  AND qc_con = '1'
	  AND surveyed_by = 'RAMS-UU'
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

// for rams summary data
app.get("/api/get-summary-rams", async (req, res) => {
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
        qc_rams,
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
        "inspection_images" AS "PhotoPaths",
        "ApprovedFlag"
      FROM bms.tbl_inspection_f
      WHERE uu_bms_id = $1 
	  AND qc_con = '2'
    AND qc_rams = '0'
	  AND surveyed_by = 'RAMS-UU'
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

app.get("/api/get-summary-evaluator", async (req, res) => {
  try {
    const { bridgeId, userId } = req.query;

    if (!bridgeId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "bridgeId and userId are required" });
    }

    const evaluatorLevel = parseInt(userId);

    if (![1, 2, 3, 4, 5].includes(evaluatorLevel)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid evaluator ID" });
    }

    // Define condition based on evaluator ID
    let evaluationCondition = "";
    switch (evaluatorLevel) {
      case 1:
        evaluationCondition = `evaluator_id ILIKE '%0%'`; // E1
        break;
      case 2:
        evaluationCondition = `evaluator_id NOT ILIKE '%2%'`; // E2
        break;
      case 3:
        evaluationCondition = `evaluator_id NOT ILIKE '%3%'`; // E3
        break;
      case 4:
        evaluationCondition = `evaluator_id NOT ILIKE '%4%'`; // E4
        break;
      case 5:
        evaluationCondition = `evaluator_id = '1,2,3,4' AND evaluator_id NOT ILIKE '%5%'`; // E5
        break;
    }

    // SQL query
    const query = `
      SELECT 
        uu_bms_id, inspection_id, surveyed_by, district_id,
        damage_extent, qc_rams, qc_remarks_rams, qc_remarks_con, evaluator_id,
        reviewed_by, bridge_name, "SpanIndex", "WorkKindID", "WorkKindName",
        "PartsName", "PartsID", "MaterialName", "MaterialID", "DamageKindName",
        "DamageKindID", "DamageLevel", "DamageLevelID", "Remarks",
        COALESCE(string_to_array(NULLIF(inspection_images, ''), ','), '{}') AS "PhotoPaths"
      FROM bms.tbl_inspection_f
      WHERE 
        "DamageLevelID" IN (4, 5, 6) 
        AND ("surveyed_by" = 'RAMS-PITB' OR ("surveyed_by" = 'RAMS-UU' AND qc_rams = 2))
        AND uu_bms_id = $1  
        AND ${evaluationCondition}  -- Corrected condition
      ORDER BY inspection_id DESC;
    `;

    const result = await pool.query(query, [bridgeId]);

    // Function to extract valid URLs
    const extractUrlsFromPath = (pathString) => {
      if (!pathString || typeof pathString !== "string") return [];
      const trimmedPath = pathString.trim();
      if (trimmedPath.startsWith("http")) return [trimmedPath];

      try {
        const parsed = JSON.parse(trimmedPath);
        const urls = [];

        const extractFromNested = (obj) => {
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
        };

        extractFromNested(parsed);
        return urls;
      } catch (e) {
        const urlMatches = trimmedPath.match(
          /(http[^"]+\.(jpg|jpeg|png|gif))/g
        );
        return urlMatches || [];
      }
    };

    // Format the response data
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

        return { ...row, PhotoPaths: extractedUrls };
      });

    // Return only one dataset under `pending`
    res.status(200).json({
      success: true,
      data: formatRows(result.rows),
    });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// api endpoint for consultant inspections data
app.get("/api/get-inspections-con", async (req, res) => {
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
      AND surveyed_by = 'RAMS-UU'
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
      AND surveyed_by = 'RAMS-UU'
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
      AND surveyed_by = 'RAMS-UU'
      ORDER BY inspection_id DESC;
    `;

    const unapprovedRamsQuery = `
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
      AND qc_rams = '3'
      AND surveyed_by = 'RAMS-UU'
      ORDER BY inspection_id DESC;
    `;

    const [pendingRows, approvedRows, unapprovedRows, unapprovedRamsRows] =
      await Promise.all([
        pool.query(pendingQuery, [bridgeId]),
        pool.query(approvedQuery, [bridgeId]),
        pool.query(unapprovedQuery, [bridgeId]),
        pool.query(unapprovedRamsQuery, [bridgeId]),
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
        unapproved_by_rams: formatRows(unapprovedRamsRows.rows),
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
       AND surveyed_by = 'RAMS-UU'
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
        AND surveyed_by = 'RAMS-UU'
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
        AND surveyed_by = 'RAMS-UU'
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

app.get("/api/get-inspections-evaluator", async (req, res) => {
  try {
    const { bridgeId, userId } = req.query;

    if (!bridgeId || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "bridgeId and userId are required" });
    }

    const evaluatorLevel = parseInt(userId);

    if (![1, 2, 3, 4, 5].includes(evaluatorLevel)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid evaluator ID" });
    }

    // Define condition based on evaluator ID
    let evaluationCondition = "";
    switch (evaluatorLevel) {
      case 1:
        evaluationCondition = `evaluator_id ILIKE '%0%'`; // E1
        break;
      case 2:
        evaluationCondition = `evaluator_id NOT ILIKE '%2%'`; // E2
        break;
      case 3:
        evaluationCondition = `evaluator_id NOT ILIKE '%3%'`; // E3
        break;
      case 4:
        evaluationCondition = `evaluator_id NOT ILIKE '%4%'`; // E4
        break;
      case 5:
        evaluationCondition = `evaluator_id = '1,2,3,4' AND evaluator_id NOT ILIKE '%5%'`; // E5
        break;
    }

    // SQL query
    const query = `
      SELECT 
        uu_bms_id, inspection_id, surveyed_by, district_id,
        damage_extent, qc_rams, qc_remarks_rams, qc_remarks_con, evaluator_id,
        reviewed_by, bridge_name, "SpanIndex", "WorkKindID", "WorkKindName",
        "PartsName", "PartsID", "MaterialName", "MaterialID", "DamageKindName",
        "DamageKindID", "DamageLevel", "DamageLevelID", "Remarks",
        COALESCE(string_to_array(NULLIF(inspection_images, ''), ','), '{}') AS "PhotoPaths"
      FROM bms.tbl_inspection_f
      WHERE 
        "DamageLevelID" IN (4, 5, 6) 
        AND ("surveyed_by" = 'RAMS-PITB' OR ("surveyed_by" = 'RAMS-UU' AND qc_rams = 2))
        AND uu_bms_id = $1  
        AND ${evaluationCondition}  -- Corrected condition
      ORDER BY inspection_id DESC;
    `;

    const result = await pool.query(query, [bridgeId]);

    // Function to extract valid URLs
    const extractUrlsFromPath = (pathString) => {
      if (!pathString || typeof pathString !== "string") return [];
      const trimmedPath = pathString.trim();
      if (trimmedPath.startsWith("http")) return [trimmedPath];

      try {
        const parsed = JSON.parse(trimmedPath);
        const urls = [];

        const extractFromNested = (obj) => {
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
        };

        extractFromNested(parsed);
        return urls;
      } catch (e) {
        const urlMatches = trimmedPath.match(
          /(http[^"]+\.(jpg|jpeg|png|gif))/g
        );
        return urlMatches || [];
      }
    };

    // Format the response data
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

        return { ...row, PhotoPaths: extractedUrls };
      });

    // Return only one dataset under `pending`
    res.status(200).json({
      success: true,
      data: {
        pending: formatRows(result.rows),
      },
    });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/get-past-evaluations", async (req, res) => {
  try {
    const { inspectionId, userId } = req.query;

    if (!inspectionId || !userId) {
      return res.status(400).json({
        success: false,
        message: "inspectionId and userId are required",
      });
    }

    let query = `
        SELECT 
          uu_bms_id, evaluator_id, inspection_id, district_id, damage_extent, qc_remarks_rams,
          evaluator_remarks,qc_remarks_con, bridge_name, "SpanIndex", "WorkKindID", "WorkKindName",
          "PartsName", "PartsID", "MaterialName", "MaterialID", "DamageKindName",
          "DamageKindID", "DamageLevel", "DamageLevelID", "Remarks",
          COALESCE(string_to_array(inspection_images, ','), '{}') AS "PhotoPaths"
        FROM bms.tbl_evaluation
        WHERE inspection_id = $1
    `;

    // Apply condition based on userId
    if (userId == 2) {
      query += ` AND evaluator_id = '1'`;
    } else if (userId == 3) {
      query += ` AND evaluator_id IN ('1', '2')`;
    } else if (userId == 4) {
      query += ` AND evaluator_id IN ('1', '2', '3')`;
    } else if (userId == 5) {
      query += ` AND evaluator_id IN ('1', '2', '3', '4')`;
    }

    query += ` ORDER BY inspection_id DESC;`;

    const { rows } = await pool.query(query, [inspectionId]);

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching past evaluations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Endpoint to update inspection data for consultant
app.put("/api/update-inspection-con", async (req, res) => {
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

// Endpoint to insert inspection data for Evaluator
app.post("/api/insert-inspection-evaluator", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      inspection_id,
      uu_bms_id,
      bridge_name,
      district_id,
      SpanIndex,
      WorkKindID,
      WorkKindName,
      qc_remarks_con,
      qc_remarks_rams,
      qc_remarks_evaluator,
      situation_remarks,
      PartsID,
      PartsName,
      MaterialID,
      MaterialName,
      DamageKindID,
      DamageKindName,
      DamageLevelID,
      DamageLevel,
      damage_extent,
      evaluator_id,
      inspection_images,
    } = req.body;

    await client.query("BEGIN"); // Start transaction

    // Insert evaluation data into tbl_evaluation
    const insertQuery = `
      INSERT INTO bms.tbl_evaluation (
        inspection_id,
        uu_bms_id,
        bridge_name,
        district_id,
        "SpanIndex",
        "WorkKindID",
        "WorkKindName",
        inspection_images,
        qc_remarks_con,
        qc_remarks_rams,
        evaluator_remarks,
        "Remarks",
        evaluator_id,
        "PartsID",
        "PartsName",
        "MaterialID",
        "MaterialName",
        "DamageKindID",
        "DamageKindName",
        "DamageLevelID",
        "DamageLevel",
        damage_extent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *;
    `;

    const insertValues = [
      inspection_id,
      uu_bms_id,
      bridge_name,
      district_id,
      SpanIndex,
      WorkKindID,
      WorkKindName,
      inspection_images,
      qc_remarks_con,
      qc_remarks_rams,
      qc_remarks_evaluator,
      situation_remarks,
      evaluator_id,
      PartsID,
      PartsName,
      MaterialID,
      MaterialName,
      DamageKindID,
      DamageKindName,
      DamageLevelID,
      DamageLevel,
      damage_extent,
    ];

    const result = await client.query(insertQuery, insertValues);

    // Update evaluator_id in tbl_inspection_f
    const updateQuery = `
      UPDATE bms.tbl_inspection_f 
      SET evaluator_id = 
        CASE 
          WHEN evaluator_id = '0' OR evaluator_id IS NULL OR evaluator_id = '' THEN $2 
          ELSE evaluator_id || ',' || $2 
        END
      WHERE inspection_id = $1;
    `;

    await client.query(updateQuery, [inspection_id, evaluator_id]);

    // Special condition: If evaluator_id == 5, also insert into tbl_evaluation_f
    if (evaluator_id == "5") {
      const insertSpecialValues = [
        inspection_id,
        uu_bms_id,
        bridge_name,
        district_id,
        SpanIndex,
        WorkKindID,
        WorkKindName,
        inspection_images,
        qc_remarks_con,
        qc_remarks_rams,
        qc_remarks_evaluator, // Fix: Correct column match
        situation_remarks, // Fix: Ensure correct column order
        PartsID,
        PartsName,
        MaterialID,
        MaterialName,
        DamageKindID,
        DamageKindName,
        DamageLevelID,
        DamageLevel,
        damage_extent,
      ];

      const insertSpecialQuery = `
        INSERT INTO bms.tbl_evaluation_f (
          inspection_id,
          uu_bms_id,
          bridge_name,
          district_id,
          "SpanIndex",
          "WorkKindID",
          "WorkKindName",
          inspection_images,
          qc_remarks_con,
          qc_remarks_rams,
          evaluator_final_remarks,  -- Fix: Correct column match
          "Remarks",
          "PartsID",
          "PartsName",
          "MaterialID",
          "MaterialName",
          "DamageKindID",
          "DamageKindName",
          "DamageLevelID",
          "DamageLevel",
          damage_extent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21);
      `;

      await client.query(insertSpecialQuery, insertSpecialValues);
    }

    await client.query("COMMIT"); // Commit transaction

    res.status(201).json({
      message: "Evaluation done successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction on error
    console.error("Error inserting evaluation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});

// api for structure types
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
