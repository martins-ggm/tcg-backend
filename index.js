const express = require("express");
const cors = require("cors");
const cardRoutes = require("./routes/cards");

const app = express();
app.use(cors());
app.use(express.json());

// Monta as rotas: tudo que estiver em cardRoutes terá o prefixo /api
app.use("/cards", cardRoutes); 

app.listen(3000, () => {
  console.log("Server runing in: http://localhost:3000");
});