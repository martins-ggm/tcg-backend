const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Pokedex",
  password: "THuvv2023!",
  port: 5432,
});

module.exports = pool;

