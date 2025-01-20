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
    SELECT id, username, password, phone_num, email, id, is_active
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
        roleId: user.role_id,
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
        roleId: user.role_id,
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
    SELECT id, username, password, phone_num, email, id, is_active
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
        roleId: user.role_id,
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
        roleId: user.role_id,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
      query += ` AND district LIKE $${paramIndex}::VARCHAR`;
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

    const queryParams = [];
    let paramIndex = 1;

    // Explicitly cast district parameter to text
    if (district !== '%') {
      query += ` AND district LIKE $${paramIndex}::VARCHAR`;
      queryParams.push(district);
      paramIndex++;
    }
    if (structureType) {
      query += ` AND structure_type_id = $${paramIndex}`;
      queryParams.push(structureType);
      paramIndex++;
    }
    if (constructionType) {
      query += ` AND construction_type_id = $${paramIndex}`;
      queryParams.push(constructionType);
      paramIndex++;
    }
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

    query += ` ORDER BY uu_bms_id OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`;
    queryParams.push(parseInt(set, 10), parseInt(limit, 10));

    const result = await pool.query(query, queryParams);

    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bms.tbl_bms_master_data
    `;
    const countResult = await pool.query(countQuery);

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

app.get("/api/get-inspections", async (req, res) => {
  const { bridgeId, type } = req.query; // Fetch bridgeId and type from the query parameters

  if (!bridgeId) {
    return res.status(400).json({ error: "Bridge ID (ObjectID) is required." });
  }

  let query = "";
  let params = [bridgeId];

  // Determine which query to execute based on the `type` parameter
  if (type === "new") {
    query = `
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
        dl."DamageLevel"
      FROM bms."tbl_checkings" o
      LEFT JOIN bms."tbl_work_kinds" wk ON o."WorkKindID" = wk."WorkKindID"
      LEFT JOIN bms."tbl_bms_master_data" b ON o."ObjectID" = b."uu_bms_id"
      LEFT JOIN bms."tbl_parts" p ON o."PartsID" = p."PartsID"
      LEFT JOIN bms."tbl_materials" m ON o."MaterialID" = m."MaterialID"
      LEFT JOIN bms."tbl_damage_kinds" dk ON o."DamageKindID" = dk."DamageKindID"
      LEFT JOIN bms."tbl_damage_levels" dl ON o."DamageLevelID" = dl."DamageLevelID"
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
        dl."DamageLevel"
      ORDER BY o."CheckingID" ASC;
    `;
  } else if (type === "old") {
    query = `
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
          "checkingid", 
          ARRAY_AGG("photopath") AS photos
        FROM bms."tbl_checking_photos"
        GROUP BY "checkingid"
      ) ph ON o."CheckingID" = ph."checkingid"
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
  } else {
    return res
      .status(400)
      .json({ error: "Invalid type. Must be 'new' or 'old'." });
  }

  try {
    // Execute the appropriate query with the bridgeId parameter
    const result = await pool.query(query, params);

    // Return the rows as JSON with detailed data
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching inspections data:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching inspections data." });
  }
});

app.get("/api/structure-types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, structure_type FROM bms.tbl_structure_types"
    );
    res.status(200).json({
      success: true,
      data: result.rows,
    });
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
    res.status(200).json({
      success: true,
      data: result.rows,
    });
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
    res.status(200).json({
      success: true,
      data: result.rows,
    });
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
