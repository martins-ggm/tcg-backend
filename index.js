const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3000;

app.get("/cards", async (req, res) => {
  const { name } = req.query;
  console.log(`Searching by ${name}`);

  try {
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards`, {
      timeout: 90000,
      params: { q: `name:${name}*`, pageSize: 20 },
      headers: { "X-Api-Key": "7e758781-16cc-466b-9a33-a9aac1d9f4dd" },
    });

    const simplifiedCards = response.data.data.map((card) => ({
      id: card.id,
      name: card.name,
      imageSmall: card.images.small,
      imageLarge: card.images.large,
      rarity: card.rarity || "Common",
    }));

    res.json(simplifiedCards);
  } catch (error) {
    console.error("Erro na API Externa:", error.code || error.message);
    res.status(504).json({ error: "A API do Pokémon demorou para responder" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Pokedex",
  password: "THuvv2023!",
  port: 5432,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro ao conectar no Postgres:", err);
  } else {
    console.log("Postgres conectado com sucesso!");
  }
});

app.post("/collection/update", async (req, res) => {
  const { userId, cardId, quantity } = req.body;

  try {
    const query = `ISERT INTO user_collection (user_id, card_id, quantity) VALUES ($1, $2, $3) on CONFLICT (user_id, card_id) DO UPDATE SET quantity = EXCLUEDED.quantity RETURNING *;`;

    const values = [userId, cardId, quantity];
    const result = await pool.query(query, values);

    console.log(`Card ${cardId} atualizado para ${quantity}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao salvar no banco:", err.message);
    res.status(500).json({ error: "Erro ao salvar na coleção" });
  }
});
