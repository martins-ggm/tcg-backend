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
      params: { q: `name:${name}*`, pageSize: 20 },
      headers: { "X-Api-Key": "7e758781-16cc-466b-9a33-a9aac1d9f4dd" },
    });

    const simplifiedCards = response.data.data.map((card) => ({
      id: card.id,
      name: card.name,
      imageUrl: card.images.small,
      rarity: card.rarity || "Common",
    }));

    res.json(simplifiedCards);
  } catch (error) {
    console.error("Erro na API:", error.message);
    res.status(500).json({ error: "Erro ao buscar cartas" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
