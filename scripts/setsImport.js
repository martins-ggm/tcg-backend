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

const setsDirPath = path.join(__dirname, "../../pokemon-tcg-data/sets");

async function importSets() {
  try {
    await client.connect();
    console.log("✅ Conectado ao PostgreSQL!");

    const files = fs.readdirSync(setsDirPath);
    console.log(`📂 Arquivos encontrados: ${files.length}`);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(setsDirPath, file);
        const setsArray = JSON.parse(fs.readFileSync(filePath, "utf8"));


        console.log(`➡️  Importing ${file} (${setsArray.length} sets)...`);

        for (const set of setsArray) {
          if (!set) continue;

          const query = `
            INSERT INTO pokemon_sets (
                id, name, series, printed_total, total, legalities, ptcgo_code, 
                release_date, updated_at, images
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING;
          `;

          const values = [
            set.id,
            set.name,
            set.series,
            set.printedTotal || null,
            set.total,
            JSON.stringify(set.legalities || []),
            set.ptcgoCode, // set_id (ex: base1)
            set.releaseDate,
            set.updatedAt,
            JSON.stringify(set.images)
           
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

importSets();
