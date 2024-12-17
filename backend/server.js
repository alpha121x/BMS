const express = require("express");
const jwt = require("jsonwebtoken"); // Correctly import jsonwebtoken for JWT handling
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const JWT_SECRET = "123456789"; // Replace with an environment variable for production

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

// API endpoint to fetch bridge data with filtering by ZoneID and DistrictID
app.get("/api/bridges", async (req, res) => {
  const { district, zone } = req.query; // Receive 'district' and 'zone' from the query parameters

  let queryParams = [];
  let whereClauses = [];

  // Add condition for ZoneID if provided
  if (zone) {
    queryParams.push(zone);
    whereClauses.push(`o."ZoneID"::text ILIKE $${queryParams.length}`);
  }

  // Add condition for DistrictID if provided
  if (district) {
    queryParams.push(district);
    whereClauses.push(`o."DistrictID"::text ILIKE $${queryParams.length}`);
  }

  // Base query
  let query = `
    SELECT 
      o."ObjectID", 
      o."BridgeName", 
      st."StructureTypeName" AS "StructureType", 
      o."ConstructionYear", 
      z."ZoneName" AS "Zone", 
      d."DistrictsName" AS "District",
      r."RoadName" AS "Road",
      c."ConstructionTypeName" AS "ConstructionType", 
      o."SurveyID", 
      o."RoadClassificationID", 
      cw."CarriagewayTypeName" AS "CarriagewayType",
      rs."RoadSurfaceTypeName" AS "RoadSurfaceType",
      rc."RoadClassificationName" AS "RoadClassification",
      vc."VisualConditionName" AS "VisualCondition",
      dr."DirectionName" AS "Direction",
      o."LastMaintenanceDate",
      o."WidthOfStructureM" AS "WidthStructure",
      o."SpanLengthM" AS "SpanLength",
      o."NumberOfSpan" AS "Spans",
      o."XCentroID" AS "Latitude",
      o."YCentroID" AS "Longitude",
      COALESCE(array_agg(DISTINCT ep."PhotoPath") FILTER (WHERE ep."PhotoPath" IS NOT NULL), '{}') AS "Photos"
    FROM public."D_Objects" o
    INNER JOIN public."M_StructureTypes" st ON o."StructureTypeID" = st."StructureTypeID"
    INNER JOIN public."M_Zones" z ON o."ZoneID" = z."ZoneID"
    INNER JOIN public."M_Districts" d ON o."DistrictID" = d."DistrictsID"
    INNER JOIN public."M_Roads" r ON o."RoadNumber" = r."RoadNumber"
    INNER JOIN public."M_ConstructionTypes" c ON o."ConstructionTypeID" = c."ConstructionTypeID"
    INNER JOIN public."M_CarriagewayType" cw ON o."CarriagewayType" = cw."CarriagewayTypeID"
    INNER JOIN public."M_RoadSurfaceTypes" rs ON o."RoadSurfaceTypeID" = rs."RoadSurfaceTypeID"
    INNER JOIN public."M_RoadClassifications" rc ON o."RoadClassificationID" = rc."RoadClassificationID"
    INNER JOIN public."M_Directions" dr ON o."DirectionID" = dr."DirectionID"
    INNER JOIN public."M_VisualConditions" vc ON o."VisualConditionID" = vc."VisualConditionID"
    LEFT JOIN public."D_ExteriorPhotos" ep ON o."ObjectID" = ep."ObjectID"
  `;

  // Add WHERE clause if filters exist
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  query += `
    GROUP BY 
      o."ObjectID", 
      o."BridgeName", 
      o."ConstructionYear", 
      z."ZoneName", 
      d."DistrictsName", 
      r."RoadName", 
      c."ConstructionTypeName", 
      st."StructureTypeName", 
      cw."CarriagewayTypeName", 
      rs."RoadSurfaceTypeName", 
      rc."RoadClassificationName", 
      vc."VisualConditionName", 
      dr."DirectionName", 
      o."SurveyID",
      o."RoadClassificationID", 
      o."LastMaintenanceDate", 
      o."WidthOfStructureM", 
      o."SpanLengthM", 
      o."NumberOfSpan",
      o."XCentroID",
      o."YCentroID"
    ORDER BY o."ObjectID" ASC;
  `;

  try {
    // Query execution with parameters
    const result = await pool.query(query, queryParams);

    // Send the result rows as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching bridge data:", error.message);
    res.status(500).json({ error: "An error occurred while fetching bridge data." });
  }
});

// API endpoint to fetch checkings data without filtering
app.get("/api/checkings", async (req, res) => {
  // Base query (fetches all data)
  let query = `
    SELECT 
      o."CheckingID", 
      o."ObjectID", 
      o."WorkKindID", 
      o."PartsID", 
      o."MaterialID", 
      o."SpanIndex", 
      o."DamageKindID", 
      o."DamageLevelID", 
      o."Remarks"
    FROM public."D_Checkings" o
    ORDER BY o."CheckingID" ASC;
  `;

  try {
    // Execute the query without parameters
    const result = await pool.query(query);

    // Return the rows as JSON
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching checkings data:", error.message);
    res.status(500).json({ error: "An error occurred while fetching checkings data." });
  }
});

// API route to get Zones data
app.get('/api/zones', async (req, res) => {
  try {
    const result = await pool.query('SELECT "ZoneID", "ZoneName" FROM public."M_Zones"');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API route to get Districts
app.get('/api/districts', async (req, res) => {
  try {
    const result = await pool.query('SELECT "DistrictsID", "DistrictsName" FROM public."M_Districts"');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
