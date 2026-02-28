const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "No text on search" });
  }

  try {
    console.log(`Searching for: ${name}`);

    const query = `
        SELECT 
          pokemon.id, 
          pokemon.name, 
          pokemon.images->>'small' as "imageSmall",
          pokemon.images->>'large' as "imageLarge",
          pokemon.rarity,
          pokemon.types,
          set.name as set_name,
          to_char(set.release_date, 'DD FMMonth YYYY') as release_date
        
        FROM pokemon_cards as pokemon
        inner join pokemon_sets as set on pokemon.set_id = set.id  
        WHERE pokemon.name ILIKE $1 
      `;
    const values = [`%${name}%`];

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
});

router.get("/mycards", async (req, res) => {
  const { userId, name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "No text on search" });
  }

  try {
    console.log(`Searching for: ${name}`);

    const query = `
       select pc.id, pc.name,pc.images->>'small' as imageSmall,pc.images->>'large' as imageLarge,pc.rarity,pc.types,set.name as set_name,to_char(set.release_date, 'DD FMMonth YYYY') as release_date,us.card_id from pokemon_cards as pc inner join pokemon_sets as set on pc.set_id = set.id inner join user_cards as us on us.card_id = pc.id where us.user_id = $1 and pc.name ILIKE $2
      `;
    const values = [userId, `%${name}%`];

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
});

router.post("/collection/update", async (req, res) => {
  const { userId, cardId, quantity } = req.body;
  try {
    const query = `
     INSERT INTO user_cards (user_id, card_id, quantity, added_at) 
      VALUES ($1,$2 ,$3, NOW()) 
      ON CONFLICT (user_id, card_id) 
      DO UPDATE SET quantity = EXCLUDED.quantity 
      RETURNING *;
      `;

    const values = [userId, cardId, quantity];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error on collection update" });
  }
});

router.get("/collection/get/amount", async (req, res) => {
  const { userId, cardId } = req.query;

  try {
    const query =
      "select quantity from user_cards where user_id = $1 and card_id = $2";

    const values = [userId, cardId];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("error on get amount from card", error.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/collection/get", async (req, res) => {
  const { userId } = req.query;

  try {
    const query =
      "select pc.name,pc.images->>'small' as imageSmall,pc.images->>'large' as imageLarge,pc.rarity,pc.types,set.name as set_name,to_char(set.release_date, 'DD FMMonth YYYY') as release_date,us.card_id from pokemon_cards as pc inner join pokemon_sets as set on pc.set_id = set.id inner join user_cards as us on us.card_id = pc.id where us.user_id = $1 order by added_at desc";
    const values = [userId];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("error on get card collections", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/collection/getlatest", async (req, res) => {
  const { userId } = req.query;

  try {
    const query =
      "select pc.name,pc.images->>'small' as imageSmall,pc.images->>'large' as imageLarge,pc.rarity,pc.types,set.name as set_name,to_char(set.release_date, 'DD FMMonth YYYY') as release_date,us.card_id from pokemon_cards as pc inner join pokemon_sets as set on pc.set_id = set.id inner join user_cards as us on us.card_id = pc.id where us.user_id = $1 order by added_at desc limit 20";
    const values = [userId];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("error on get card collections", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/collection/remove", async (req, res) => {
  const { userId, cardId } = req.query;

  try {
    const query = "delete from user_cards where user_id = $1 and card_id = $2";
    const values = [userId, cardId];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("error on delete card from collection", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/collection/getfavorite", async (req, res) => {
  const { userId } = req.query;

  try {
    const query =
      "select pc.name,pc.images->>'small' as imageSmall,pc.images->>'large' as imageLarge,pc.rarity,pc.types,set.name as set_name,to_char(set.release_date, 'DD FMMonth YYYY') as release_date,us.card_id from pokemon_cards as pc inner join pokemon_sets as set on pc.set_id = set.id inner join user_cards as us on us.card_id = pc.id where us.user_id = $1 and favorite is true";
    const values = [userId];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("error on get card collections", e.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
