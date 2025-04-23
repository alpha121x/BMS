// dailyPricesApi.js

const express = require('express');
const { Pool } = require('pg');
const ExcelJS = require('exceljs');

// Initialize Express app
const app = express();

// PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: '172.20.82.84',
  database: 'db_price_control_punjab',
  password: 'diamondx',
  port: 5432, // default Postgres port
});

// API to download Daily Prices Excel
app.get('/download-daily-prices', async (req, res) => {
    try {
      // Read 'date' from query parameters
      const targetDate = req.query.date;
  
      if (!targetDate) {
        return res.status(400).send('Missing required "date" parameter');
      }
  
      // Query
      const result = await pool.query(
        `SELECT * FROM pc_daily_data($1, $2, $3)`,
        [targetDate, '', '']
      );
  
      const data = result.rows;
  
      // Create Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Daily Prices');
  
      if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]).map(key => ({
          header: key,
          key: key,
          width: 20,
        }));
  
        data.forEach(row => {
          worksheet.addRow(row);
        });
      }
  
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=DailyPrices_${targetDate}.xlsx`
      );
  
      await workbook.xlsx.write(res);
      res.end();
  
    } catch (err) {
      console.error('Error generating Excel:', err);
      res.status(500).send('Internal Server Error');
    }
  });

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
