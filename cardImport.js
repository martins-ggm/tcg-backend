const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "Pokedex",
  password: "THuvv2023!",
  port: 5432,
});

const cardsDirPath = path.join(__dirname, "../pokemon-tcg-data/cards/en");

async function importCards() {
  try {
    await client.connect();
    console.log("✅ Conectado ao PostgreSQL!");

    const files = fs.readdirSync(cardsDirPath);
    console.log(`📂 Arquivos encontrados: ${files.length}`);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(cardsDirPath, file);
        const cardsArray = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // O set_id será o nome do arquivo sem o .json (ex: base1)
        const setIdFromFileName = file.replace(".json", "");

        console.log(`➡️  Importando ${file} (${cardsArray.length} cartas)...`);

        for (const card of cardsArray) {
          // Se por algum motivo o card for null, pula para o próximo
          if (!card) continue;

          const query = `
            INSERT INTO pokemon_cards (
                id, name, supertype, hp, types, rules, attacks, 
                weaknesses, set_id, set_name, number, rarity, images
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING;
          `;

          const values = [
            card.id,
            card.name,
            card.supertype,
            card.hp || null,
            JSON.stringify(card.types || []),
            JSON.stringify(card.rules || []),
            JSON.stringify(card.attacks || []),
            JSON.stringify(card.weaknesses || []),
            setIdFromFileName, // set_id (ex: base1)
            setIdFromFileName, // set_name (temporariamente igual ao ID)
            card.number,
            card.rarity || "Common",
            JSON.stringify(card.images || {}),
          ];

          await client.query(query, values);
        }
        console.log(`✅ ${file} importado.`);
      }
    }
    console.log("\n--- ✨ IMPORTAÇÃO CONCLUÍDA! ---");
  } catch (err) {
    console.error("❌ ERRO CRÍTICO:", err);
  } finally {
    await client.end();
    console.log("🔌 Conexão encerrada.");
  }
}

importCards();
