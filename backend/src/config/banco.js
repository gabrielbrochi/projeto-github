require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min: parseInt(process.env.POOL_MIN, 10) || 2,
  max: parseInt(process.env.POOL_MAX, 10) || 10,
});

module.exports = pool;
