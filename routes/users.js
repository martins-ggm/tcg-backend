const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../auth/authMiddleware");

router.post("/create", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query =
      "INSERT INTO users (user_name, email, password) VALUES ($1, $2, $3) RETURNING *";

    const values = [username, email, hashedPassword];
    const newUser = await pool.query(query, values);

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "E-mail ou senha incorretos" });
    }
    const token = jwt.sign(
      { id: user.rows[0].id, name: user.rows[0].user_name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: { id: user.rows[0].id, name: user.rows[0].user_name },
    });
  } catch (err) {
    console.error("--- LOGIN ERROR! ---");
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    query = "select user_name,created_at,profile_icon from users where id = $1";
    values = [user_id];

    const result = await pool.query(query, values);
    res.json(result);
  } catch (error) {
    console.log("ERROR: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
});


router.get("/profile/image", auth, async (req, res) => {
  try {
    const user_id = req.user.id;

    query = "select profile_icon from users where id = $1";
    values = [user_id];

    const result = await pool.query(query, values);
    res.json(result);
  } catch (error) {
    console.log("ERROR: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
});

module.exports = router;
