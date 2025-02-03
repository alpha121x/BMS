const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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
    SELECT id, username, password,  phone_num, email, id, is_active
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
        role: user.role,
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
    SELECT id, username, password, phone_num,  email, id, is_active
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
        role: user.role,
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

// API endpoint to get counts for structure types and total "Arch" construction types
app.get('/api/structure-counts', async (req, res) => {
  try {
    // 1. Count of each structure_type
    const structureTypeCounts = await pool.query(`
      SELECT structure_type, COUNT(*) AS count
      FROM bms.tbl_bms_master_data
      GROUP BY structure_type
      ORDER BY count DESC;
    `);

    // 2. Count of records where construction_type contains 'Arch'
    const totalArchCount = await pool.query(`
      SELECT COUNT(*) AS total_count
      FROM bms.tbl_bms_master_data
      WHERE construction_type ILIKE '%Arch%';
    `);

    // 3. Total count of all records (for structure_type)
    const totalStructureCount = await pool.query(`
      SELECT COUNT(*) AS total_count
      FROM bms.tbl_bms_master_data;
    `);

    // Return all the counts as a single JSON response
    res.json({
      structureTypeCounts: structureTypeCounts.rows,
      totalStructureCount: totalStructureCount.rows[0].total_count,
      totalArchCount: totalArchCount.rows[0].total_count,
    });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Define the API endpoint to get data from `bms.tbl_bms_master_data`
app.get("/api/bridgesdownload", async (req, res) => {
  try {
    const {
      district = '%',
      structureType,
      constructionType,
      minBridgeLength,
      maxBridgeLength,
      minSpanLength,
      maxSpanLength,
      minYear,
      maxYear,
    } = req.query;

    let query = `
      SELECT 
        uu_bms_id, 
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

    const queryParams = [];
    let paramIndex = 1;

    // Filter by district
    if (district !== '%') {
      query += ` AND district_id = $${paramIndex}`;
      queryParams.push(district);
      paramIndex++;
    }

    // Filter by structure type
    if (structureType) {
      query += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }

    // Filter by construction type
    if (constructionType) {
      query += ` AND construction_type_id = $${paramIndex}`;
      queryParams.push(constructionType);
      paramIndex++;
    }

    // Filter by bridge width (min and max)
    if (minBridgeLength) {
      query += ` AND structure_width_m >= $${paramIndex}`;
      queryParams.push(minBridgeLength);
      paramIndex++;
    }
    if (maxBridgeLength) {
      query += ` AND structure_width_m <= $${paramIndex}`;
      queryParams.push(maxBridgeLength);
      paramIndex++;
    }

    // Filter by span length (min and max)
    if (minSpanLength) {
      query += ` AND span_length_m >= $${paramIndex}`;
      queryParams.push(minSpanLength);
      paramIndex++;
    }
    if (maxSpanLength) {
      query += ` AND span_length_m <= $${paramIndex}`;
      queryParams.push(maxSpanLength);
      paramIndex++;
    }

    // Filter by construction year (min and max)
    if (minYear) {
      query += ` AND construction_year >= $${paramIndex}`;
      queryParams.push(minYear);
      paramIndex++;
    }
    if (maxYear) {
      query += ` AND construction_year <= $${paramIndex}`;
      queryParams.push(maxYear);
      paramIndex++;
    }

    // Execute the query without pagination (no OFFSET and LIMIT)
    const result = await pool.query(query, queryParams);

    // Send the result as the response
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

// API Endpoint
app.get("/api/bridgesdownloadNew", async (req, res) => {
  try {
    const query = `
      SELECT md.uu_bms_id, md.structure_type_id, md.structure_type, md.road_no, md.road_name_id, md.road_name, 
             md.road_name_cwd, md.road_code_cwd, md.route_id, md.survey_id, md.pms_start, md.pms_end, 
             md.survey_chainage_start, md.survey_chainage_end, md.pms_sec_id, md.structure_no, md.surveyor_name, 
             md.zone_id, md.zone, md.district_id, md.district, md.road_classification_id, md.road_classification, 
             md.road_surface_type_id, md.road_surface_type, md.carriageway_type_id, md.carriageway_type,
             md.direction, md.visual_condition, md.construction_type_id, md.construction_type, md.no_of_span, 
             md.span_length_m, md.structure_width_m, md.construction_year, md.last_maintenance_date, 
             md.data_source, md.date_time, md.remarks, f.surveyed_by, f."SpanIndex", f."WorkKindID", 
             f."WorkKindName", f."PartsID", f."PartsName", f."MaterialID", f."MaterialName",
             f."DamageKindID", f."DamageKindName", f."DamageLevelID", f."DamageLevel", f.damage_extent, 
             f."Remarks", f.current_date_time, photopath
      FROM bms.tbl_bms_master_data md
      JOIN bms.tbl_inspection_f f ON md.uu_bms_id = f.uu_bms_id
      WHERE f.inspection_id IN (
          SELECT inspection_id FROM (
              SELECT DISTINCT ON (uu_bms_id, "SpanIndex", "WorkKindID") uu_bms_id, "SpanIndex", "WorkKindID", 
                     inspection_id, current_date_time 
              FROM bms.tbl_inspection_f 
              ORDER BY uu_bms_id, "SpanIndex", "WorkKindID", current_date_time DESC
          ) subquery
      );
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching bridge data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/bridges", async (req, res) => {
  try {
    const {
      set = 0,
      limit = 10,
      district = '%',
      structureType,
      constructionType,
      minBridgeLength,
      maxBridgeLength,
      minSpanLength,
      maxSpanLength,
      minYear,
      maxYear,
    } = req.query;

    let query = `
      SELECT 
        uu_bms_id, 
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

    if (district !== '%') {
      query += ` AND district_id = $${paramIndex}`;
      countQuery += ` AND district_id = $${paramIndex}`;
      queryParams.push(district);
      countParams.push(district);
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

    query += ` ORDER BY uu_bms_id OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`;
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

app.get("/api/inspections", async (req, res) => {
  try {
    const query = `
      SELECT 
        bridge_name, "SpanIndex", "WorkKindName", "PartsName", "MaterialName", 
        "DamageKindName", "DamageLevel", 
        "Remarks", "photopath", "ApprovedFlag"
      FROM bms.tbl_inspection_f;
    `;

    const { rows } = await pool.query(query);

    // Map over the rows to handle the data manipulation
    const modifiedRows = rows.map(row => {
      return {
        ...row,
        photopath: row.photopath && Array.isArray(row.photopath) ? row.photopath.map(p => p.path) : [],  // Extract all paths from photopath array
        ApprovedFlag: row.ApprovedFlag === 1 ? "Approved" : "Unapproved"  // Mapping ApprovedFlag to approved/unapproved
      };
    });

    res.json({ success: true, data: modifiedRows });
  } catch (error) {
    console.error("Error fetching inspection data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/get-inspections", async (req, res) => {
  const { bridgeId } = req.query; // Only fetch bridgeId from query parameters

  if (!bridgeId) {
    return res.status(400).json({ error: "Bridge ID (ObjectID) is required." });
  }

  let query = `
    SELECT 
      o."ObjectID", 
      o."CheckingID", 
      o."SpanIndex",  
      o."ApprovedFlag",
      o."Remarks",
      wk."WorkKindName", 
      p."PartsName", 
      m."MaterialName", 
      dk."DamageKindName", 
      CONCAT(b."pms_sec_id", '-', b."structure_no") AS "BridgeName", 
      dl."DamageLevel",
      COALESCE(ph.photos, ARRAY[]::text[]) AS "PhotoPaths"
    FROM bms."tbl_checkings" o
    LEFT JOIN bms."tbl_work_kinds" wk ON o."WorkKindID" = wk."WorkKindID"
    LEFT JOIN bms."tbl_bms_master_data" b ON o."ObjectID" = b."uu_bms_id"
    LEFT JOIN bms."tbl_parts" p ON o."PartsID" = p."PartsID"
    LEFT JOIN bms."tbl_materials" m ON o."MaterialID" = m."MaterialID"
    LEFT JOIN bms."tbl_damage_kinds" dk ON o."DamageKindID" = dk."DamageKindID"
    LEFT JOIN bms."tbl_damage_levels" dl ON o."DamageLevelID" = dl."DamageLevelID"
    LEFT JOIN (
      SELECT 
        "CheckingID", 
        ARRAY_AGG("photopath") AS photos
      FROM bms."tbl_checking_photos"
      GROUP BY "CheckingID"
    ) ph ON o."CheckingID" = ph."CheckingID"
    WHERE o."ObjectID" = $1
    GROUP BY 
      o."ObjectID", 
      o."CheckingID", 
      o."SpanIndex", 
      o."ApprovedFlag",  
      o."Remarks", 
      wk."WorkKindName", 
      p."PartsName", 
      m."MaterialName", 
      dk."DamageKindName", 
      b."pms_sec_id",
      b."structure_no", 
      dl."DamageLevel", 
      ph.photos
    ORDER BY o."CheckingID" ASC;
  `;

  try {
    const result = await pool.query(query, [bridgeId]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching inspections data:", error.message);
    res.status(500).json({
      error: "An error occurred while fetching inspections data.",
    });
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
      "SELECT \"WorkKindID\", \"WorkKindName\" FROM bms.tbl_work_kinds"
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
      "SELECT \"PartsID\", \"PartsName\" FROM bms.tbl_parts"
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
      "SELECT \"MaterialID\", \"MaterialName\" FROM bms.tbl_materials"
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
      "SELECT \"DamageLevelID\", \"DamageLevel\" FROM bms.tbl_damage_levels"
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
      "SELECT \"DamageKindID\", \"DamageKindName\" FROM bms.tbl_damage_kinds"
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
app.get('/api/visual-conditions', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, visual_condition FROM bms.tbl_visual_conditions');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching visual conditions:', error);
    res.status(500).json({ error: 'Failed to fetch visual conditions' });
  }
});

// API for Road Classifications
app.get('/api/road-classifications', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, road_classification FROM bms.tbl_road_classifications');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching road classifications:', error);
    res.status(500).json({ error: 'Failed to fetch road classifications' });
  }
});

// API for Road Surface Types
app.get('/api/road-surface-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, road_surface_type FROM bms.tbl_road_surface_types');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching road surface types:', error);
    res.status(500).json({ error: 'Failed to fetch road surface types' });
  }
});

// Set up multer to store uploaded files in a dynamically specified directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get the directory path from the request body
    const directoryPath = req.body.directoryPath;

    if (!directoryPath) {
      return cb(new Error("No directory path specified."));
    }

    // Make sure the directory exists, or create it
    const fullPath = path.join(__dirname, directoryPath);
    fs.mkdirSync(fullPath, { recursive: true });

    // Store the file in the specified directory
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename using current timestamp and file extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Set up multer upload middleware
const upload = multer({ storage });

// Route to handle file upload
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Get the directory path from the body and generate the image URL
  const directoryPath = req.body.directoryPath;
  const uploadedFileUrl = path
    .join(directoryPath, req.file.filename)
    .replace(/\\/g, "/");

  // Send back the image URL and filename
  res.json({
    imageUrl: `${uploadedFileUrl}`, // Return the full URL of the uploaded image
    filename: req.file.filename, // Send back the filename to the frontend
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
