const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const JWT_SECRET = "123456789";

const app = express();
const port = process.env.PORT || 8081;

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
    SELECT id, username, password, phone_num, email, role_id, is_active
    FROM public.tbl_users
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
    SELECT id, username, password, phone_num, email, role_id, is_active
    FROM public.tbl_users
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

// API endpoint to fetch bridge data with filtering by ZoneID and DistrictID
app.get("/api/bridges", async (req, res) => {
  const { district, zone } = req.query; // Receive 'district' and 'zone' from the query parameters

  let queryParams = [];
  let whereClauses = [];

  // Add condition for ZoneID if provided
  if (zone) {
    queryParams.push(zone);
    whereClauses.push(`"ZoneID"::text ILIKE $${queryParams.length}`);
  }

  // Add condition for DistrictID if provided
  if (district) {
    queryParams.push(district);
    whereClauses.push(`"DistrictID"::text ILIKE $${queryParams.length}`);
  }

  // Base query with the new column names
  let query = `
    SELECT 
      "ObjectID", 
      "bridge_name", 
      "BridgeCode", 
      "RoadNumber", 
      "StructureTypeID", 
      "RouteID", 
      "SurveyID", 
      "PmsChainageStart", 
      "PmsChainageEnd", 
      "SurveyChainageStart", 
      "SurveyChainageEnd", 
      "PmsSectionID", 
      "StructureNO", 
      "ZoneID", 
      "DistrictID", 
      "RoadClassificationID", 
      "RoadSurfaceTypeID", 
      "CarriagewayType", 
      "DirectionID", 
      "ConstructionTypeID", 
      "NumberOfSpan", 
      "SpanLengthM", 
      "WidthOfStructureM", 
      "ConstructionYear", 
      "LastMaintenanceDate", 
      "DataSource", 
      "Date", 
      "XCentroID", 
      "YCentroID", 
      "CwdRoadCode", 
      "ManageOrganizationID", 
      "ManageStaffID", 
      "IsDrawingsExist", 
      "DrawingRemarks", 
      "TrafficVolume", 
      "LargeVehicleTrafficVolume", 
      "StrVisualCondition", 
      "VisualConditionID", 
      "InspectionEquipmentID", 
      "InspectionEquipmentRemarks", 
      "BridgeUnderSituationID", 
      "BridgeUnderSituationRemarks", 
      "TestOrganizationID", 
      "TestStaffID", 
      "ApprovedOrganizationID", 
      "ApprovedUserID", 
      "Remarks", 
      "DeleteFlag", 
      "InYMD", 
      "UpYMD", 
      "LengthOfStructureM"
    FROM bms.tbl_bridges
  `;

  // Add WHERE clause if filters exist
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  query += `
    ORDER BY "ObjectID" ASC;
  `;

  try {
    // Query execution with parameters
    const result = await pool.query(query, queryParams);

    // Send the result rows as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching bridge data:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching bridge data." });
  }
});


// API endpoint to fetch inspections and related checkings data based on bridgeId (ObjectID)
app.get("/api/get-inspections", async (req, res) => {
  const { bridgeId } = req.query; // Fetch the bridgeId from the query parameters

  if (!bridgeId) {
    return res.status(400).json({ error: "Bridge ID (ObjectID) is required." });
  }

  // Query to fetch inspections and related checkings data where ObjectID matches the bridgeId
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
    b."BridgeName", 
    dl."DamageLevel",
    -- Aggregate photo URLs into an array for each CheckingID
    array_agg(cp."PhotoPath") AS Photos
  FROM public."D_Checkings" o
  LEFT JOIN public."M_WorkKinds" wk ON o."WorkKindID" = wk."WorkKindID"
  LEFT JOIN public."D_Objects" b ON o."ObjectID" = b."ObjectID"
  LEFT JOIN public."M_Parts" p ON o."PartsID" = p."PartsID"
  LEFT JOIN public."M_Materials" m ON o."MaterialID" = m."MaterialID"
  LEFT JOIN public."M_DamageKinds" dk ON o."DamageKindID" = dk."DamageKindID"
  LEFT JOIN public."M_DamageLevels" dl ON o."DamageLevelID" = dl."DamageLevelID"
  -- Join with D_CheckingPhotos table to get photos related to CheckingID
  LEFT JOIN public."D_CheckingPhotos" cp ON o."CheckingID" = cp."CheckingID"
  WHERE o."ObjectID" = $1  -- Add condition to filter by ObjectID (bridgeId)
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
    b."BridgeName", 
    dl."DamageLevel"
  ORDER BY o."CheckingID" ASC;
`;



  try {
    // Execute the query with the bridgeId parameter
    const result = await pool.query(query, [bridgeId]);

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


// API endpoint to fetch ObjectID, BridgeName, and coordinates (XCentroID, YCentroID)
app.get("/api/bridgecoordinates", async (req, res) => {
  const { 
    district = "%", 
    zone = "%", 
    southWestLat, 
    southWestLng, 
    northEastLat, 
    northEastLng 
  } = req.query; // Default district and zone to '%' for wildcard matching

  // Initialize query parameters and WHERE clauses
  const queryParams = [];
  const whereClauses = [];

  // Add condition for ZoneID if provided
  if (zone !== "%") {
    queryParams.push(zone);
    whereClauses.push(`"ZoneID"::text ILIKE $${queryParams.length}`);
  }

  // Add condition for DistrictID if provided
  if (district !== "%") {
    queryParams.push(district);
    whereClauses.push(`"DistrictID"::text ILIKE $${queryParams.length}`);
  }

  // Add conditions for bounding box if all coordinates are provided
  if (southWestLat && southWestLng && northEastLat && northEastLng) {
    queryParams.push(parseFloat(southWestLat), parseFloat(northEastLat));
    whereClauses.push(`"YCentroID" BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);

    queryParams.push(parseFloat(southWestLng), parseFloat(northEastLng));
    whereClauses.push(`"XCentroID" BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
  }

  // Base SQL query
  let query = `
    SELECT 
      "ObjectID", 
      "BridgeName", 
      "XCentroID", 
      "YCentroID"
    FROM public."D_Objects"
  `;

  // Add WHERE clause if filters exist
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  // Limit the results
  // query += ` LIMIT 1000;`;

  try {
    // Query execution with parameters
    const result = await pool.query(query, queryParams);

    // Check if any data is returned
    if (result.rows.length > 0) {
      res.status(200).json(result.rows); // Send the result as JSON
    } else {
      res.status(404).json({ message: "No bridge data found" });
    }
  } catch (error) {
    console.error("Error fetching bridge coordinates:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/structure_type", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, structure_type FROM bms.tbl_structure_types'
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


app.get("/api/construction_type", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, construction_type FROM bms.tbl_construction_types'
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
      'SELECT id,district FROM bms.tbl_districts'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
